const APP_VERSION = "1.2.0";

const SETTINGS = {
  studioFundPercent: 15,
  managementPercent: 10,
  marketingPercent: 8,
  currencyLabel: "تومان",
  maxMembers: 12,
};

const COMPLEXITY_OPTIONS = [
  { value: "simple", label: "ساده", factor: 0.85, hint: "نیاز مشخص، خروجی محدود" },
  { value: "medium", label: "متوسط", factor: 1, hint: "حالت پایه" },
  { value: "complex", label: "پیچیده", factor: 1.3, hint: "ابهام، لایه‌های زیاد، تصمیم‌گیری دشوار" },
];



const SUBTASK_TEMPLATES = {
  annual_report: {
    label: "گزارش سالانه",
    items: [
      { title: "طراحی ساختار محتوایی متن", weightPercent: 20 },
      { title: "Data Visualization / نمودار و روایت داده", weightPercent: 25 },
      { title: "Layout / صفحه‌آرایی", weightPercent: 25 },
      { title: "Design Key Visual", weightPercent: 15 },
      { title: "توسعه Key Visual / کاور، دیوایدر و آرت‌ورک داخلی", weightPercent: 15 },
    ],
  },
  visual_identity: {
    label: "هویت بصری",
    items: [
      { title: "جهت‌گیری مفهومی و مسیر طراحی", weightPercent: 20 },
      { title: "طراحی نشانه / هسته بصری", weightPercent: 35 },
      { title: "رنگ، تایپ، گرید و قواعد پایه", weightPercent: 20 },
      { title: "توسعه کاربردها و اقلام اصلی", weightPercent: 15 },
      { title: "گایدلاین و آماده‌سازی خروجی", weightPercent: 10 },
    ],
  },
  logo_rules: {
    label: "نشانه همراه با قوانین اجرایی",
    items: [
      { title: "تحلیل، مسیر مفهومی و ایده‌پردازی", weightPercent: 25 },
      { title: "اتود، خلق و پالایش نشانه", weightPercent: 40 },
      { title: "قواعد اجرایی و نسخه‌های کاربردی", weightPercent: 25 },
      { title: "آماده‌سازی فایل‌ها و تحویل", weightPercent: 10 },
    ],
  },
  logotype_language: {
    label: "نشان‌نوشته زبان دیگر",
    items: [
      { title: "تحلیل نشانه معیار و زبان دوم", weightPercent: 20 },
      { title: "طراحی فرم نوشتاری و حروف", weightPercent: 45 },
      { title: "هماهنگ‌سازی با هویت اصلی", weightPercent: 20 },
      { title: "آماده‌سازی خروجی", weightPercent: 15 },
    ],
  },
  mascot: {
    label: "شخصیت و مسکات",
    items: [
      { title: "شخصیت‌پردازی، کانسپت و مسیر بصری", weightPercent: 25 },
      { title: "طراحی حالت اصلی شخصیت", weightPercent: 35 },
      { title: "طراحی حالت‌های فیگوراتیو", weightPercent: 25 },
      { title: "پالایش و آماده‌سازی خروجی", weightPercent: 15 },
    ],
  },
  icon_set: {
    label: "آیکن و علائم تصویری",
    items: [
      { title: "تعریف سیستم، گرید و قواعد بصری", weightPercent: 25 },
      { title: "طراحی علائم اصلی", weightPercent: 50 },
      { title: "یکپارچه‌سازی و کنترل کیفیت", weightPercent: 15 },
      { title: "آماده‌سازی خروجی", weightPercent: 10 },
    ],
  },
  signage: {
    label: "علائم راهنمای محیطی",
    items: [
      { title: "تحلیل مسیر، نیاز اطلاع‌رسانی و سلسله‌مراتب", weightPercent: 30 },
      { title: "طراحی سیستم بصری علائم", weightPercent: 35 },
      { title: "توسعه موارد و موقعیت‌ها", weightPercent: 25 },
      { title: "آماده‌سازی خروجی", weightPercent: 10 },
    ],
  },
  stationery: {
    label: "اوراق اداری",
    items: [
      { title: "تعریف ساختار و نیاز اقلام", weightPercent: 20 },
      { title: "طراحی مستر و قواعد چیدمان", weightPercent: 40 },
      { title: "توسعه اقلام مختلف", weightPercent: 30 },
      { title: "آماده‌سازی چاپ و خروجی", weightPercent: 10 },
    ],
  },
  corporate_items: {
    label: "اقلام سازمانی",
    items: [
      { title: "تحلیل کاربرد و محدودیت متریال", weightPercent: 25 },
      { title: "تطبیق هویت و طراحی اقلام", weightPercent: 50 },
      { title: "ماکاپ، آماده‌سازی و کنترل خروجی", weightPercent: 25 },
    ],
  },
  certificate_security: {
    label: "گواهینامه و اسناد رسمی",
    items: [
      { title: "سلسله‌مراتب اطلاعات و ساختار سند", weightPercent: 30 },
      { title: "طراحی بصری، الگو و جزئیات امنیتی", weightPercent: 40 },
      { title: "آماده‌سازی چاپ و کنترل خروجی", weightPercent: 30 },
    ],
  },
  card_design: {
    label: "طراحی کارت",
    items: [
      { title: "تحلیل اطلاعات و کاربرد کارت", weightPercent: 25 },
      { title: "طراحی بصری و Layout", weightPercent: 50 },
      { title: "آماده‌سازی چاپ / تولید", weightPercent: 25 },
    ],
  },
  brochure_short: {
    label: "بروشور، تراکت یا فلایر",
    items: [
      { title: "ساختار پیام و اولویت‌بندی محتوا", weightPercent: 25 },
      { title: "طراحی Layout و گرافیک اصلی", weightPercent: 50 },
      { title: "اصلاح، آماده‌سازی و خروجی", weightPercent: 25 },
    ],
  },
  brochure_structure: {
    label: "ساختار کلی بروشور / کاتالوگ",
    items: [
      { title: "معماری محتوا و ترتیب صفحات", weightPercent: 25 },
      { title: "گرید، تایپوگرافی و سیستم بصری", weightPercent: 30 },
      { title: "طراحی صفحات کلیدی و داخلی", weightPercent: 30 },
      { title: "آماده‌سازی خروجی", weightPercent: 15 },
    ],
  },
  extra_page_layout: {
    label: "صفحه اضافه / صفحه‌آرایی موردی",
    items: [
      { title: "چیدمان محتوا و صفحه‌آرایی", weightPercent: 70 },
      { title: "کنترل کیفیت و خروجی", weightPercent: 30 },
    ],
  },
  menu_structure: {
    label: "طراحی منو",
    items: [
      { title: "دسته‌بندی و سلسله‌مراتب آیتم‌ها", weightPercent: 30 },
      { title: "طراحی سیستم و Layout منو", weightPercent: 45 },
      { title: "آماده‌سازی چاپ / خروجی", weightPercent: 25 },
    ],
  },
  packaging: {
    label: "بسته‌بندی",
    items: [
      { title: "تحلیل، مسیر مفهومی و ایده اصلی", weightPercent: 20 },
      { title: "ساختار بصری و Key Visual بسته", weightPercent: 30 },
      { title: "Layout اطلاعات و جزئیات بسته", weightPercent: 25 },
      { title: "توسعه نسخه‌ها / SKUها", weightPercent: 15 },
      { title: "آماده‌سازی چاپ و کنترل خروجی", weightPercent: 10 },
    ],
  },
  packaging_variant: {
    label: "نسخه یا محصول بر مبنای ساختار بسته‌بندی",
    items: [
      { title: "تحلیل نسخه و تفاوت‌های محصول", weightPercent: 25 },
      { title: "تطبیق ساختار بصری", weightPercent: 35 },
      { title: "Layout اطلاعات و جزئیات", weightPercent: 25 },
      { title: "آماده‌سازی چاپ و خروجی", weightPercent: 15 },
    ],
  },
  label_tag: {
    label: "لیبل، تگ و الصاقات بسته",
    items: [
      { title: "سلسله‌مراتب اطلاعات و الزامات", weightPercent: 35 },
      { title: "طراحی بصری و Layout", weightPercent: 40 },
      { title: "آماده‌سازی چاپ و خروجی", weightPercent: 25 },
    ],
  },
  packaging_surface: {
    label: "سطح چاپی بسته / کارتن / ساک / لفاف",
    items: [
      { title: "تطبیق هویت و ساختار بصری", weightPercent: 40 },
      { title: "Layout و انطباق با محدودیت تولید", weightPercent: 35 },
      { title: "آماده‌سازی چاپ و کنترل خروجی", weightPercent: 25 },
    ],
  },
  poster: {
    label: "پوستر و آگهی",
    items: [
      { title: "ایده، پیام و مسیر بصری", weightPercent: 30 },
      { title: "طراحی گرافیک اصلی", weightPercent: 45 },
      { title: "پالایش، آماده‌سازی و خروجی", weightPercent: 25 },
    ],
  },
  poster_system: {
    label: "ساختار کلی گروه پوستر",
    items: [
      { title: "تعریف سیستم و قواعد گروه", weightPercent: 35 },
      { title: "طراحی پوستر مادر", weightPercent: 35 },
      { title: "قواعد توسعه و نسخه‌سازی", weightPercent: 20 },
      { title: "آماده‌سازی خروجی", weightPercent: 10 },
    ],
  },
  key_visual: {
    label: "Key Visual / تصویر کلیدی",
    items: [
      { title: "کانسپت و روایت بصری", weightPercent: 30 },
      { title: "خلق تصویر کلیدی و ترکیب‌بندی", weightPercent: 45 },
      { title: "قواعد توسعه و آماده‌سازی", weightPercent: 25 },
    ],
  },
  outdoor_ad: {
    label: "رسانه محیطی / Outdoor",
    items: [
      { title: "خوانایی، پیام و سلسله‌مراتب", weightPercent: 30 },
      { title: "طراحی و ترکیب‌بندی رسانه", weightPercent: 45 },
      { title: "تطبیق ابعاد و آماده‌سازی خروجی", weightPercent: 25 },
    ],
  },
  interior_graphics: {
    label: "گرافیک محیطی / فضای داخلی",
    items: [
      { title: "تحلیل فضا و نقاط تماس", weightPercent: 30 },
      { title: "طراحی گرافیک و سیستم بصری فضا", weightPercent: 45 },
      { title: "تطبیق سطوح و آماده‌سازی اجرا", weightPercent: 25 },
    ],
  },
  pos_graphics: {
    label: "تبلیغات فروشگاهی / POS",
    items: [
      { title: "تحلیل فرمت و کاربرد فروشگاهی", weightPercent: 30 },
      { title: "طراحی بصری و پیام تبلیغاتی", weightPercent: 45 },
      { title: "آماده‌سازی تولید و خروجی", weightPercent: 25 },
    ],
  },
  product_mockup_graphics: {
    label: "گرافیک ماکت محصول",
    items: [
      { title: "تحلیل فرم و کاربرد ماکت", weightPercent: 30 },
      { title: "طراحی گرافیک روی ماکت", weightPercent: 45 },
      { title: "آماده‌سازی اجرا و خروجی", weightPercent: 25 },
    ],
  },
  social_uniform: {
    label: "یونیفرم سوشال مدیا",
    items: [
      { title: "تعریف سیستم بصری حساب", weightPercent: 35 },
      { title: "طراحی قالب پست و استوری", weightPercent: 35 },
      { title: "هایلایت، کاور و اجزای تکمیلی", weightPercent: 20 },
      { title: "آماده‌سازی فایل‌ها و راهنمای استفاده", weightPercent: 10 },
    ],
  },
  social_post_story: {
    label: "پست، استوری و بنر سوشال",
    items: [
      { title: "تحلیل محتوا و پیام", weightPercent: 25 },
      { title: "طراحی بصری و Layout", weightPercent: 55 },
      { title: "خروجی سایزها و آماده‌سازی انتشار", weightPercent: 20 },
    ],
  },
  website_ui: {
    label: "رابط کاربری وب‌سایت",
    items: [
      { title: "معماری اطلاعات و ساختار صفحات", weightPercent: 25 },
      { title: "مسیر بصری و کامپوننت‌های کلیدی", weightPercent: 25 },
      { title: "طراحی صفحات و حالت‌ها", weightPercent: 35 },
      { title: "Responsive، پروتوتایپ و تحویل", weightPercent: 15 },
    ],
  },
  design_system: {
    label: "دیزاین سیستم",
    items: [
      { title: "Foundations / رنگ، تایپ، گرید", weightPercent: 25 },
      { title: "طراحی کامپوننت‌های اصلی", weightPercent: 45 },
      { title: "Variants، مستندسازی و تحویل", weightPercent: 30 },
    ],
  },
  app_ui: {
    label: "رابط کاربری اپلیکیشن",
    items: [
      { title: "User Flow و ساختار تجربه", weightPercent: 25 },
      { title: "طراحی صفحات و کامپوننت‌ها", weightPercent: 45 },
      { title: "Interaction، Responsive و تحویل", weightPercent: 30 },
    ],
  },
  prototype: {
    label: "Prototype تعاملی",
    items: [
      { title: "تعریف مسیرها و سناریوها", weightPercent: 30 },
      { title: "ساخت تعاملات و اتصال صفحات", weightPercent: 50 },
      { title: "تست، اصلاح و تحویل", weightPercent: 20 },
    ],
  },
  ui_kit: {
    label: "UI Kit",
    items: [
      { title: "Foundations و سبک بصری", weightPercent: 25 },
      { title: "طراحی عناصر و کامپوننت‌ها", weightPercent: 50 },
      { title: "سازمان‌دهی و مستندسازی", weightPercent: 25 },
    ],
  },
  cover_design: {
    label: "طراحی جلد",
    items: [
      { title: "کانسپت و مسیر بصری جلد", weightPercent: 35 },
      { title: "طراحی گرافیک و تایپوگرافی", weightPercent: 45 },
      { title: "آماده‌سازی چاپ و خروجی", weightPercent: 20 },
    ],
  },
  cover_system: {
    label: "ساختار جلد گروهی",
    items: [
      { title: "تعریف سیستم جلد و قواعد مجموعه", weightPercent: 40 },
      { title: "طراحی جلد مادر / نمونه", weightPercent: 35 },
      { title: "مستندسازی و آماده‌سازی خروجی", weightPercent: 25 },
    ],
  },
  publication_layout: {
    label: "ساختار کلی صفحه‌آرایی",
    items: [
      { title: "گرید، تایپوگرافی و سبک صفحه", weightPercent: 35 },
      { title: "طراحی صفحات نمونه و استایل‌ها", weightPercent: 45 },
      { title: "راهنمای اجرا و آماده‌سازی", weightPercent: 20 },
    ],
  },
  page_layout: {
    label: "صفحه‌آرایی موردی",
    items: [
      { title: "چیدمان محتوا و صفحه‌آرایی", weightPercent: 70 },
      { title: "کنترل کیفیت و خروجی", weightPercent: 30 },
    ],
  },
  magazine_system: {
    label: "دیزاین سیستم مجله",
    items: [
      { title: "سیستم تایپوگرافی، گرید و صفحات", weightPercent: 40 },
      { title: "طراحی بخش‌ها و الگوهای تکرارشونده", weightPercent: 40 },
      { title: "مستندسازی و تحویل", weightPercent: 20 },
    ],
  },
  calendar_design: {
    label: "تقویم",
    items: [
      { title: "کانسپت و مسیر بصری", weightPercent: 30 },
      { title: "طراحی سیستم صفحات و زمان‌بندی", weightPercent: 45 },
      { title: "آماده‌سازی چاپ و خروجی", weightPercent: 25 },
    ],
  },
  planner_design: {
    label: "سررسید",
    items: [
      { title: "ساختار صفحات و تجربه استفاده", weightPercent: 35 },
      { title: "طراحی سیستم و صفحات نمونه", weightPercent: 45 },
      { title: "آماده‌سازی چاپ و خروجی", weightPercent: 20 },
    ],
  },
  typeface: {
    label: "تایپ‌فیس و فونت",
    items: [
      { title: "پژوهش، اسکلت و دامنه کاراکترها", weightPercent: 20 },
      { title: "طراحی گلیف‌ها", weightPercent: 45 },
      { title: "فاصله‌گذاری، کرنینگ و تست", weightPercent: 25 },
      { title: "خروجی و تحویل", weightPercent: 10 },
    ],
  },
  typeface_weight: {
    label: "وزن یا سبک اضافه تایپ‌فیس",
    items: [
      { title: "تطبیق اسکلت و طراحی وزن / سبک", weightPercent: 50 },
      { title: "فاصله‌گذاری، کرنینگ و تست", weightPercent: 35 },
      { title: "خروجی و تحویل", weightPercent: 15 },
    ],
  },
  variable_typeface: {
    label: "تایپ‌فیس پویا",
    items: [
      { title: "تعریف محورهای طراحی و سیستم", weightPercent: 25 },
      { title: "طراحی گلیف‌ها و مسترها", weightPercent: 40 },
      { title: "Interpolation، تست و اصلاح", weightPercent: 25 },
      { title: "خروجی و تحویل", weightPercent: 10 },
    ],
  },
  second_language_type: {
    label: "طراحی زبان دوم",
    items: [
      { title: "تحلیل خط و هماهنگی با تایپ‌فیس اصلی", weightPercent: 30 },
      { title: "طراحی گلیف‌های زبان دوم", weightPercent: 45 },
      { title: "یکپارچه‌سازی، تست و خروجی", weightPercent: 25 },
    ],
  },
  event_stage: {
    label: "گرافیک صحنه و رویداد",
    items: [
      { title: "کانسپت رویداد و مسیر بصری", weightPercent: 30 },
      { title: "طراحی سیستم بصری صحنه", weightPercent: 45 },
      { title: "توسعه اقلام و آماده‌سازی اجرا", weightPercent: 25 },
    ],
  },
  screen_graphic: {
    label: "گرافیک نمایشگر صحنه",
    items: [
      { title: "ساختار محتوا و سناریوی نمایش", weightPercent: 30 },
      { title: "طراحی گرافیک نمایشگر", weightPercent: 50 },
      { title: "آماده‌سازی فایل اجرا", weightPercent: 20 },
    ],
  },
  storyboard: {
    label: "استوری‌بورد گرافیک متحرک",
    items: [
      { title: "ساختار روایت و پلان‌ها", weightPercent: 35 },
      { title: "طراحی فریم‌های کلیدی", weightPercent: 45 },
      { title: "نوت‌گذاری و تحویل برای اجرا", weightPercent: 20 },
    ],
  },
  title_graphics: {
    label: "گرافیک عنوان‌بندی",
    items: [
      { title: "کانسپت و مسیر بصری", weightPercent: 35 },
      { title: "طراحی سیستم عنوان‌بندی", weightPercent: 40 },
      { title: "توسعه پکیج و آماده‌سازی خروجی", weightPercent: 25 },
    ],
  },
  video_graphic: {
    label: "گرافیک ویدیویی",
    items: [
      { title: "ساختار محتوا و نیاز ویدیو", weightPercent: 25 },
      { title: "طراحی گرافیک و اجزای بصری", weightPercent: 50 },
      { title: "آماده‌سازی خروجی و تحویل", weightPercent: 25 },
    ],
  },
  consulting: {
    label: "مشاوره تخصصی",
    items: [
      { title: "بررسی مسئله و آماده‌سازی", weightPercent: 30 },
      { title: "جلسه مشاوره و تصمیم‌سازی", weightPercent: 50 },
      { title: "جمع‌بندی و مستندسازی", weightPercent: 20 },
    ],
  },
  workshop_talk: {
    label: "نشست، سخنرانی یا کارگاه",
    items: [
      { title: "طراحی محتوا و ساختار آموزشی", weightPercent: 35 },
      { title: "آماده‌سازی اسلاید و متریال", weightPercent: 35 },
      { title: "اجرا و پیگیری", weightPercent: 30 },
    ],
  },
  judging: {
    label: "داوری و انتخاب آثار",
    items: [
      { title: "تعریف معیارها و آماده‌سازی", weightPercent: 30 },
      { title: "بررسی و ارزیابی آثار", weightPercent: 50 },
      { title: "جمع‌بندی و گزارش", weightPercent: 20 },
    ],
  },
  miscellaneous_design: {
    label: "سایر موارد طراحی",
    items: [
      { title: "تحلیل Brief و الزامات", weightPercent: 30 },
      { title: "طراحی گرافیک اصلی", weightPercent: 50 },
      { title: "آماده‌سازی خروجی", weightPercent: 20 },
    ],
  },
  general_custom: {
    label: "بسته عمومی / خارج از نرخ‌نامه",
    items: [
      { title: "تعریف مسئله و ساختار کار", weightPercent: 30 },
      { title: "تولید خروجی اصلی", weightPercent: 50 },
      { title: "اصلاح، کنترل کیفیت و تحویل", weightPercent: 20 },
    ],
  },
};

