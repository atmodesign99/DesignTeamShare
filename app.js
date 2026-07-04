const STORAGE_KEY = 'shareSplitCalculatorState.v1.2';
const OLD_STORAGE_KEY = 'shareSplitCalculatorState.v1.1';
const LEGACY_STORAGE_KEY = 'shareSplitCalculatorState.v1';
const ARCHIVE_KEY = 'shareSplitCalculatorArchive.v1';

const $ = (selector) => document.querySelector(selector);

function safeStorageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* در حالت پیش‌نمایش بدون ذخیره ادامه بده */ }
}
function safeStorageRemove(key) {
  try { localStorage.removeItem(key); } catch { /* بی‌اثر */ }
}

function createDefaultState() {
  return {
    projectName: '',
    clientName: '',
    projectAmount: '',
    directCosts: '',
    fundPercent: SETTINGS.studioFundPercent,
    category: 'همه',
    serviceSearch: '',
    serviceCode: 'ID-001',
    members: [],
    packages: [],
    mgmt: { enabled: false, percent: SETTINGS.managementPercent, shares: {} },
    marketing: { enabled: false, percent: SETTINGS.marketingPercent, shares: {} },
    nextMemberId: 1,
    nextPackageId: 1,
    nextSubtaskId: 1,
  };
}

let state = createDefaultState();
let latestCalc = null;

/* ---------- formatting / utils ---------- */

function formatMoney(value) {
  const n = Number.isFinite(value) ? value : 0;
  const rounded = Math.round(n) || 0;
  return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(rounded) + ' ' + SETTINGS.currencyLabel;
}

function formatNumber(value, digits = 1) {
  return new Intl.NumberFormat('fa-IR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatPercent(ratio, digits = 1) {
  return formatNumber(ratio * 100, digits) + '٪';
}

function todayFa() {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date());
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[ي]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .trim();
}

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function memberIds() {
  return state.members.map((m) => m.id);
}

function makeEqualShares(ids = memberIds()) {
  const shares = {};
  if (!ids.length) return shares;
  const base = Math.floor((100 / ids.length) * 10) / 10;
  let used = 0;
  ids.forEach((id, index) => {
    const value = index === ids.length - 1 ? Math.round((100 - used) * 10) / 10 : base;
    shares[id] = value;
    used += value;
  });
  return shares;
}

function ensureSharesForMembers(shares = {}, fallbackEqual = false) {
  const ids = memberIds();
  if (fallbackEqual && ids.length) return makeEqualShares(ids);
  const normalized = {};
  ids.forEach((id) => { normalized[id] = clampNumber(shares[id], 0, 100, 0); });
  return normalized;
}

function packageWeight(pkg) {
  const complexity = COMPLEXITY_OPTIONS.find((opt) => opt.value === pkg.complexity) || COMPLEXITY_OPTIONS[1];
  return pkg.baseMillion * pkg.quantity * complexity.factor;
}

function shareSum(shares) {
  return state.members.reduce((sum, m) => sum + clampNumber(shares?.[m.id], 0, 100, 0), 0);
}

function shareIsOk(shares) {
  return Math.abs(shareSum(shares) - 100) < 0.5;
}

function subtaskWeightSum(pkg) {
  return (pkg.subtasks || []).reduce((sum, item) => sum + clampNumber(item.weightPercent, 0, 100, 0), 0);
}

function packageSplitStatus(pkg) {
  if (pkg.useSubtasks) {
    const hasSubtasks = Array.isArray(pkg.subtasks) && pkg.subtasks.length > 0;
    const weightOk = hasSubtasks && Math.abs(subtaskWeightSum(pkg) - 100) < 0.5;
    const sharesOk = hasSubtasks && pkg.subtasks.every((item) => shareIsOk(item.shares));
    return { ok: weightOk && sharesOk, weightOk, sharesOk, direct: false };
  }
  return { ok: shareIsOk(pkg.shares), weightOk: true, sharesOk: shareIsOk(pkg.shares), direct: true };
}

function nextSubtaskId() {
  const id = state.nextSubtaskId || 1;
  state.nextSubtaskId = id + 1;
  return id;
}

function getDefaultTemplateKey(pkg) {
  if (!pkg || pkg.custom) return 'general_custom';
  return DEFAULT_SUBTASK_TEMPLATE_BY_CODE[pkg.code] || 'general_custom';
}

function getTemplate(templateKey) {
  return SUBTASK_TEMPLATES[templateKey] || SUBTASK_TEMPLATES.general_custom;
}

function templateToSubtasks(template) {
  return (template?.items || SUBTASK_TEMPLATES.general_custom.items).map((item) => ({
    id: nextSubtaskId(),
    title: item.title,
    weightPercent: item.weightPercent,
    shares: makeEqualShares(),
  }));
}

/* ---------- state ---------- */

function migratePackage(pkg) {
  return {
    id: pkg.id,
    code: pkg.code || 'CUSTOM',
    title: pkg.title || 'بسته کاری',
    unit: pkg.unit || 'پروژه',
    baseMillion: clampNumber(pkg.baseMillion, 0.1, 99999, 1),
    quantity: clampNumber(pkg.quantity, 0.1, 99999, 1),
    complexity: pkg.complexity || 'medium',
    custom: Boolean(pkg.custom),
    shares: ensureSharesForMembers(pkg.shares || {}, !pkg.shares),
    useSubtasks: Boolean(pkg.useSubtasks),
    subtasks: Array.isArray(pkg.subtasks)
      ? pkg.subtasks.map((st) => ({
          id: st.id || nextSubtaskId(),
          title: st.title || 'زیربخش',
          weightPercent: clampNumber(st.weightPercent, 0, 100, 0),
          shares: ensureSharesForMembers(st.shares || {}, !st.shares),
        }))
      : [],
  };
}

function normalizeState() {
  state.fundPercent = clampNumber(state.fundPercent, 0, 30, SETTINGS.studioFundPercent);
  state.members = Array.isArray(state.members) ? state.members.map((m, i) => ({ id: m.id || i + 1, name: m.name || `عضو ${i + 1}` })) : [];
  state.nextMemberId = Math.max(state.nextMemberId || 1, state.members.reduce((max, m) => Math.max(max, m.id), 0) + 1);
  state.nextPackageId = Math.max(state.nextPackageId || 1, Array.isArray(state.packages) ? state.packages.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1 : 1);
  state.nextSubtaskId = state.nextSubtaskId || 1;
  state.mgmt = { ...createDefaultState().mgmt, ...(state.mgmt || {}) };
  state.mgmt.shares = ensureSharesForMembers(state.mgmt.shares || {}, false);
  state.marketing = { ...createDefaultState().marketing, ...(state.marketing || {}) };
  state.marketing.shares = ensureSharesForMembers(state.marketing.shares || {}, false);
  state.packages = Array.isArray(state.packages) ? state.packages.map(migratePackage) : [];
  state.packages.forEach((pkg) => {
    pkg.shares = ensureSharesForMembers(pkg.shares || {}, false);
    pkg.subtasks.forEach((st) => { st.shares = ensureSharesForMembers(st.shares || {}, false); });
  });
}

