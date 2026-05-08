"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

const LOCALE_STORAGE_KEY = "nathirah-locale"

type Locale = "ar" | "en"

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "ar"
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null
  if (saved === "ar" || saved === "en") return saved
  const browserLang = navigator.language?.toLowerCase()
  if (browserLang?.startsWith("ar")) return "ar"
  if (browserLang?.startsWith("en")) return "en"
  return "ar"
}

interface LanguageContextType {
  locale: Locale
  dir: "rtl" | "ltr"
  toggleLocale: () => void
  t: (key: string) => string
}

const translations: Record<Locale, Record<string, string>> = {
  ar: {
    // Navbar
    "nav.home": "الرئيسية",
    "nav.howItWorks": "كيف يعمل",
    "nav.features": "المميزات",
    "nav.startScan": "ابدأ الفحص",
    "nav.menu": "القائمة",

    // Hero
    "hero.badge": "تقنية الذكاء الاصطناعي",
    "hero.title1": "اكتشفي مبكرًا،",
    "hero.title2": "اطمئني دائمًا",
    "hero.description": "نذيرة تستخدم أحدث تقنيات الذكاء الاصطناعي لتحليل صور أشعة الثدي والتنبؤ باحتمالية عودة المرض، لنمنحك الاطمئنان والرعاية التي تستحقينها.",
    "hero.cta": "ابدأي الفحص الآن",
    "hero.secondary": "كيف يعمل؟",
    "hero.privacy": "خصوصية تامة",
    "hero.ai": "ذكاء اصطناعي متقدم",

    // How it works
    "hiw.badge": "الخطوات",
    "hiw.title": "كيف يعمل نذيرة؟",
    "hiw.subtitle": "ثلاث خطوات بسيطة تفصلك عن الاطمئنان",
    "hiw.step1.title": "رفع الصورة",
    "hiw.step1.desc": "قومي برفع صورة أشعة الثدي (الماموغرام) من جهازك بسهولة وأمان.",
    "hiw.step2.title": "تحليل ذكي",
    "hiw.step2.desc": "يقوم نظام الذكاء الاصطناعي بتحليل الصورة باستخدام نماذج تعلم عميق متقدمة.",
    "hiw.step3.title": "استلام النتيجة",
    "hiw.step3.desc": "تحصلين على تقرير مفصل بنتيجة التحليل ونسبة احتمالية عودة المرض.",

    // Features
    "feat.badge": "المميزات",
    "feat.title": "لماذا تختارين نذيرة؟",
    "feat.subtitle": "نوفر لك تجربة طبية ذكية تجمع بين الدقة والسرعة والخصوصية",
    "feat.1.title": "تحليل دقيق للأشعة",
    "feat.1.desc": "تقنية مسح متقدمة تعتمد على الذكاء الاصطناعي لتحليل صور أشعة الثدي بدقة عالية.",
    "feat.2.title": "نتائج سريعة",
    "feat.2.desc": "احصلي على نتائج التحليل خلال ثوانٍ معدودة بعد رفع الصورة مباشرة.",
    "feat.3.title": "خصوصية وأمان",
    "feat.3.desc": "بياناتك وصورك الطبية محمية بأعلى معايير الأمان والخصوصية.",
    "feat.4.title": "دعم صحي متكامل",
    "feat.4.desc": "تقارير تفصيلية تساعدك وطبيبك في اتخاذ القرارات الصحية المناسبة.",

    // CTA
    "cta.title": "صحتك أولويتنا",
    "cta.desc": "لا تترددي في استخدام نذيرة للاطمئنان على صحتك. الكشف المبكر هو أفضل وسيلة للوقاية والعلاج.",
    "cta.button": "ابدأي الفحص الآن",

    // Footer
    "footer.desc": "خدمة ذكية للتنبؤ بعودة مرض سرطان الثدي من خلال تحليل صور الأشعة باستخدام تقنيات الذكاء الاصطناعي المتقدمة.",
    "footer.links": "روابط سريعة",
    "footer.scanner": "الماسح الضوئي",
    "footer.contact": "تواصل معنا",
    "footer.country": "المملكة العربية السعودية",
    "footer.rights": "جميع الحقوق محفوظة",

    // Scanner
    "scan.badge": "الماسح الذكي",
    "scan.title": "تحليل صور MRI للثدي",
    "scan.desc": "قومي برفع صور MRI وسيقوم نظامنا الذكي بتحليلها مع البيانات السريرية والتنبؤ باحتمالية انتكاسة المرض",
    "scan.dragDrop": "اسحبي الصور هنا أو اضغطي للرفع",
    "scan.formats": "يدعم صيغ PNG, JPG",
    "scan.upload": "رفع صور MRI",
    "scan.remove": "حذف الصورة",
    "scan.disclaimer": "هذا التحليل للأغراض البحثية والتوعوية فقط ولا يغني عن استشارة الطبيب المختص. يرجى مراجعة طبيبك للحصول على تشخيص دقيق.",
    "scan.analyze": "تحليل والتنبؤ",
    "scan.analyzing": "جاري التحليل...",
    "scan.patientLookup": "البحث عن مريضة برقمها التعريفي",
    "scan.patientIdPlaceholder": "مثال: Breast_MRI_042",
    "scan.loadData": "تحميل البيانات",
    "scan.searching": "جاري البحث...",
    "scan.lookupHint": "إدخال الرقم التعريفي سيملأ البيانات السريرية تلقائياً من قاعدة البيانات",
    "scan.lookupError": "خطأ في الاتصال بالخادم",
    "scan.mriImages": "صور MRI للمريضة",
    "scan.slicesHint": "يُنصح برفع 5-10 شرائح للحصول على أفضل دقة",
    "scan.imagesSelected": "صورة محددة",
    "scan.clinicalData": "البيانات السريرية",
    "scan.autoFilled": "تم التعبئة تلقائياً من قاعدة البيانات ✓",
    "scan.manualClinicalHint": "أدخل البيانات السريرية يدوياً، أو استخدم البحث برقم المريضة أعلاه للتعبئة التلقائية",
    "scan.noImages": "الرجاء إضافة صور MRI أولاً",
    "scan.apiError": "خطأ في الاتصال بنظام التحليل. تأكد من تشغيل الخادم على المنفذ 5000",
    "scan.er": "مستقبل ER",
    "scan.pr": "مستقبل PR",
    "scan.her2": "مستقبل HER2",
    "scan.molSubtype": "النوع الجزيئي",
    "scan.tStage": "حجم الورم (T)",
    "scan.nStage": "العقد الليمفاوية (N)",
    "scan.grade": "درجة الورم",
    "scan.menopause": "انقطاع الطمث",
    "scan.metastatic": "انتشار عند التشخيص",
    "scan.positive": "إيجابي (+)",
    "scan.negative": "سلبي (-)",
    "scan.borderline": "حدي (Borderline)",
    "scan.preMenopause": "قبل انقطاع الطمث",
    "scan.postMenopause": "بعد انقطاع الطمث",
    "scan.naMenopause": "غير محدد",
    "scan.yes": "نعم",
    "scan.no": "لا",

    // Results
    "res.badge": "نتيجة التحليل",
    "res.title": "تقرير تنبؤ انتكاسة سرطان الثدي",
    "res.riskLevel": "مستوى الخطورة:",
    "res.probability": "احتمالية الانتكاسة",
    "res.date": "تاريخ التحليل",
    "res.analyzedBy": "تم التحليل بواسطة نظام نذيرة الذكي",
    "res.recommendations": "التوصيات",
    "res.reminder": "تذكري دائمًا أن هذا التحليل هو أداة مساعدة للبحث العلمي ولا يغني عن التشخيص الطبي المتخصص. صحتك تستحق أفضل رعاية.",
    "res.newScan": "تحليل جديد",
    "res.backHome": "العودة للرئيسية",
    "res.low": "منخفض",
    "res.medium": "متوسط",
    "res.high": "مرتفع",
    "res.low.msg": "النتائج تشير إلى احتمالية منخفضة لانتكاسة المرض. هذا مؤشر إيجابي.",
    "res.medium.msg": "النتائج تشير إلى احتمالية متوسطة لانتكاسة المرض تستدعي المتابعة الطبية.",
    "res.high.msg": "النتائج تشير إلى احتمالية مرتفعة لانتكاسة المرض تستدعي اهتمامًا طبيًا فوريًا.",
    "res.low.rec": "ننصح بالاستمرار في المتابعة الدورية مع طبيبك المختص وإجراء الفحوصات الروتينية حسب الجدول الموصى به.",
    "res.medium.rec": "ننصح بشدة بمراجعة طبيبك المختص لمناقشة النتائج وتحديد خطة متابعة مناسبة. قد تحتاجين لفحوصات إضافية.",
    "res.high.rec": "يرجى التواصل مع طبيبك المختص في أقرب وقت لمناقشة النتائج والخطوات التالية. لا تترددي في طلب المساعدة الطبية.",
    "res.confidence": "مستوى الثقة",
    "res.dataSource": "مصدر البيانات",
    "res.imagesUsed": "الصور المحللة",
    "res.threshold": "حد القرار",
    "res.modelDetails": "تفاصيل النموذج",

    // Auth
    "auth.login": "تسجيل الدخول",
    "auth.signUp": "إنشاء حساب",
    "auth.loginTitle": "تسجيل الدخول",
    "auth.loginDesc": "أدخلي بريدك الإلكتروني وكلمة المرور للدخول",
    "auth.signUpTitle": "إنشاء حساب جديد",
    "auth.signUpDesc": "أنشئي حسابك للبدء في استخدام نذيرة",
    "auth.email": "البريد الإلكتروني",
    "auth.emailPlaceholder": "example@email.com",
    "auth.password": "كلمة المرور",
    "auth.repeatPassword": "تأكيد كلمة المرور",
    "auth.fullName": "الاسم الكامل",
    "auth.fullNamePlaceholder": "أدخلي اسمك الكامل",
    "auth.showPassword": "إظهار كلمة المرور",
    "auth.hidePassword": "إخفاء كلمة المرور",
    "auth.loggingIn": "جاري تسجيل الدخول...",
    "auth.creatingAccount": "جاري إنشاء الحساب...",
    "auth.noAccount": "ليس لديك حساب؟",
    "auth.signUpLink": "إنشاء حساب",
    "auth.hasAccount": "لديك حساب بالفعل؟",
    "auth.loginLink": "تسجيل الدخول",
    "auth.backHome": "العودة للرئيسية",
    "auth.welcomeBack": "مرحبًا بعودتك",
    "auth.loginSubtitle": "سجلي الدخول للوصول إلى خدمة تحليل الأشعة الذكية",
    "auth.joinNathirah": "انضمي إلى نذيرة",
    "auth.signUpSubtitle": "أنشئي حسابك واستفيدي من خدمة التنبؤ بالذكاء الاصطناعي",
    "auth.passwordMismatch": "كلمتا المرور غير متطابقتين",
    "auth.passwordTooShort": "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
    "auth.genericError": "حدث خطأ، يرجى المحاولة مرة أخرى",
    "auth.successTitle": "تم التسجيل بنجاح!",
    "auth.successDesc": "تم إنشاء حسابك بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب قبل تسجيل الدخول.",
    "auth.goToLogin": "الذهاب لتسجيل الدخول",
    "auth.errorTitle": "حدث خطأ",
    "auth.errorDesc": "عذرًا، حدث خطأ أثناء المصادقة.",
    "auth.tryAgain": "حاولي مرة أخرى",
    "auth.logout": "تسجيل الخروج",
    "nav.login": "تسجيل الدخول",
    "nav.signUp": "إنشاء حساب",
    "nav.history": "سجل الفحوصات",
    "nav.account": "حسابي",

    // History
    "history.badge": "سجل الفحوصات",
    "history.title": "سجل صور الأشعة",
    "history.subtitle": "عرض جميع الفحوصات السابقة لمقارنة النتائج مع طبيبك",
    "history.empty": "لا توجد فحوصات بعد",
    "history.emptyDesc": "ستظهر فحوصاتك هنا بعد إجراء أول تحليل",
    "history.viewDetails": "عرض التفاصيل",
    "history.compare": "مقارنة النتائج",
    "history.newScan": "فحص جديد",

    // Account
    "account.badge": "حسابي",
    "account.title": "معلومات الحساب",
    "account.subtitle": "عرض وتحديث معلوماتك الشخصية",
    "account.name": "الاسم",
    "account.email": "البريد الإلكتروني",
    "account.signOut": "تسجيل الخروج",
    "account.signInRequired": "يرجى تسجيل الدخول لعرض حسابك",

    // Language
    "lang.switch": "English",
  },
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.howItWorks": "How It Works",
    "nav.features": "Features",
    "nav.startScan": "Start Scan",
    "nav.menu": "Menu",

    // Hero
    "hero.badge": "AI Technology",
    "hero.title1": "Detect Early,",
    "hero.title2": "Stay Assured",
    "hero.description": "Nathirah uses the latest AI technology to analyze breast mammogram images and predict the likelihood of cancer recurrence, giving you the peace of mind and care you deserve.",
    "hero.cta": "Start Scanning Now",
    "hero.secondary": "How it works?",
    "hero.privacy": "Full Privacy",
    "hero.ai": "Advanced AI",

    // How it works
    "hiw.badge": "Steps",
    "hiw.title": "How does Nathirah work?",
    "hiw.subtitle": "Three simple steps to peace of mind",
    "hiw.step1.title": "Upload Image",
    "hiw.step1.desc": "Upload your breast mammogram image from your device easily and securely.",
    "hiw.step2.title": "Smart Analysis",
    "hiw.step2.desc": "Our AI system analyzes the image using advanced deep learning models.",
    "hiw.step3.title": "Get Results",
    "hiw.step3.desc": "Receive a detailed report with analysis results and recurrence probability.",

    // Features
    "feat.badge": "Features",
    "feat.title": "Why Choose Nathirah?",
    "feat.subtitle": "We provide a smart medical experience combining accuracy, speed, and privacy",
    "feat.1.title": "Precise Scan Analysis",
    "feat.1.desc": "Advanced scanning technology powered by AI for highly accurate breast mammogram analysis.",
    "feat.2.title": "Fast Results",
    "feat.2.desc": "Get your analysis results within seconds after uploading your image.",
    "feat.3.title": "Privacy & Security",
    "feat.3.desc": "Your data and medical images are protected with the highest security and privacy standards.",
    "feat.4.title": "Comprehensive Health Support",
    "feat.4.desc": "Detailed reports to help you and your doctor make the right health decisions.",

    // CTA
    "cta.title": "Your Health is Our Priority",
    "cta.desc": "Don't hesitate to use Nathirah for your peace of mind. Early detection is the best way to prevent and treat.",
    "cta.button": "Start Scanning Now",

    // Footer
    "footer.desc": "An intelligent service for predicting breast cancer recurrence through AI-powered mammogram analysis.",
    "footer.links": "Quick Links",
    "footer.scanner": "Scanner",
    "footer.contact": "Contact Us",
    "footer.country": "Saudi Arabia",
    "footer.rights": "All rights reserved",

    // Scanner
    "scan.badge": "Smart Scanner",
    "scan.title": "Breast MRI Analysis",
    "scan.desc": "Upload MRI images and our AI system will analyze them together with clinical data to predict recurrence probability",
    "scan.dragDrop": "Drag & drop images here or click to upload",
    "scan.formats": "Supports PNG, JPG formats",
    "scan.upload": "Upload MRI images",
    "scan.remove": "Remove image",
    "scan.disclaimer": "This analysis is for research and informational purposes only and does not replace professional medical consultation. Please consult your doctor for an accurate diagnosis.",
    "scan.analyze": "Analyze & Predict",
    "scan.analyzing": "Analyzing...",
    "scan.patientLookup": "Search Patient by ID",
    "scan.patientIdPlaceholder": "e.g. Breast_MRI_042",
    "scan.loadData": "Load Data",
    "scan.searching": "Searching...",
    "scan.lookupHint": "Entering a patient ID will auto-fill the clinical data from the database",
    "scan.lookupError": "Connection error with server",
    "scan.mriImages": "Patient MRI Images",
    "scan.slicesHint": "Recommended: 5–10 slices for best accuracy",
    "scan.imagesSelected": "images selected",
    "scan.clinicalData": "Clinical Data",
    "scan.autoFilled": "Auto-filled from database ✓",
    "scan.manualClinicalHint": "Enter clinical data manually, or use patient ID search above for auto-fill",
    "scan.noImages": "Please add MRI images first",
    "scan.apiError": "Error connecting to the analysis server. Make sure the server is running on port 5000",
    "scan.er": "ER Receptor",
    "scan.pr": "PR Receptor",
    "scan.her2": "HER2 Receptor",
    "scan.molSubtype": "Molecular Subtype",
    "scan.tStage": "Tumor Size (T)",
    "scan.nStage": "Lymph Nodes (N)",
    "scan.grade": "Tumor Grade",
    "scan.menopause": "Menopause Status",
    "scan.metastatic": "Metastatic at Diagnosis",
    "scan.positive": "Positive (+)",
    "scan.negative": "Negative (-)",
    "scan.borderline": "Borderline",
    "scan.preMenopause": "Pre-menopause",
    "scan.postMenopause": "Post-menopause",
    "scan.naMenopause": "N/A",
    "scan.yes": "Yes",
    "scan.no": "No",

    // Results
    "res.badge": "Analysis Result",
    "res.title": "Breast Cancer Recurrence Prediction Report",
    "res.riskLevel": "Risk Level:",
    "res.probability": "Recurrence Probability",
    "res.date": "Analysis Date",
    "res.analyzedBy": "Analyzed by Nathirah AI System",
    "res.recommendations": "Recommendations",
    "res.reminder": "Always remember that this analysis is a research support tool and does not replace specialized medical diagnosis. Your health deserves the best care.",
    "res.newScan": "New Analysis",
    "res.backHome": "Back to Home",
    "res.low": "Low",
    "res.medium": "Medium",
    "res.high": "High",
    "res.low.msg": "Results indicate a low probability of recurrence. This is a positive indicator.",
    "res.medium.msg": "Results indicate a moderate probability of recurrence requiring medical follow-up.",
    "res.high.msg": "Results indicate a high probability of recurrence requiring immediate medical attention.",
    "res.low.rec": "We recommend continuing regular follow-ups with your specialist and routine checkups as scheduled.",
    "res.medium.rec": "We strongly recommend consulting your specialist to discuss the results and determine an appropriate follow-up plan. Additional tests may be needed.",
    "res.high.rec": "Please contact your specialist as soon as possible to discuss the results and next steps. Don't hesitate to seek medical help.",
    "res.confidence": "Confidence Level",
    "res.dataSource": "Data Source",
    "res.imagesUsed": "Images Analyzed",
    "res.threshold": "Decision Threshold",
    "res.modelDetails": "Model Details",

    // Auth
    "auth.login": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.loginTitle": "Sign In",
    "auth.loginDesc": "Enter your email and password to access your account",
    "auth.signUpTitle": "Create Account",
    "auth.signUpDesc": "Create your account to start using Nathirah",
    "auth.email": "Email",
    "auth.emailPlaceholder": "example@email.com",
    "auth.password": "Password",
    "auth.repeatPassword": "Confirm Password",
    "auth.fullName": "Full Name",
    "auth.fullNamePlaceholder": "Enter your full name",
    "auth.showPassword": "Show password",
    "auth.hidePassword": "Hide password",
    "auth.loggingIn": "Signing in...",
    "auth.creatingAccount": "Creating account...",
    "auth.noAccount": "Don't have an account?",
    "auth.signUpLink": "Sign up",
    "auth.hasAccount": "Already have an account?",
    "auth.loginLink": "Sign in",
    "auth.backHome": "Back to home",
    "auth.welcomeBack": "Welcome Back",
    "auth.loginSubtitle": "Sign in to access the smart mammogram analysis service",
    "auth.joinNathirah": "Join Nathirah",
    "auth.signUpSubtitle": "Create your account and benefit from AI-powered prediction",
    "auth.passwordMismatch": "Passwords do not match",
    "auth.passwordTooShort": "Password must be at least 6 characters",
    "auth.genericError": "An error occurred, please try again",
    "auth.successTitle": "Registration Successful!",
    "auth.successDesc": "Your account has been created successfully. Please check your email to confirm your account before signing in.",
    "auth.goToLogin": "Go to Sign In",
    "auth.errorTitle": "Something Went Wrong",
    "auth.errorDesc": "Sorry, an error occurred during authentication.",
    "auth.tryAgain": "Try Again",
    "auth.logout": "Sign Out",
    "nav.login": "Sign In",
    "nav.signUp": "Sign Up",
    "nav.history": "Scan History",
    "nav.account": "My Account",

    // History
    "history.badge": "Scan History",
    "history.title": "Your Scan History",
    "history.subtitle": "View all past scans to compare results with your doctor",
    "history.empty": "No scans yet",
    "history.emptyDesc": "Your scans will appear here after your first analysis",
    "history.viewDetails": "View Details",
    "history.compare": "Compare Results",
    "history.newScan": "New Scan",

    // Account
    "account.badge": "My Account",
    "account.title": "Account Information",
    "account.subtitle": "View and manage your personal information",
    "account.name": "Name",
    "account.email": "Email",
    "account.signOut": "Sign Out",
    "account.signInRequired": "Please sign in to view your account",

    // Language
    "lang.switch": "العربية",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ar")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setLocale(getInitialLocale())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    }
  }, [locale, mounted])

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "ar" ? "en" : "ar"))
  }, [])

  const t = useCallback(
    (key: string) => {
      return translations[locale][key] || key
    },
    [locale]
  )

  const dir = locale === "ar" ? "rtl" : "ltr"

  return (
    <LanguageContext.Provider value={{ locale, dir, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