const DEFAULT_SUBTASK_TEMPLATE_BY_CODE = {
  "ID-001": "logo_rules",
  "ID-002": "logotype_language",
  "ID-003": "visual_identity",
  "ID-004": "mascot",
  "ID-005": "icon_set",
  "ID-006": "signage",
  "ID-007": "icon_set",
  "ST-001": "stationery",
  "ST-002": "corporate_items",
  "ST-003": "certificate_security",
  "ST-004": "certificate_security",
  "ST-005": "card_design",
  "ST-006": "card_design",
  "ST-007": "card_design",
  "ST-008": "card_design",
  "ST-009": "card_design",
  "ST-010": "card_design",
  "BR-001": "brochure_short",
  "BR-002": "cover_design",
  "BR-003": "brochure_structure",
  "BR-004": "extra_page_layout",
  "BR-005": "menu_structure",
  "BR-006": "extra_page_layout",
  "PK-001": "packaging",
  "PK-002": "packaging",
  "PK-003": "packaging_variant",
  "PK-004": "label_tag",
  "PK-005": "packaging_surface",
  "PK-006": "packaging_surface",
  "PK-007": "packaging_surface",
  "PK-008": "packaging_surface",
  "AD-001": "poster",
  "AD-002": "poster_system",
  "AD-003": "poster",
  "AD-004": "key_visual",
  "AD-005": "outdoor_ad",
  "AD-006": "outdoor_ad",
  "EV-001": "interior_graphics",
  "EV-002": "pos_graphics",
  "EV-003": "product_mockup_graphics",
  "SM-001": "social_uniform",
  "SM-002": "social_post_story",
  "SM-003": "social_post_story",
  "SM-004": "social_post_story",
  "UI-001": "website_ui",
  "UI-002": "design_system",
  "UI-003": "app_ui",
  "UI-004": "prototype",
  "UI-005": "ui_kit",
  "PB-001": "cover_design",
  "PB-002": "cover_system",
  "PB-003": "cover_design",
  "PB-004": "publication_layout",
  "PB-005": "page_layout",
  "PB-006": "page_layout",
  "PB-007": "page_layout",
  "PB-008": "magazine_system",
  "PB-009": "page_layout",
  "PB-010": "cover_design",
  "PB-011": "calendar_design",
  "PB-012": "calendar_design",
  "PB-013": "calendar_design",
  "PB-014": "planner_design",
  "PB-015": "page_layout",
  "FT-001": "typeface",
  "FT-002": "typeface_weight",
  "FT-003": "variable_typeface",
  "FT-004": "typeface_weight",
  "FT-005": "second_language_type",
  "GE-001": "event_stage",
  "GE-002": "screen_graphic",
  "GE-003": "storyboard",
  "GE-004": "title_graphics",
  "GE-005": "video_graphic",
  "EX-001": "consulting",
  "EX-002": "workshop_talk",
  "EX-003": "workshop_talk",
  "EX-004": "judging",
  "EX-005": "miscellaneous_design",
  "EX-006": "miscellaneous_design",
  "EX-007": "miscellaneous_design",
  "EX-008": "miscellaneous_design",
};