function loadState() {
  try {
    const saved = JSON.parse(safeStorageGet(STORAGE_KEY) || safeStorageGet(OLD_STORAGE_KEY) || safeStorageGet(LEGACY_STORAGE_KEY));
    if (saved) state = { ...createDefaultState(), ...saved, mgmt: { ...createDefaultState().mgmt, ...(saved.mgmt || {}) }, marketing: { ...createDefaultState().marketing, ...(saved.marketing || {}) } };
  } catch (error) {
    console.warn('Could not load saved state', error);
  }
  normalizeState();
}

function saveState() {
  safeStorageSet(STORAGE_KEY, JSON.stringify(state));
}

function persistAndCalculate() {
  normalizeState();
  saveState();
  calculateAndRender();
}

/* ---------- members ---------- */

function addMember() {
  const input = $('#newMemberName');
  const name = input.value.trim();
  if (!name) {
    showToast('اول نام عضو را بنویس.');
    input.focus();
    return;
  }
  if (state.members.length >= SETTINGS.maxMembers) {
    showToast('به سقف تعداد اعضا رسیدی.');
    return;
  }
  if (state.members.some((m) => m.name === name)) {
    showToast('عضوی با این نام قبلاً اضافه شده.');
    return;
  }
  const member = { id: state.nextMemberId++, name };
  state.members.push(member);
  state.packages.forEach((pkg) => {
    pkg.shares[member.id] = 0;
    (pkg.subtasks || []).forEach((st) => { st.shares[member.id] = 0; });
  });
  state.mgmt.shares[member.id] = 0;
  state.marketing.shares[member.id] = 0;
  input.value = '';
  renderMembers();
  renderPackages();
  renderMgmt();
  persistAndCalculate();
  showToast(`«${name}» به پروژه اضافه شد.`);
}

function removeMember(id) {
  state.members = state.members.filter((m) => m.id !== id);
  state.packages.forEach((pkg) => {
    delete pkg.shares[id];
    (pkg.subtasks || []).forEach((st) => { delete st.shares[id]; });
  });
  delete state.mgmt.shares[id];
  delete state.marketing.shares[id];
  renderMembers();
  renderPackages();
  renderMgmt();
  persistAndCalculate();
}

function renderMembers() {
  const host = $('#memberList');
  if (!state.members.length) {
    host.innerHTML = '<p class="empty-state">هنوز عضوی اضافه نشده است. برای تقسیم سهم، حداقل دو عضو لازم است.</p>';
    return;
  }
  host.innerHTML = state.members
    .map((member) => `
      <div class="member-row compact">
        <div class="member-row-main">
          <strong>${escapeHtml(member.name)}</strong>
          <span class="helper">عضو پروژه</span>
        </div>
        <button class="icon-btn" type="button" title="حذف عضو" aria-label="حذف ${escapeHtml(member.name)}" data-remove-member="${member.id}">×</button>
      </div>`)
    .join('');

  host.querySelectorAll('[data-remove-member]').forEach((btn) => {
    btn.addEventListener('click', () => removeMember(Number(btn.dataset.removeMember)));
  });
}

/* ---------- service picker ---------- */

function initCategories() {
  const categories = ['همه', ...new Set(TARIFFS.map((item) => item.category))];
  $('#categorySelect').innerHTML = categories
    .map((cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`)
    .join('');
}

function updateServiceOptions(selectFirst = false) {
  const select = $('#serviceSelect');
  const search = normalize(state.serviceSearch);
  let options = TARIFFS.filter((item) => state.category === 'همه' || item.category === state.category);
  if (search) options = options.filter((item) => normalize(`${item.service} ${item.category} ${item.code}`).includes(search));
  if (!options.length) {
    select.innerHTML = '<option value="">خدمتی پیدا نشد</option>';
    $('#serviceNote').textContent = 'عبارت جست‌وجو یا دسته‌بندی را تغییر بده.';
    return;
  }
  const grouped = options.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});
  select.innerHTML = Object.entries(grouped)
    .map(([category, items]) => {
      const optionHtml = items
        .map((item) => `<option value="${item.code}">${escapeHtml(item.service)} — ${formatNumber(item.baseMillion, 2)} م</option>`)
        .join('');
      return `<optgroup label="${escapeHtml(category)}">${optionHtml}</optgroup>`;
    })
    .join('');
  const currentExists = options.some((item) => item.code === state.serviceCode);
  if (selectFirst || !currentExists) state.serviceCode = options[0].code;
  select.value = state.serviceCode;
  renderServiceNote();
}

function renderServiceNote() {
  const tariff = TARIFFS.find((item) => item.code === state.serviceCode);
  if (!tariff) return;
  $('#serviceNote').textContent = tariff.note ? `${tariff.code} — ${tariff.note}` : `${tariff.code} — واحد: ${tariff.unit}`;
}

/* ---------- packages ---------- */

function requireTwoMembers() {
  if (state.members.length < 2) {
    showToast('برای تقسیم سهم، حداقل دو عضو پروژه را اضافه کن.');
    return false;
  }
  return true;
}

function defaultShares() {
  return makeEqualShares();
}

function addPackageFromTariff() {
  const tariff = TARIFFS.find((item) => item.code === state.serviceCode);
  if (!tariff) {
    showToast('اول یک خدمت معتبر انتخاب کن.');
    return;
  }
  if (!requireTwoMembers()) return;
  const quantity = clampNumber($('#quantity').value, 0.1, 99999, 1);
  state.packages.push({
    id: state.nextPackageId++,
    code: tariff.code,
    title: tariff.service,
    unit: tariff.unit,
    baseMillion: tariff.baseMillion,
    quantity,
    complexity: 'medium',
    custom: false,
    shares: defaultShares(),
    useSubtasks: false,
    subtasks: [],
  });
  renderPackages();
  persistAndCalculate();
  showToast('بسته به پروژه اضافه شد.');
}

function addCustomPackage() {
  const title = $('#customTitle').value.trim();
  const base = clampNumber($('#customBase').value, 0.1, 99999, NaN);
  const qtyInput = $('#customQty');
  const quantity = clampNumber(qtyInput?.value, 0.1, 99999, 1);
  if (!title) {
    showToast('عنوان بسته‌ی خارج از نرخ‌نامه را بنویس.');
    $('#customTitle').focus();
    return;
  }
  if (!Number.isFinite(base)) {
    showToast('ارزش معادل را به میلیون تومان وارد کن.');
    $('#customBase').focus();
    return;
  }
  if (!requireTwoMembers()) return;
  state.packages.push({
    id: state.nextPackageId++,
    code: 'CUSTOM',
    title,
    unit: 'پروژه',
    baseMillion: base,
    quantity,
    complexity: 'medium',
    custom: true,
    shares: defaultShares(),
    useSubtasks: false,
    subtasks: [],
  });
  $('#customTitle').value = '';
  $('#customBase').value = '';
  if (qtyInput) qtyInput.value = '1';
  renderPackages();
  persistAndCalculate();
  showToast('بسته‌ی خارج از نرخ‌نامه اضافه شد.');
}

function removePackage(id) {
  state.packages = state.packages.filter((pkg) => pkg.id !== id);
  renderPackages();
  persistAndCalculate();
}

function splitPackageEqually(id) {
  const pkg = state.packages.find((p) => p.id === id);
  if (!pkg) return;
  if (pkg.useSubtasks) {
    (pkg.subtasks || []).forEach((st) => { st.shares = makeEqualShares(); });
  } else {
    pkg.shares = makeEqualShares();
  }
  renderPackages();
  persistAndCalculate();
}

function toggleSubtasks(id) {
  const pkg = state.packages.find((p) => p.id === id);
  if (!pkg) return;
  pkg.useSubtasks = !pkg.useSubtasks;
  if (pkg.useSubtasks && (!pkg.subtasks || !pkg.subtasks.length)) {
    const template = getTemplate(getDefaultTemplateKey(pkg));
    pkg.subtasks = templateToSubtasks(template);
    showToast(`الگوی پیشنهادی «${template.label}» اعمال شد.`);
  }
  renderPackages();
  persistAndCalculate();
}

function addSubtask(pkgId) {
  const pkg = state.packages.find((p) => p.id === pkgId);
  if (!pkg) return;
  pkg.useSubtasks = true;
  pkg.subtasks = pkg.subtasks || [];
  pkg.subtasks.push({ id: nextSubtaskId(), title: `زیربخش ${pkg.subtasks.length + 1}`, weightPercent: 0, shares: makeEqualShares() });
  renderPackages();
  persistAndCalculate();
}

function removeSubtask(pkgId, subtaskId) {
  const pkg = state.packages.find((p) => p.id === pkgId);
  if (!pkg) return;
  pkg.subtasks = (pkg.subtasks || []).filter((st) => st.id !== subtaskId);
  if (!pkg.subtasks.length) pkg.useSubtasks = false;
  renderPackages();
  persistAndCalculate();
}

function applySubtaskTemplate(pkgId, templateKey) {
  const pkg = state.packages.find((p) => p.id === pkgId);
  const resolvedKey = templateKey === 'default' ? getDefaultTemplateKey(pkg) : templateKey;
  const template = getTemplate(resolvedKey);
  if (!pkg || !template) return;
  pkg.useSubtasks = true;
  pkg.subtasks = templateToSubtasks(template);
  renderPackages();
  persistAndCalculate();
  showToast(`الگوی «${template.label}» اعمال شد.`);
}

function renderShareCells(shares, datasetKey, datasetValue, extraAttrs = '') {
  if (!state.members.length) return '<p class="empty-state">اول عضو اضافه کنید.</p>';
  return state.members
    .map((m) => `
      <label class="share-cell">
        <span>${escapeHtml(m.name)}</span>
        <div class="share-input-wrap">
          <input type="number" min="0" max="100" step="1" value="${clampNumber(shares?.[m.id], 0, 100, 0)}" data-${datasetKey}="${datasetValue}" data-share-member="${m.id}" ${extraAttrs} />
          <span class="share-unit">٪</span>
        </div>
      </label>`)
    .join('');
}

function renderShareGrid(shares, datasetKey, datasetValue, extraAttrs = '') {
  return `<div class="share-grid">${renderShareCells(shares, datasetKey, datasetValue, extraAttrs)}</div>`;
}

function renderSubtasks(pkg) {
  if (!pkg.useSubtasks) return '';
  const weightSum = subtaskWeightSum(pkg);
  const weightOk = Math.abs(weightSum - 100) < 0.5;
  const subtasks = pkg.subtasks || [];
  const rows = subtasks.length
    ? subtasks.map((st) => {
        const sum = shareSum(st.shares);
        const ok = shareIsOk(st.shares);
        return `
          <div class="subtask-card ${ok ? '' : 'share-error'}" data-subtask-card="${pkg.id}-${st.id}">
            <div class="subtask-head">
              <label class="field subtask-title-field">
                <span>عنوان زیربخش</span>
                <input type="text" value="${escapeHtml(st.title)}" data-subtask-title="${pkg.id}" data-subtask-id="${st.id}" />
              </label>
              <label class="field subtask-weight-field">
                <span>وزن از بسته</span>
                <div class="share-input-wrap">
                  <input type="number" min="0" max="100" step="1" value="${clampNumber(st.weightPercent, 0, 100, 0)}" data-subtask-weight="${pkg.id}" data-subtask-id="${st.id}" />
                  <span class="share-unit">٪</span>
                </div>
              </label>
              <button class="icon-btn" type="button" title="حذف زیربخش" data-remove-subtask="${pkg.id}" data-subtask-id="${st.id}">×</button>
            </div>
            ${renderShareGrid(st.shares, 'share-subtask', `${pkg.id}-${st.id}`)}
            <small class="share-status ${ok ? 'ok' : 'warn'}">جمع تقسیم زیربخش: ${formatNumber(sum, 0)}٪ ${ok ? '✓' : '— باید ۱۰۰٪ شود'}</small>
          </div>`;
      }).join('')
    : '<p class="empty-state">هنوز زیربخشی اضافه نشده است.</p>';

  return `
    <div class="subtask-section">
      <div class="mini-head compact-head">
        <strong>زیربخش‌های بسته</strong>
        <span data-subtask-weight-status="${pkg.id}" class="${weightOk ? '' : 'warning-chip'}">جمع وزن زیربخش‌ها: ${formatNumber(weightSum, 0)}٪ ${weightOk ? '✓' : '— باید ۱۰۰٪ شود'}</span>
      </div>
      <div class="subtask-toolbar">
        <button class="small-btn" type="button" data-add-subtask="${pkg.id}">+ زیربخش</button>
        <button class="small-btn emphasis" type="button" data-template="default" data-package="${pkg.id}">اعمال الگوی پیشنهادی: ${escapeHtml(getTemplate(getDefaultTemplateKey(pkg)).label)}</button>
        ${FEATURED_SUBTASK_TEMPLATE_KEYS
          .filter((key) => key !== getDefaultTemplateKey(pkg))
          .map((key) => `<button class="small-btn" type="button" data-template="${key}" data-package="${pkg.id}">${escapeHtml(SUBTASK_TEMPLATES[key].label)}</button>`)
          .join('')}
      </div>
      <div class="subtask-list">${rows}</div>
    </div>`;
}

function renderPackages() {
  const host = $('#packageList');
  if (!state.packages.length) {
    host.innerHTML = '<p class="empty-state">هنوز بسته‌ای اضافه نشده است.</p>';
    $('#packagesTotalLabel').textContent = 'وزن کل: ۰';
    return;
  }

  const total = state.packages.reduce((sum, pkg) => sum + packageWeight(pkg), 0);
  $('#packagesTotalLabel').textContent = `وزن کل: ${formatNumber(total, 1)}`;

  host.innerHTML = state.packages
    .map((pkg) => {
      const weight = packageWeight(pkg);
      const status = packageSplitStatus(pkg);
      const complexityButtons = COMPLEXITY_OPTIONS.map(
        (opt) => `<button class="option-btn ${pkg.complexity === opt.value ? 'active' : ''}" type="button" title="${escapeHtml(opt.hint)}" data-complexity="${opt.value}" data-package="${pkg.id}">${opt.label}</button>`
      ).join('');
      const directSum = shareSum(pkg.shares);
      const directShareUi = pkg.useSubtasks ? '' : `
        <div class="direct-share-block">
          <div class="mini-head compact-head">
            <strong>تقسیم مستقیم این بسته</strong>
            <button class="small-btn" type="button" data-equal-package="${pkg.id}">تقسیم مساوی</button>
          </div>
          ${renderShareGrid(pkg.shares, 'share-package', pkg.id)}
          <small class="share-status ${status.ok ? 'ok' : 'warn'}" data-direct-status="${pkg.id}">جمع تقسیم: ${formatNumber(directSum, 0)}٪ ${status.ok ? '✓' : '— باید ۱۰۰٪ شود'}</small>
        </div>`;
      const modeLabel = pkg.useSubtasks ? 'غیرفعال کردن زیربخش‌ها' : 'تقسیم به زیربخش';
      return `
        <div class="package-card ${status.ok ? '' : 'share-error'}" data-package-card="${pkg.id}">
          <div class="package-head">
            <div class="package-title">
              <strong>${escapeHtml(pkg.title)}</strong>
              <span class="helper">${pkg.custom ? 'خارج از نرخ‌نامه' : escapeHtml(pkg.code)} · ${formatNumber(pkg.baseMillion, 2)} م / ${escapeHtml(pkg.unit)}</span>
            </div>
            <div class="package-weight">
              <span>وزن</span>
              <strong>${formatNumber(weight, 1)}</strong>
            </div>
            <button class="icon-btn" type="button" title="حذف بسته" aria-label="حذف ${escapeHtml(pkg.title)}" data-remove-package="${pkg.id}">×</button>
          </div>
          <div class="package-controls">
            <label class="field mini-field">
              <span>تعداد</span>
              <input type="number" min="0.1" step="0.1" value="${pkg.quantity}" data-package-qty="${pkg.id}" />
            </label>
            <div class="field mini-field">
              <span>پیچیدگی</span>
              <div class="segmented three">${complexityButtons}</div>
            </div>
          </div>
          <div class="package-tools">
            <button class="small-btn" type="button" data-toggle-subtasks="${pkg.id}">${modeLabel}</button>
            ${pkg.useSubtasks ? `<button class="small-btn" type="button" data-equal-package="${pkg.id}">تقسیم مساوی زیربخش‌ها</button>` : ''}
          </div>
          ${directShareUi}
          ${renderSubtasks(pkg)}
        </div>`;
    })
    .join('');

  bindPackageEvents(host);
}

function bindPackageEvents(host) {
  host.querySelectorAll('[data-remove-package]').forEach((btn) => {
    btn.addEventListener('click', () => removePackage(Number(btn.dataset.removePackage)));
  });
  host.querySelectorAll('[data-package-qty]').forEach((input) => {
    input.addEventListener('input', () => {
      const pkg = state.packages.find((p) => p.id === Number(input.dataset.packageQty));
      if (pkg) pkg.quantity = clampNumber(input.value, 0.1, 99999, 1);
      persistAndCalculate();
      refreshPackageMeta(pkg);
    });
  });
  host.querySelectorAll('[data-complexity]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pkg = state.packages.find((p) => p.id === Number(btn.dataset.package));
      if (pkg) pkg.complexity = btn.dataset.complexity;
      renderPackages();
      persistAndCalculate();
    });
  });
  host.querySelectorAll('[data-share-package]').forEach((input) => {
    input.addEventListener('input', () => {
      const pkg = state.packages.find((p) => p.id === Number(input.dataset.sharePackage));
      if (!pkg) return;
      pkg.shares[Number(input.dataset.shareMember)] = clampNumber(input.value, 0, 100, 0);
      persistAndCalculate();
      refreshPackageMeta(pkg);
    });
  });
  host.querySelectorAll('[data-equal-package]').forEach((btn) => {
    btn.addEventListener('click', () => splitPackageEqually(Number(btn.dataset.equalPackage)));
  });
  host.querySelectorAll('[data-toggle-subtasks]').forEach((btn) => {
    btn.addEventListener('click', () => toggleSubtasks(Number(btn.dataset.toggleSubtasks)));
  });
  host.querySelectorAll('[data-add-subtask]').forEach((btn) => {
    btn.addEventListener('click', () => addSubtask(Number(btn.dataset.addSubtask)));
  });
  host.querySelectorAll('[data-template]').forEach((btn) => {
    btn.addEventListener('click', () => applySubtaskTemplate(Number(btn.dataset.package), btn.dataset.template));
  });
  host.querySelectorAll('[data-remove-subtask]').forEach((btn) => {
    btn.addEventListener('click', () => removeSubtask(Number(btn.dataset.removeSubtask), Number(btn.dataset.subtaskId)));
  });
  host.querySelectorAll('[data-subtask-title]').forEach((input) => {
    input.addEventListener('input', () => {
      const pkg = state.packages.find((p) => p.id === Number(input.dataset.subtaskTitle));
      const st = pkg?.subtasks?.find((item) => item.id === Number(input.dataset.subtaskId));
      if (st) st.title = input.value;
      persistAndCalculate();
    });
  });
  host.querySelectorAll('[data-subtask-weight]').forEach((input) => {
    input.addEventListener('input', () => {
      const pkg = state.packages.find((p) => p.id === Number(input.dataset.subtaskWeight));
      const st = pkg?.subtasks?.find((item) => item.id === Number(input.dataset.subtaskId));
      if (st) st.weightPercent = clampNumber(input.value, 0, 100, 0);
      persistAndCalculate();
      refreshPackageMeta(pkg);
    });
  });
  host.querySelectorAll('[data-share-subtask]').forEach((input) => {
    input.addEventListener('input', () => {
      const [pkgId, subtaskId] = String(input.dataset.shareSubtask).split('-').map(Number);
      const pkg = state.packages.find((p) => p.id === pkgId);
      const st = pkg?.subtasks?.find((item) => item.id === subtaskId);
      if (!st) return;
      st.shares[Number(input.dataset.shareMember)] = clampNumber(input.value, 0, 100, 0);
      persistAndCalculate();
      refreshPackageMeta(pkg);
    });
  });
}

function refreshPackageMeta(pkg) {
  if (!pkg) return;
  const card = document.querySelector(`[data-package-card="${pkg.id}"]`);
  if (!card) return;
  const status = packageSplitStatus(pkg);
  card.classList.toggle('share-error', !status.ok);
  const weightStrong = card.querySelector('.package-weight strong');
  if (weightStrong) weightStrong.textContent = formatNumber(packageWeight(pkg), 1);

  const directStatus = card.querySelector(`[data-direct-status="${pkg.id}"]`);
  if (directStatus) {
    const sum = shareSum(pkg.shares);
    const ok = shareIsOk(pkg.shares);
    directStatus.className = `share-status ${ok ? 'ok' : 'warn'}`;
    directStatus.textContent = `جمع تقسیم: ${formatNumber(sum, 0)}٪ ${ok ? '✓' : '— باید ۱۰۰٪ شود'}`;
  }

  const weightStatus = card.querySelector(`[data-subtask-weight-status="${pkg.id}"]`);
  if (weightStatus) {
    const weightSum = subtaskWeightSum(pkg);
    const ok = Math.abs(weightSum - 100) < 0.5;
    weightStatus.classList.toggle('warning-chip', !ok);
    weightStatus.textContent = `جمع وزن زیربخش‌ها: ${formatNumber(weightSum, 0)}٪ ${ok ? '✓' : '— باید ۱۰۰٪ شود'}`;
  }

  (pkg.subtasks || []).forEach((st) => {
    const subCard = card.querySelector(`[data-subtask-card="${pkg.id}-${st.id}"]`);
    if (!subCard) return;
    const ok = shareIsOk(st.shares);
    subCard.classList.toggle('share-error', !ok);
    const subStatus = subCard.querySelector('.share-status');
    if (subStatus) {
      const sum = shareSum(st.shares);
      subStatus.className = `share-status ${ok ? 'ok' : 'warn'}`;
      subStatus.textContent = `جمع تقسیم زیربخش: ${formatNumber(sum, 0)}٪ ${ok ? '✓' : '— باید ۱۰۰٪ شود'}`;
    }
  });
}

/* ---------- management / marketing ---------- */

const EXTRA_ROLES = {
  mgmt: {
    stateKey: 'mgmt',
    label: 'مدیریت پروژه',
    enabledId: 'mgmtEnabled',
    percentId: 'mgmtPercent',
    bodyId: 'mgmtBody',
    sharesId: 'mgmtShares',
    equalId: 'mgmtEqualBtn',
    statusId: 'mgmtShareStatus',
    dataset: 'share-mgmt',
    defaultPercent: () => SETTINGS.managementPercent,
  },
  marketing: {
    stateKey: 'marketing',
    label: 'بازاریابی و جذب پروژه',
    enabledId: 'marketingEnabled',
    percentId: 'marketingPercent',
    bodyId: 'marketingBody',
    sharesId: 'marketingShares',
    equalId: 'marketingEqualBtn',
    statusId: 'marketingShareStatus',
    dataset: 'share-marketing',
    defaultPercent: () => SETTINGS.marketingPercent,
  },
};

function renderExtraRole(roleKey) {
  const cfg = EXTRA_ROLES[roleKey];
  if (!cfg) return;
  const role = state[cfg.stateKey];
  const enabled = $(`#${cfg.enabledId}`);
  const percent = $(`#${cfg.percentId}`);
  const body = $(`#${cfg.bodyId}`);
  const sharesHost = $(`#${cfg.sharesId}`);
  if (!enabled || !percent || !body || !sharesHost) return;

  enabled.checked = Boolean(role.enabled);
  percent.value = clampNumber(role.percent, 0, 100, cfg.defaultPercent());
  body.style.display = role.enabled ? '' : 'none';
  sharesHost.innerHTML = renderShareCells(role.shares, cfg.dataset, '1');
  document.querySelectorAll(`[data-${cfg.dataset}]`).forEach((input) => {
    input.addEventListener('input', () => {
      role.shares[Number(input.dataset.shareMember)] = clampNumber(input.value, 0, 100, 0);
      persistAndCalculate();
      updateExtraRoleStatus(roleKey);
    });
  });
  const eq = $(`#${cfg.equalId}`);
  if (eq) eq.onclick = () => {
    role.shares = makeEqualShares();
    renderExtraRole(roleKey);
    persistAndCalculate();
  };
  updateExtraRoleStatus(roleKey);
}

function renderMgmt() {
  renderExtraRole('mgmt');
  renderExtraRole('marketing');
}

function updateExtraRoleStatus(roleKey) {
  const cfg = EXTRA_ROLES[roleKey];
  const role = state[cfg.stateKey];
  const status = $(`#${cfg.statusId}`);
  if (!status) return;
  if (!role.enabled) { status.textContent = ''; return; }
  const sum = shareSum(role.shares);
  const ok = Math.abs(sum - 100) < 0.5;
  status.textContent = `جمع تقسیم ${cfg.label}: ${formatNumber(sum, 0)}٪ ${ok ? '✓' : '— باید ۱۰۰٪ شود'}`;
  status.style.color = ok ? 'var(--green)' : 'var(--red)';
}

function updateMgmtStatus() {
  updateExtraRoleStatus('mgmt');
}

function updateMarketingStatus() {
  updateExtraRoleStatus('marketing');
}

function bindExtraRoleEvents(roleKey) {
  const cfg = EXTRA_ROLES[roleKey];
  const role = state[cfg.stateKey];
  const enabled = $(`#${cfg.enabledId}`);
  const percent = $(`#${cfg.percentId}`);
  if (!enabled || !percent) return;

  enabled.addEventListener('change', (e) => {
    role.enabled = e.target.checked;
    if (role.enabled && !shareIsOk(role.shares)) role.shares = makeEqualShares();
    renderExtraRole(roleKey);
    persistAndCalculate();
  });
  percent.addEventListener('input', (e) => {
    role.percent = clampNumber(e.target.value, 0, 100, cfg.defaultPercent());
    persistAndCalculate();
  });
}

function extraRoleWeight(roleKey, sumWeights) {
  const cfg = EXTRA_ROLES[roleKey];
  const role = state[cfg.stateKey];
  return role.enabled ? (clampNumber(role.percent, 0, 100, cfg.defaultPercent()) / 100) * sumWeights : 0;
}

function extraRoleShareOk(roleKey) {
  const cfg = EXTRA_ROLES[roleKey];
  const role = state[cfg.stateKey];
  return !role.enabled || shareIsOk(role.shares);
}
/* ---------- calculation ---------- */

function calculate() {
  const packageRows = state.packages.map((pkg) => ({ pkg, weight: packageWeight(pkg), shareOk: packageSplitStatus(pkg).ok }));
  const sumWeights = packageRows.reduce((sum, row) => sum + row.weight, 0);
  const mgmtWeight = extraRoleWeight('mgmt', sumWeights);
  const marketingWeight = extraRoleWeight('marketing', sumWeights);
  const mgmtShareOk = extraRoleShareOk('mgmt');
  const marketingShareOk = extraRoleShareOk('marketing');
  const totalWeight = sumWeights + mgmtWeight + marketingWeight;

  const memberRows = state.members.map((member) => {
    let score = 0;
    packageRows.forEach(({ pkg, weight }) => {
      if (pkg.useSubtasks && pkg.subtasks?.length) {
        pkg.subtasks.forEach((st) => {
          const stWeight = weight * (clampNumber(st.weightPercent, 0, 100, 0) / 100);
          score += stWeight * (clampNumber(st.shares[member.id], 0, 100, 0) / 100);
        });
      } else {
        score += weight * (clampNumber(pkg.shares[member.id], 0, 100, 0) / 100);
      }
    });
    if (state.mgmt.enabled) score += mgmtWeight * (clampNumber(state.mgmt.shares[member.id], 0, 100, 0) / 100);
    if (state.marketing.enabled) score += marketingWeight * (clampNumber(state.marketing.shares[member.id], 0, 100, 0) / 100);
    return { member, rawScore: score, ratio: 0 };
  });

  const rawTotal = memberRows.reduce((sum, row) => sum + row.rawScore, 0);
  memberRows.forEach((row) => { row.ratio = rawTotal > 0 ? row.rawScore / rawTotal : 0; });

  const amount = clampNumber(state.projectAmount, 0, 1e15, 0);
  const costs = clampNumber(state.directCosts, 0, 1e15, 0);
  const hasMoney = amount > 0;
  const netProfit = amount - costs;
  const fundPct = clampNumber(state.fundPercent, 0, 100, SETTINGS.studioFundPercent) / 100;
  const fundAmount = netProfit > 0 ? netProfit * fundPct : 0;
  const pool = netProfit > 0 ? netProfit - fundAmount : netProfit;
  memberRows.forEach((row) => { row.money = hasMoney ? pool * row.ratio : 0; });

  const sharesValid = packageRows.every((row) => row.shareOk) && mgmtShareOk && marketingShareOk;
  const hasEnoughMembers = state.members.length >= 2;
  const hasEnoughData = hasEnoughMembers && totalWeight > 0 && rawTotal > 0;
  const ready = hasEnoughData && sharesValid;

  return { packageRows, sumWeights, mgmtWeight, marketingWeight, totalWeight, memberRows, rawTotal, hasMoney, amount, costs, netProfit, fundPct, fundAmount, pool, sharesValid, hasEnoughMembers, hasEnoughData, ready };
}

/* ---------- rendering results ---------- */

function calculateAndRender() {
  latestCalc = calculate();
  renderResults(latestCalc);
  renderReport(latestCalc);
}

function renderResults(calc) {
  $('#heroTotalWeight').textContent = formatNumber(calc.totalWeight, 1);
  const extras = [];
  if (calc.mgmtWeight > 0) extras.push(`${formatNumber(calc.mgmtWeight, 1)} وزن مدیریت`);
  if (calc.marketingWeight > 0) extras.push(`${formatNumber(calc.marketingWeight, 1)} وزن بازاریابی`);
  $('#heroSubtitle').textContent = extras.length
    ? `شامل ${extras.join(' و ')}`
    : 'بر اساس تعرفه‌ی پایه × تعداد × پیچیدگی × وزن زیربخش‌ها';

  const ratioHost = $('#ratioList');
  if (!calc.hasEnoughMembers) {
    ratioHost.innerHTML = '<strong>—</strong>';
    $('#ratioBadge').textContent = 'حداقل دو عضو پروژه لازم است';
  } else if (!calc.hasEnoughData) {
    ratioHost.innerHTML = '<strong>—</strong>';
    $('#ratioBadge').textContent = 'بسته کاری اضافه کنید';
  } else if (!calc.sharesValid) {
    ratioHost.innerHTML = '<strong>قفل شده</strong>';
    $('#ratioBadge').textContent = '⚠ جمع تقسیم یا جمع وزن زیربخش‌ها باید ۱۰۰٪ شود';
  } else {
    ratioHost.innerHTML = calc.memberRows
      .map((row) => `<div class="ratio-row"><span>${escapeHtml(row.member.name)}</span><strong>${formatPercent(row.ratio)}</strong></div>`)
      .join('');
    $('#ratioBadge').textContent = 'آماده‌ی انتقال به برگه‌ی «سهم اعضای پروژه»';
  }

  if (calc.hasMoney && calc.ready) {
    $('#netProfit').textContent = formatMoney(calc.netProfit);
    $('#fundAmount').textContent = calc.netProfit > 0 ? `${formatMoney(calc.fundAmount)} (${formatNumber(calc.fundPct * 100, 0)}٪)` : '۰ (پروژه‌ی زیان‌ده)';
    $('#poolAmount').textContent = formatMoney(calc.pool);
    $('#memberMoneyRows').innerHTML = calc.memberRows
      .map((row) => `<div class="payment-row"><span>${escapeHtml(row.member.name)}</span><strong>${formatMoney(row.money)}</strong></div>`)
      .join('');
  } else if (calc.hasMoney && !calc.ready) {
    $('#netProfit').textContent = 'قفل شده';
    $('#fundAmount').textContent = '—';
    $('#poolAmount').textContent = '—';
    $('#memberMoneyRows').innerHTML = '<p class="hint">تا وقتی تقسیم‌ها معتبر نباشند، خروجی مالی نمایش داده نمی‌شود.</p>';
  } else {
    $('#netProfit').textContent = '—';
    $('#fundAmount').textContent = '—';
    $('#poolAmount').textContent = '—';
    $('#memberMoneyRows').innerHTML = '<p class="hint">برای دیدن تقسیم مالی، مبلغ پروژه را وارد کنید.</p>';
  }

  const breakdown = [
    ['جمع وزن بسته‌های نرخ‌نامه‌ای', formatNumber(calc.packageRows.filter((r) => !r.pkg.custom).reduce((s, r) => s + r.weight, 0), 1)],
    ['جمع وزن بسته‌های خارج از نرخ‌نامه', formatNumber(calc.packageRows.filter((r) => r.pkg.custom).reduce((s, r) => s + r.weight, 0), 1)],
    ['وزن مدیریت پروژه', formatNumber(calc.mgmtWeight, 1)],
    ['وزن بازاریابی و جذب پروژه', formatNumber(calc.marketingWeight, 1)],
    ['وزن کل پروژه', formatNumber(calc.totalWeight, 1)],
    ['جمع امتیاز اعضا', calc.sharesValid ? formatNumber(calc.rawTotal, 1) : 'قفل شده'],
  ];
  $('#breakdown').innerHTML = breakdown
    .map(([label, value]) => `<div class="breakdown-row"><dt>${label}</dt><dd>${value}</dd></div>`)
    .join('');
}

function renderReport(calc) {
  $('#reportTitle').textContent = state.projectName || 'پروژه';
  $('#reportClient').textContent = state.clientName || '—';
  $('#reportDate').textContent = todayFa();
  $('#reportAmount').textContent = calc.hasMoney ? formatMoney(calc.amount) : '—';
  $('#reportFund').textContent = calc.hasMoney && calc.netProfit > 0
    ? `${formatNumber(calc.fundPct * 100, 0)}٪ = ${formatMoney(calc.fundAmount)}`
    : `${formatNumber(calc.fundPct * 100, 0)}٪`;

  $('#reportMembersBody').innerHTML = calc.ready
    ? calc.memberRows
        .map((row) => `
          <tr>
            <td>${escapeHtml(row.member.name)}</td>
            <td>${formatNumber(row.rawScore, 1)}</td>
            <td><strong>${formatPercent(row.ratio)}</strong></td>
            <td>${calc.hasMoney ? formatMoney(row.money) : '—'}</td>
          </tr>`)
        .join('')
    : '<tr><td colspan="4">محاسبه تا معتبر شدن تقسیم‌ها قفل است.</td></tr>';

  $('#reportPackagesBody').innerHTML = calc.packageRows.length
    ? calc.packageRows.map(({ pkg, weight }) => renderReportPackageRow(pkg, weight)).join('') + renderExtraRoleReportRow(calc, 'mgmt') + renderExtraRoleReportRow(calc, 'marketing')
    : '<tr><td>—</td><td>—</td><td>—</td><td>—</td></tr>';
}

function renderReportPackageRow(pkg, weight) {
  if (pkg.useSubtasks && pkg.subtasks?.length) {
    const split = pkg.subtasks.map((st) => {
      const members = state.members
        .filter((m) => clampNumber(st.shares[m.id], 0, 100, 0) > 0)
        .map((m) => `${escapeHtml(m.name)} ${formatNumber(clampNumber(st.shares[m.id], 0, 100, 0), 0)}٪`)
        .join('، ') || '—';
      return `${escapeHtml(st.title)} (${formatNumber(st.weightPercent, 0)}٪): ${members}`;
    }).join('<br>');
    return `
      <tr>
        <td>${escapeHtml(pkg.title)}</td>
        <td>${pkg.custom ? 'توافقی' : escapeHtml(pkg.code)} · ${formatNumber(pkg.baseMillion, 2)} م × ${formatNumber(pkg.quantity, 1)}</td>
        <td>${formatNumber(weight, 1)}</td>
        <td>${split}</td>
      </tr>`;
  }
  const split = state.members
    .filter((m) => clampNumber(pkg.shares[m.id], 0, 100, 0) > 0)
    .map((m) => `${escapeHtml(m.name)} ${formatNumber(clampNumber(pkg.shares[m.id], 0, 100, 0), 0)}٪`)
    .join('، ') || '—';
  return `
    <tr>
      <td>${escapeHtml(pkg.title)}</td>
      <td>${pkg.custom ? 'توافقی' : escapeHtml(pkg.code)} · ${formatNumber(pkg.baseMillion, 2)} م × ${formatNumber(pkg.quantity, 1)}</td>
      <td>${formatNumber(weight, 1)}</td>
      <td>${split}</td>
    </tr>`;
}

function renderExtraRoleReportRow(calc, roleKey) {
  const cfg = EXTRA_ROLES[roleKey];
  const role = state[cfg.stateKey];
  const weight = roleKey === 'mgmt' ? calc.mgmtWeight : calc.marketingWeight;
  if (weight <= 0) return '';
  return `<tr>
    <td>${cfg.label}</td>
    <td>${formatNumber(role.percent, 0)}٪ جمع وزن بسته‌ها</td>
    <td>${formatNumber(weight, 1)}</td>
    <td>${state.members
      .filter((m) => clampNumber(role.shares[m.id], 0, 100, 0) > 0)
      .map((m) => `${escapeHtml(m.name)} ${formatNumber(clampNumber(role.shares[m.id], 0, 100, 0), 0)}٪`)
      .join('، ') || '—'}</td>
  </tr>`;
}

/* ---------- archive ---------- */

function loadArchive() {
  try { return JSON.parse(safeStorageGet(ARCHIVE_KEY)) || []; } catch { return []; }
}

function renderArchive() {
  const rows = loadArchive();
  $('#archiveBody').innerHTML = rows.length
    ? rows.map((row) => `
        <tr>
          <td>${escapeHtml(row.date)}</td>
          <td>${escapeHtml(row.project)}</td>
          <td>${escapeHtml(row.summary)}</td>
          <td>${escapeHtml(row.amount)}</td>
        </tr>`).join('')
    : '<tr><td colspan="4" class="empty-state">آرشیو خالی است.</td></tr>';
}

function archiveCurrent() {
  if (!latestCalc || !latestCalc.ready) {
    showToast('اول محاسبه را کامل و معتبر کن.');
    return;
  }
  const rows = loadArchive();
  rows.unshift({
    date: todayFa(),
    project: state.projectName || '—',
    summary: latestCalc.memberRows.map((row) => `${row.member.name} ${formatPercent(row.ratio, 0)}`).join('، '),
    amount: latestCalc.hasMoney ? formatMoney(latestCalc.amount) : '—',
  });
  safeStorageSet(ARCHIVE_KEY, JSON.stringify(rows.slice(0, 60)));
  renderArchive();
  showToast('در آرشیو ثبت شد.');
}

function clearArchive() {
  safeStorageRemove(ARCHIVE_KEY);
  renderArchive();
  showToast('آرشیو پاک شد.');
}

function exportArchiveCsv() {
  const rows = loadArchive();
  if (!rows.length) {
    showToast('آرشیو خالی است.');
    return;
  }
  const header = 'تاریخ,پروژه,اعضا و نسبت‌ها,مبلغ';
  const body = rows.map((row) => [row.date, row.project, row.summary, row.amount].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','));
  const blob = new Blob(['\uFEFF' + [header, ...body].join('\n')], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'share-split-archive.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

/* ---------- report copy / reset ---------- */

function copyReport() {
  if (!latestCalc || !latestCalc.ready) {
    showToast('اول محاسبه را کامل و معتبر کن.');
    return;
  }
  const lines = latestCalc.memberRows
    .map((row) => `${row.member.name}: ${formatPercent(row.ratio)}${latestCalc.hasMoney ? ` — ${formatMoney(row.money)}` : ''}`)
    .join('\n');
  const money = latestCalc.hasMoney
    ? `\n\nمبلغ پروژه: ${formatMoney(latestCalc.amount)}\nهزینه مستقیم: ${formatMoney(latestCalc.costs)}\nسود خالص: ${formatMoney(latestCalc.netProfit)}\nصندوق استودیو (${formatNumber(latestCalc.fundPct * 100, 0)}٪): ${formatMoney(latestCalc.fundAmount)}\nاستخر اعضا: ${formatMoney(latestCalc.pool)}`
    : '';
  const text = `گزارش سهم مشارکت — ${state.projectName || 'پروژه'}\nتاریخ: ${todayFa()}\n\nنسبت مشارکت:\n${lines}${money}\n\nمبنا: تعرفه نرخ‌نامه یا ارزش معادل × تعداد × پیچیدگی؛ پروژه‌های بزرگ می‌توانند به زیربخش‌های وزن‌دار تقسیم شوند.`;
  navigator.clipboard
    ?.writeText(text)
    .then(() => showToast('گزارش کپی شد.'))
    .catch(() => showToast('کپی در این مرورگر ممکن نیست.'));
}

function resetCalculator() {
  const keepMembers = state.members.map((m) => ({ id: m.id, name: m.name }));
  state = createDefaultState();
  state.members = keepMembers;
  state.nextMemberId = keepMembers.reduce((max, m) => Math.max(max, m.id), 0) + 1;
  keepMembers.forEach((m) => {
    state.mgmt.shares[m.id] = 0;
    state.marketing.shares[m.id] = 0;
  });
  initFormValues();
  renderMembers();
  renderPackages();
  renderMgmt();
  updateServiceOptions(true);
  persistAndCalculate();
  showToast('محاسبه‌ی جدید آغاز شد (اعضا حفظ شدند).');
}

/* ---------- init ---------- */

function initFormValues() {
  $('#projectName').value = state.projectName;
  $('#clientName').value = state.clientName;
  $('#projectAmount').value = state.projectAmount;
  $('#directCosts').value = state.directCosts;
  $('#fundPercent').value = state.fundPercent;
  $('#fundLabel').textContent = `${formatNumber(state.fundPercent, 0)}٪`;
  $('#categorySelect').value = state.category;
  $('#serviceSearch').value = state.serviceSearch;
}

function bindEvents() {
  $('#projectName').addEventListener('input', (e) => { state.projectName = e.target.value; persistAndCalculate(); });
  $('#clientName').addEventListener('input', (e) => { state.clientName = e.target.value; persistAndCalculate(); });
  $('#projectAmount').addEventListener('input', (e) => { state.projectAmount = e.target.value; persistAndCalculate(); });
  $('#directCosts').addEventListener('input', (e) => { state.directCosts = e.target.value; persistAndCalculate(); });
  $('#fundPercent').addEventListener('input', (e) => {
    state.fundPercent = clampNumber(e.target.value, 0, 30, SETTINGS.studioFundPercent);
    $('#fundLabel').textContent = `${formatNumber(state.fundPercent, 0)}٪`;
    persistAndCalculate();
  });
  $('#categorySelect').addEventListener('change', (e) => { state.category = e.target.value; updateServiceOptions(true); saveState(); });
  $('#serviceSearch').addEventListener('input', (e) => { state.serviceSearch = e.target.value; updateServiceOptions(true); saveState(); });
  $('#serviceSelect').addEventListener('change', (e) => { state.serviceCode = e.target.value; renderServiceNote(); saveState(); });
  $('#addMemberBtn').addEventListener('click', addMember);
  $('#newMemberName').addEventListener('keydown', (e) => { if (e.key === 'Enter') addMember(); });
  $('#addPackageBtn').addEventListener('click', addPackageFromTariff);
  $('#addCustomBtn').addEventListener('click', addCustomPackage);
  bindExtraRoleEvents('mgmt');
  bindExtraRoleEvents('marketing');
  $('#saveArchiveBtn').addEventListener('click', archiveCurrent);
  $('#exportCsvBtn').addEventListener('click', exportArchiveCsv);
  $('#clearArchiveBtn').addEventListener('click', clearArchive);
  $('#copyReportBtn').addEventListener('click', copyReport);
  $('#printBtn').addEventListener('click', () => window.print());
  $('#resetBtn').addEventListener('click', resetCalculator);
}

function init() {
  loadState();
  initCategories();
  initFormValues();
  bindEvents();
  renderMembers();
  renderPackages();
  renderMgmt();
  updateServiceOptions();
  calculateAndRender();
  renderArchive();
}

init();