const FEATURED_SUBTASK_TEMPLATE_KEYS = [
  "annual_report",
  "visual_identity",
  "packaging",
  "website_ui",
  "key_visual",
  "publication_layout",
];

const TARIFFS = [
  { code: "ID-001", category: "نشانه و هویت بصری", service: "نشانه همراه با قوانین اجرایی", unit: "پروژه", baseMillion: 120, note: "" },
  { code: "ID-002", category: "نشانه و هویت بصری", service: "نشان‌نوشته به زبان دیگر بر پایه نشانه معیار", unit: "پروژه", baseMillion: 72, note: "۶۰٪ قیمت معیار نشانه" },
  { code: "ID-003", category: "نشانه و هویت بصری", service: "هویت بصری پایه", unit: "پروژه", baseMillion: 100, note: "طراحی نشانه، اوراق اداری و آثار دیگر جداگانه محاسبه می‌شود" },
  { code: "ID-004", category: "نشانه و هویت بصری", service: "طراحی شخصیت و مسکات", unit: "پروژه", baseMillion: 110, note: "یک حالت اصلی + حداقل دو حالت فیگوراتیو" },
  { code: "ID-005", category: "نشانه و هویت بصری", service: "علائم تصویری / آیکن تا ۵ مورد", unit: "پکیج", baseMillion: 45, note: "" },
  { code: "ID-006", category: "نشانه و هویت بصری", service: "علائم راهنمای محیطی تا ۵ مورد", unit: "پکیج", baseMillion: 45, note: "" },
  { code: "ID-007", category: "نشانه و هویت بصری", service: "علامت اضافه", unit: "مورد", baseMillion: 4.5, note: "۱۰٪ قیمت معیار" },

  { code: "ST-001", category: "اوراق اداری و اقلام سازمانی", service: "اوراق اداری تا ۵ مورد", unit: "پکیج", baseMillion: 30, note: "سربرگ، پاکت، کارت ویزیت، برگ یادداشت و..." },
  { code: "ST-002", category: "اوراق اداری و اقلام سازمانی", service: "اقلام سازمانی تا ۵ مورد", unit: "پکیج", baseMillion: 30, note: "مهر، موس‌پد، جاکلیدی و..." },
  { code: "ST-003", category: "اوراق اداری و اقلام سازمانی", service: "گواهینامه", unit: "مورد", baseMillion: 15, note: "" },
  { code: "ST-004", category: "اوراق اداری و اقلام سازمانی", service: "گواهینامه امنیتی و اسناد رسمی", unit: "مورد", baseMillion: 45, note: "" },
  { code: "ST-005", category: "اوراق اداری و اقلام سازمانی", service: "کارت بانکی", unit: "مورد", baseMillion: 75, note: "" },
  { code: "ST-006", category: "اوراق اداری و اقلام سازمانی", service: "کارت احراز هویت", unit: "مورد", baseMillion: 40, note: "" },
  { code: "ST-007", category: "اوراق اداری و اقلام سازمانی", service: "کارت ضمانت", unit: "مورد", baseMillion: 14, note: "" },
  { code: "ST-008", category: "اوراق اداری و اقلام سازمانی", service: "کارت دعوت", unit: "مورد", baseMillion: 14, note: "" },
  { code: "ST-009", category: "اوراق اداری و اقلام سازمانی", service: "کارت اعتباری", unit: "مورد", baseMillion: 10, note: "" },
  { code: "ST-010", category: "اوراق اداری و اقلام سازمانی", service: "کارت شناسایی", unit: "مورد", baseMillion: 10, note: "" },

  { code: "BR-001", category: "بروشور و کاتالوگ", service: "بروشور، تراکت یا فلایر تا ۲ صفحه", unit: "پروژه", baseMillion: 20, note: "" },
  { code: "BR-002", category: "بروشور و کاتالوگ", service: "جلد و پشت جلد بروشور یا کاتالوگ", unit: "پروژه", baseMillion: 25, note: "" },
  { code: "BR-003", category: "بروشور و کاتالوگ", service: "ساختار کلی بروشور یا کاتالوگ تا ۸ صفحه", unit: "پروژه", baseMillion: 80, note: "" },
  { code: "BR-004", category: "بروشور و کاتالوگ", service: "هر صفحه اضافه بروشور", unit: "صفحه", baseMillion: 2, note: "" },
  { code: "BR-005", category: "بروشور و کاتالوگ", service: "ساختار کلی منو تا ۲ صفحه", unit: "پروژه", baseMillion: 14, note: "" },
  { code: "BR-006", category: "بروشور و کاتالوگ", service: "هر صفحه اضافه منو", unit: "صفحه", baseMillion: 1, note: "" },

  { code: "PK-001", category: "بسته‌بندی", service: "طراحی بسته‌بندی تک محصول", unit: "پروژه", baseMillion: 75, note: "طراحی قالب حجمی و هندسی جداگانه است" },
  { code: "PK-002", category: "بسته‌بندی", service: "ساختار کلی بسته‌بندی گروه محصول / ارائه ۳ مورد", unit: "پروژه", baseMillion: 120, note: "" },
  { code: "PK-003", category: "بسته‌بندی", service: "طراحی بسته‌بندی هر محصول بر مبنای ساختار کلی", unit: "مورد", baseMillion: 30, note: "" },
  { code: "PK-004", category: "بسته‌بندی", service: "برچسب یا تگ الصاقی روی بسته", unit: "مورد", baseMillion: 12, note: "" },
  { code: "PK-005", category: "بسته‌بندی", service: "طراحی روی کارتن چندتایی محصول", unit: "مورد", baseMillion: 15, note: "" },
  { code: "PK-006", category: "بسته‌بندی", service: "کارتن مادر", unit: "مورد", baseMillion: 10, note: "" },
  { code: "PK-007", category: "بسته‌بندی", service: "ساک خرید", unit: "مورد", baseMillion: 13, note: "" },
  { code: "PK-008", category: "بسته‌بندی", service: "لفاف یا کاغذ بسته‌بندی", unit: "مورد", baseMillion: 8, note: "" },

  { code: "AD-001", category: "اعلان و آگهی", service: "پوستر", unit: "مورد", baseMillion: 85, note: "" },
  { code: "AD-002", category: "اعلان و آگهی", service: "ساختار کلی برای گروه پوستر", unit: "پروژه", baseMillion: 125, note: "با ارائه یک پوستر طراحی‌شده" },
  { code: "AD-003", category: "اعلان و آگهی", service: "پوستر بر مبنای ساختار کلی", unit: "مورد", baseMillion: 40, note: "" },
  { code: "AD-004", category: "اعلان و آگهی", service: "تصویر کلیدی / Key Visual", unit: "پروژه", baseMillion: 130, note: "قابل گسترش در انواع رسانه‌ها" },
  { code: "AD-005", category: "اعلان و آگهی", service: "بیلبورد و عرشه", unit: "مورد", baseMillion: 85, note: "استراتژی جداگانه محاسبه می‌شود" },
  { code: "AD-006", category: "اعلان و آگهی", service: "استرابرد، لمپ‌پست، پرتابل و مشابه", unit: "مورد", baseMillion: 80, note: "" },

  { code: "EV-001", category: "گرافیک محیطی", service: "گرافیک فضای داخلی", unit: "پروژه", baseMillion: 100, note: "طرح دکوراتیو دیوار یا سطوح دیگر" },
  { code: "EV-002", category: "گرافیک محیطی", service: "تبلیغات فروشگاهی نقطه فروش / POS", unit: "مورد", baseMillion: 10, note: "" },
  { code: "EV-003", category: "گرافیک محیطی", service: "گرافیک ماکت محصول", unit: "مورد", baseMillion: 20, note: "سازه حجمی جداگانه است" },

  { code: "SM-001", category: "سوشال مدیا و رابط کاربری", service: "ساختار کلی حساب کاربری / Uniform", unit: "پروژه", baseMillion: 23, note: "پست، استوری، کاور ویدیو و هایلایت" },
  { code: "SM-002", category: "سوشال مدیا و رابط کاربری", service: "پست و استوری تا ۴ مورد", unit: "پکیج", baseMillion: 12, note: "" },
  { code: "SM-003", category: "سوشال مدیا و رابط کاربری", service: "هر پست یا استوری اضافه", unit: "مورد", baseMillion: 2, note: "" },
  { code: "SM-004", category: "سوشال مدیا و رابط کاربری", service: "بنر تبلیغاتی غیرمتحرک", unit: "مورد", baseMillion: 10, note: "" },
  { code: "UI-001", category: "سوشال مدیا و رابط کاربری", service: "رابط کاربری وب‌سایت واکنش‌گرا تا ۴ صفحه", unit: "پروژه", baseMillion: 75, note: "نسخه موبایل و دسکتاپ" },
  { code: "UI-002", category: "سوشال مدیا و رابط کاربری", service: "دیزاین سیستم پایه", unit: "پروژه", baseMillion: 55, note: "۱۰ کامپوننت اصلی" },
  { code: "UI-003", category: "سوشال مدیا و رابط کاربری", service: "رابط کاربری پایه اپلیکیشن", unit: "پروژه", baseMillion: 75, note: "داشبورد و ۴ صفحه داخلی" },
  { code: "UI-004", category: "سوشال مدیا و رابط کاربری", service: "نمونه اولیه تعاملی / Prototype", unit: "پروژه", baseMillion: 40, note: "" },
  { code: "UI-005", category: "سوشال مدیا و رابط کاربری", service: "کیت رابط کاربری / UI Kit", unit: "پروژه", baseMillion: 27, note: "دکمه‌ها، فرم‌ها، تایپوگرافی و..." },

  { code: "PB-001", category: "نشر و مطبوعات", service: "جلد کتاب", unit: "مورد", baseMillion: 15, note: "" },
  { code: "PB-002", category: "نشر و مطبوعات", service: "ساختار کلی جلد گروه کتاب", unit: "پروژه", baseMillion: 30, note: "" },
  { code: "PB-003", category: "نشر و مطبوعات", service: "جلد کتاب بر مبنای ساختار کلی", unit: "مورد", baseMillion: 9, note: "" },
  { code: "PB-004", category: "نشر و مطبوعات", service: "ساختار کلی صفحه‌آرایی کتاب", unit: "پروژه", baseMillion: 30, note: "" },
  { code: "PB-005", category: "نشر و مطبوعات", service: "صفحه‌آرایی کتاب مصور", unit: "صفحه", baseMillion: 0.5, note: "" },
  { code: "PB-006", category: "نشر و مطبوعات", service: "صفحه‌آرایی کتاب آلبومی", unit: "صفحه", baseMillion: 0.3, note: "" },
  { code: "PB-007", category: "نشر و مطبوعات", service: "صفحه‌آرایی کتاب نوشتاری", unit: "صفحه", baseMillion: 0.1, note: "صفحات اختصاصی دو برابر قیمت پایه" },
  { code: "PB-008", category: "نشر و مطبوعات", service: "دیزاین سیستم مجله", unit: "پروژه", baseMillion: 75, note: "" },
  { code: "PB-009", category: "نشر و مطبوعات", service: "صفحه‌آرایی مجله", unit: "صفحه", baseMillion: 0.75, note: "" },
  { code: "PB-010", category: "نشر و مطبوعات", service: "جلد مجله", unit: "شماره", baseMillion: 20, note: "" },
  { code: "PB-011", category: "نشر و مطبوعات", service: "تقویم دیواری تک‌برگ سالانه", unit: "پروژه", baseMillion: 23, note: "" },
  { code: "PB-012", category: "نشر و مطبوعات", service: "تقویم فصلی با جلد ۵ برگ", unit: "پروژه", baseMillion: 23, note: "" },
  { code: "PB-013", category: "نشر و مطبوعات", service: "تقویم ماهانه با جلد ۱۳ برگ", unit: "پروژه", baseMillion: 45, note: "" },
  { code: "PB-014", category: "نشر و مطبوعات", service: "ساختار کلی سررسید", unit: "پروژه", baseMillion: 30, note: "" },
  { code: "PB-015", category: "نشر و مطبوعات", service: "صفحه‌آرایی سررسید", unit: "صفحه", baseMillion: 0.06, note: "" },

  { code: "FT-001", category: "تایپ‌فیس و فونت", service: "تایپ‌فیس تک‌وزن ایستا", unit: "پروژه", baseMillion: 300, note: "" },
  { code: "FT-002", category: "تایپ‌فیس و فونت", service: "هر وزن ایستای اضافه", unit: "وزن", baseMillion: 75, note: "" },
  { code: "FT-003", category: "تایپ‌فیس و فونت", service: "تایپ‌فیس پویا / Variable", unit: "پروژه", baseMillion: 500, note: "" },
  { code: "FT-004", category: "تایپ‌فیس و فونت", service: "طراحی سبک‌های دیگر برای تایپ‌فیس", unit: "سبک", baseMillion: 85, note: "Display / Oblique / Condensed و..." },
  { code: "FT-005", category: "تایپ‌فیس و فونت", service: "طراحی زبان دوم", unit: "زبان", baseMillion: 150, note: "" },

  { code: "GE-001", category: "گرافیک برنامه و رویداد", service: "طراحی گرافیک صحنه / یک برنامه کامل", unit: "پروژه", baseMillion: 110, note: "" },
  { code: "GE-002", category: "گرافیک برنامه و رویداد", service: "طراحی گرافیک نمایشگر صحنه", unit: "مورد", baseMillion: 30, note: "" },
  { code: "GE-003", category: "گرافیک برنامه و رویداد", service: "طراحی و تنظیم استوری‌بورد گرافیک متحرک", unit: "پروژه", baseMillion: 15, note: "حداقل ۳ پلان" },
  { code: "GE-004", category: "گرافیک برنامه و رویداد", service: "طراحی گرافیک عنوان‌بندی", unit: "پروژه", baseMillion: 130, note: "" },
  { code: "GE-005", category: "گرافیک برنامه و رویداد", service: "طراحی گرافیک ویدیویی", unit: "مورد", baseMillion: 15, note: "لوگوتگ، کرال، اینترو، کپشن و..." },

  { code: "EX-001", category: "خدمات تخصصی", service: "مشاوره تخصصی", unit: "ساعت", baseMillion: 10, note: "" },
  { code: "EX-002", category: "خدمات تخصصی", service: "نشست تخصصی، سمینار و سخنرانی", unit: "روز", baseMillion: 27, note: "" },
  { code: "EX-003", category: "خدمات تخصصی", service: "برگزاری کارگاه تخصصی", unit: "روز", baseMillion: 35, note: "" },
  { code: "EX-004", category: "خدمات تخصصی", service: "داوری و انتخاب آثار", unit: "روز", baseMillion: 35, note: "" },
  { code: "EX-005", category: "سایر موارد", service: "تمبر", unit: "مورد", baseMillion: 32, note: "" },
  { code: "EX-006", category: "سایر موارد", service: "چک، برگه سهام و اوراق بهادار", unit: "مورد", baseMillion: 80, note: "" },
  { code: "EX-007", category: "سایر موارد", service: "هولوگرام سه‌بعدی", unit: "مورد", baseMillion: 20, note: "" },
  { code: "EX-008", category: "سایر موارد", service: "هولوگرام ساده یا دوبعدی", unit: "مورد", baseMillion: 8, note: "" },
];