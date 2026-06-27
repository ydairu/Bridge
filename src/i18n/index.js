import { createI18n } from 'vue-i18n'
import homeTranslations from './home'

export const supportedLocales = [
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'my', name: 'မြန်မာ' },
  { code: 'zh', name: '中文' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'fil', name: 'Filipino' },
  { code: 'ms', name: 'Bahasa Melayu' },
  { code: 'th', name: 'ไทย' },
  { code: 'si', name: 'සිංහල' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'ml', name: 'മലയാളം' }
]

const en = {
  language: 'Language',
  nav: {
    home: 'Home',
    browseJobs: 'Browse Jobs',
    reviews: 'Company Reviews',
    quiz: 'AI Quiz',
    postJob: 'Post Job',
    candidates: 'Browse Candidates',
    messages: 'Messages',
    profile: 'Profile',
    achievements: 'Achievements',
    applications: 'Applications',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    logout: 'Logout',
    login: 'Login',
    signUp: 'Sign Up'
  },
  hero: {
    eyebrow: "Singapore's worker-first hiring platform",
    line1: 'Matching Job-Seekers with Singaporean Employers',
    line2: 'Connecting Talent with Opportunities',
    line3: 'Building Careers in Singapore',
    description: 'Your pathway to success in Singapore. Connect with top employers and build your career today.',
    primary: 'Find your next opportunity',
    secondary: 'Browse jobs',
    direct: 'Direct applications',
    chat: 'Real-time employer chat',
    skills: 'Skills that travel with you',
    workerTitle: 'Built around workers',
    workerText: 'Clear jobs, direct contact, better careers.'
  },
  marketplace: {
    kicker: 'Opportunities across Singapore',
    title: 'Find work without the guesswork.',
    description: 'Compare clear job details, build your skills and connect directly with employers.',
    openRoles: 'open roles',
    categories: 'job categories',
    direct: 'Direct applications',
    browseCategory: 'Browse by Category',
    categoryHelp: 'Find jobs that match your skills and interests',
    jobs: 'jobs',
    browse: 'Browse Jobs',
    opportunities: '{count} opportunities available',
    search: 'Search jobs',
    recent: 'Most Recent',
    salaryHigh: 'Salary: High to Low',
    salaryLow: 'Salary: Low to High',
    relevant: 'Most Relevant',
    noResults: 'No jobs found. Try adjusting your search.',
    viewDetails: 'View Details'
  },
  filters: {
    title: 'Filters',
    active: 'Active Filters',
    clear: 'Clear All',
    salary: 'Salary Range',
    categories: 'Categories',
    location: 'Location',
    type: 'Job Type'
  },
  auth: {
    welcome: 'Welcome Back',
    continue: 'Sign in to continue to Bridge',
    create: 'Create Account',
    join: 'Join Bridge today',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    phone: 'Phone Number',
    confirmPassword: 'Confirm Password',
    jobSeeker: 'Job Seeker',
    employer: 'Employer',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    noAccount: "Don't have an account?",
    already: 'Already have an account?',
    signUp: 'Sign up'
  },
  footer: {
    mission: 'Connecting employers with skilled migrant workers in Singapore',
    workers: 'For Job Seekers',
    employers: 'For Employers',
    rights: 'All rights reserved.'
  }
}

const messages = {
  en,
  bn: {
    language: 'ভাষা',
    nav: { home: 'হোম', browseJobs: 'চাকরি খুঁজুন', reviews: 'কোম্পানি পর্যালোচনা', quiz: 'এআই কুইজ', postJob: 'চাকরি পোস্ট করুন', candidates: 'প্রার্থী খুঁজুন', messages: 'বার্তা', profile: 'প্রোফাইল', achievements: 'অর্জন', applications: 'আবেদন', darkMode: 'ডার্ক মোড', lightMode: 'লাইট মোড', logout: 'লগ আউট', login: 'লগ ইন', signUp: 'নিবন্ধন' },
    hero: { eyebrow: 'সিঙ্গাপুরের কর্মী-কেন্দ্রিক নিয়োগ প্ল্যাটফর্ম', line1: 'চাকরিপ্রার্থীদের সিঙ্গাপুরের নিয়োগকর্তাদের সাথে যুক্ত করছি', line2: 'প্রতিভার সাথে সুযোগের সংযোগ', line3: 'সিঙ্গাপুরে ক্যারিয়ার গড়ুন', description: 'সিঙ্গাপুরে সাফল্যের পথে এগিয়ে যান। ভালো নিয়োগকর্তার সাথে যুক্ত হয়ে আজই ক্যারিয়ার গড়ুন।', primary: 'পরবর্তী সুযোগ খুঁজুন', secondary: 'চাকরি দেখুন', direct: 'সরাসরি আবেদন', chat: 'নিয়োগকর্তার সাথে সরাসরি চ্যাট', skills: 'আপনার দক্ষতার পরিচয়', workerTitle: 'কর্মীদের জন্য তৈরি', workerText: 'স্পষ্ট চাকরি, সরাসরি যোগাযোগ, উন্নত ক্যারিয়ার।' },
    marketplace: { kicker: 'সিঙ্গাপুরজুড়ে সুযোগ', title: 'নিশ্চিন্তে কাজ খুঁজুন।', description: 'চাকরির তথ্য তুলনা করুন, দক্ষতা বাড়ান এবং সরাসরি নিয়োগকর্তার সাথে যোগাযোগ করুন।', openRoles: 'খালি পদ', categories: 'চাকরির বিভাগ', direct: 'সরাসরি আবেদন', browseCategory: 'বিভাগ অনুযায়ী দেখুন', categoryHelp: 'আপনার দক্ষতা ও আগ্রহ অনুযায়ী চাকরি খুঁজুন', jobs: 'চাকরি', browse: 'চাকরি দেখুন', opportunities: '{count}টি সুযোগ আছে', search: 'চাকরি খুঁজুন', recent: 'সাম্প্রতিক', salaryHigh: 'বেতন: বেশি থেকে কম', salaryLow: 'বেতন: কম থেকে বেশি', relevant: 'সবচেয়ে প্রাসঙ্গিক', noResults: 'কোনো চাকরি পাওয়া যায়নি। অনুসন্ধান পরিবর্তন করুন।', viewDetails: 'বিস্তারিত দেখুন' },
    filters: { title: 'ফিল্টার', active: 'সক্রিয় ফিল্টার', clear: 'সব মুছুন', salary: 'বেতনের সীমা', categories: 'বিভাগ', location: 'অবস্থান', type: 'চাকরির ধরন' },
    auth: { welcome: 'আবার স্বাগতম', continue: 'Bridge-এ চালিয়ে যেতে লগ ইন করুন', create: 'অ্যাকাউন্ট তৈরি করুন', join: 'আজই Bridge-এ যোগ দিন', email: 'ইমেইল', password: 'পাসওয়ার্ড', fullName: 'পুরো নাম', phone: 'ফোন নম্বর', confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন', jobSeeker: 'চাকরিপ্রার্থী', employer: 'নিয়োগকর্তা', signIn: 'লগ ইন', signingIn: 'লগ ইন হচ্ছে...', noAccount: 'অ্যাকাউন্ট নেই?', already: 'ইতিমধ্যে অ্যাকাউন্ট আছে?', signUp: 'নিবন্ধন করুন' },
    footer: { mission: 'সিঙ্গাপুরে নিয়োগকর্তা ও দক্ষ অভিবাসী কর্মীদের সংযুক্ত করছি', workers: 'চাকরিপ্রার্থীদের জন্য', employers: 'নিয়োগকর্তাদের জন্য', rights: 'সর্বস্বত্ব সংরক্ষিত।' }
  },
  ta: {
    language: 'மொழி',
    nav: { home: 'முகப்பு', browseJobs: 'வேலைகள்', reviews: 'நிறுவன மதிப்புரைகள்', quiz: 'AI வினாடிவினா', postJob: 'வேலை பதிவிடு', candidates: 'விண்ணப்பதாரர்கள்', messages: 'செய்திகள்', profile: 'சுயவிவரம்', achievements: 'சாதனைகள்', applications: 'விண்ணப்பங்கள்', darkMode: 'இருண்ட பயன்முறை', lightMode: 'ஒளி பயன்முறை', logout: 'வெளியேறு', login: 'உள்நுழை', signUp: 'பதிவு செய்' },
    hero: { eyebrow: 'சிங்கப்பூரின் தொழிலாளர் முன்னுரிமை வேலைவாய்ப்பு தளம்', line1: 'வேலை தேடுபவர்களை சிங்கப்பூர் நிறுவனங்களுடன் இணைக்கிறோம்', line2: 'திறமையை வாய்ப்புகளுடன் இணைக்கிறோம்', line3: 'சிங்கப்பூரில் உங்கள் வாழ்க்கையை உருவாக்குங்கள்', description: 'சிங்கப்பூரில் வெற்றிக்கான உங்கள் பாதை. சிறந்த நிறுவனங்களுடன் இணைந்து இன்று உங்கள் வாழ்க்கையை உருவாக்குங்கள்.', primary: 'அடுத்த வாய்ப்பைக் கண்டறியுங்கள்', secondary: 'வேலைகளைப் பாருங்கள்', direct: 'நேரடி விண்ணப்பங்கள்', chat: 'நிறுவனத்துடன் நேரடி உரையாடல்', skills: 'உங்களுடன் பயணிக்கும் திறன்கள்', workerTitle: 'தொழிலாளர்களுக்காக உருவாக்கப்பட்டது', workerText: 'தெளிவான வேலைகள், நேரடி தொடர்பு, சிறந்த வாழ்க்கை.' },
    marketplace: { kicker: 'சிங்கப்பூர் முழுவதும் வாய்ப்புகள்', title: 'குழப்பமின்றி வேலை தேடுங்கள்.', description: 'வேலை விவரங்களை ஒப்பிட்டு, திறன்களை வளர்த்து, நிறுவனங்களுடன் நேரடியாக இணையுங்கள்.', openRoles: 'காலியிடங்கள்', categories: 'வேலை வகைகள்', direct: 'நேரடி விண்ணப்பங்கள்', browseCategory: 'வகைப்படி தேடுங்கள்', categoryHelp: 'உங்கள் திறன் மற்றும் ஆர்வத்திற்கு ஏற்ற வேலைகளைக் கண்டறியுங்கள்', jobs: 'வேலைகள்', browse: 'வேலைகள்', opportunities: '{count} வாய்ப்புகள் உள்ளன', search: 'வேலை தேடுங்கள்', recent: 'சமீபத்தியவை', salaryHigh: 'சம்பளம்: அதிகம் முதல் குறைவு', salaryLow: 'சம்பளம்: குறைவு முதல் அதிகம்', relevant: 'மிகப் பொருத்தமானது', noResults: 'வேலைகள் கிடைக்கவில்லை. தேடலை மாற்றிப் பாருங்கள்.', viewDetails: 'விவரங்கள்' },
    filters: { title: 'வடிகட்டிகள்', active: 'செயலில் உள்ளவை', clear: 'அனைத்தையும் நீக்கு', salary: 'சம்பள வரம்பு', categories: 'வகைகள்', location: 'இடம்', type: 'வேலை வகை' },
    auth: { welcome: 'மீண்டும் வரவேற்கிறோம்', continue: 'Bridge-ஐ தொடர உள்நுழையுங்கள்', create: 'கணக்கு உருவாக்கு', join: 'இன்றே Bridge-ல் இணையுங்கள்', email: 'மின்னஞ்சல்', password: 'கடவுச்சொல்', fullName: 'முழுப் பெயர்', phone: 'தொலைபேசி எண்', confirmPassword: 'கடவுச்சொல்லை உறுதிசெய்', jobSeeker: 'வேலை தேடுபவர்', employer: 'நிறுவனம்', signIn: 'உள்நுழை', signingIn: 'உள்நுழைகிறது...', noAccount: 'கணக்கு இல்லையா?', already: 'ஏற்கனவே கணக்கு உள்ளதா?', signUp: 'பதிவு செய்' },
    footer: { mission: 'சிங்கப்பூரில் நிறுவனங்களையும் திறமையான புலம்பெயர் தொழிலாளர்களையும் இணைக்கிறோம்', workers: 'வேலை தேடுபவர்களுக்கு', employers: 'நிறுவனங்களுக்கு', rights: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.' }
  },
  hi: {
    language: 'भाषा',
    nav: { home: 'होम', browseJobs: 'नौकरियाँ', reviews: 'कंपनी समीक्षाएँ', quiz: 'एआई क्विज़', postJob: 'नौकरी पोस्ट करें', candidates: 'उम्मीदवार', messages: 'संदेश', profile: 'प्रोफ़ाइल', achievements: 'उपलब्धियाँ', applications: 'आवेदन', darkMode: 'डार्क मोड', lightMode: 'लाइट मोड', logout: 'लॉग आउट', login: 'लॉग इन', signUp: 'साइन अप' },
    hero: { eyebrow: 'सिंगापुर का कामगार-केंद्रित भर्ती मंच', line1: 'नौकरी चाहने वालों को सिंगापुर के नियोक्ताओं से जोड़ना', line2: 'प्रतिभा को अवसरों से जोड़ना', line3: 'सिंगापुर में करियर बनाएँ', description: 'सिंगापुर में सफलता का आपका रास्ता। अच्छे नियोक्ताओं से जुड़ें और आज ही अपना करियर बनाएँ।', primary: 'अगला अवसर खोजें', secondary: 'नौकरियाँ देखें', direct: 'सीधे आवेदन', chat: 'नियोक्ता से सीधी बातचीत', skills: 'आपके साथ चलने वाले कौशल', workerTitle: 'कामगारों के लिए बनाया गया', workerText: 'स्पष्ट नौकरियाँ, सीधा संपर्क, बेहतर करियर।' },
    marketplace: { kicker: 'पूरे सिंगापुर में अवसर', title: 'बिना उलझन के काम खोजें।', description: 'स्पष्ट नौकरी विवरण की तुलना करें, कौशल बढ़ाएँ और नियोक्ताओं से सीधे जुड़ें।', openRoles: 'खाली पद', categories: 'नौकरी श्रेणियाँ', direct: 'सीधे आवेदन', browseCategory: 'श्रेणी से खोजें', categoryHelp: 'अपने कौशल और रुचि से मेल खाने वाली नौकरी खोजें', jobs: 'नौकरियाँ', browse: 'नौकरियाँ देखें', opportunities: '{count} अवसर उपलब्ध', search: 'नौकरी खोजें', recent: 'सबसे नया', salaryHigh: 'वेतन: अधिक से कम', salaryLow: 'वेतन: कम से अधिक', relevant: 'सबसे प्रासंगिक', noResults: 'कोई नौकरी नहीं मिली। खोज बदलकर देखें।', viewDetails: 'विवरण देखें' },
    filters: { title: 'फ़िल्टर', active: 'सक्रिय फ़िल्टर', clear: 'सब हटाएँ', salary: 'वेतन सीमा', categories: 'श्रेणियाँ', location: 'स्थान', type: 'नौकरी का प्रकार' },
    auth: { welcome: 'वापसी पर स्वागत है', continue: 'Bridge पर जारी रखने के लिए लॉग इन करें', create: 'खाता बनाएँ', join: 'आज ही Bridge से जुड़ें', email: 'ईमेल', password: 'पासवर्ड', fullName: 'पूरा नाम', phone: 'फ़ोन नंबर', confirmPassword: 'पासवर्ड की पुष्टि करें', jobSeeker: 'नौकरी चाहने वाला', employer: 'नियोक्ता', signIn: 'लॉग इन', signingIn: 'लॉग इन हो रहा है...', noAccount: 'खाता नहीं है?', already: 'पहले से खाता है?', signUp: 'साइन अप करें' },
    footer: { mission: 'सिंगापुर में नियोक्ताओं को कुशल प्रवासी कामगारों से जोड़ना', workers: 'नौकरी चाहने वालों के लिए', employers: 'नियोक्ताओं के लिए', rights: 'सर्वाधिकार सुरक्षित।' }
  },
  my: {
    language: 'ဘာသာစကား',
    nav: { home: 'ပင်မ', browseJobs: 'အလုပ်ရှာရန်', reviews: 'ကုမ္ပဏီသုံးသပ်ချက်', quiz: 'AI မေးခွန်း', postJob: 'အလုပ်တင်ရန်', candidates: 'လျှောက်ထားသူများ', messages: 'စာများ', profile: 'ကိုယ်ရေးအချက်အလက်', achievements: 'အောင်မြင်မှုများ', applications: 'လျှောက်လွှာများ', darkMode: 'အမှောင်ပုံစံ', lightMode: 'အလင်းပုံစံ', logout: 'ထွက်ရန်', login: 'ဝင်ရန်', signUp: 'စာရင်းသွင်းရန်' },
    hero: { eyebrow: 'စင်ကာပူ၏ အလုပ်သမားဦးစားပေး အလုပ်ခန့်အပ်ရေးပလက်ဖောင်း', line1: 'အလုပ်ရှာသူများကို စင်ကာပူအလုပ်ရှင်များနှင့် ချိတ်ဆက်ပေးခြင်း', line2: 'ကျွမ်းကျင်မှုနှင့် အခွင့်အလမ်းကို ချိတ်ဆက်ခြင်း', line3: 'စင်ကာပူတွင် အလုပ်အကိုင်ဘဝ တည်ဆောက်ပါ', description: 'စင်ကာပူတွင် အောင်မြင်ရန် သင့်လမ်းကြောင်း။ အလုပ်ရှင်ကောင်းများနှင့် ချိတ်ဆက်ပြီး ယနေ့ပင် အလုပ်အကိုင်ဘဝ တည်ဆောက်ပါ။', primary: 'နောက်ထပ်အခွင့်အလမ်းရှာပါ', secondary: 'အလုပ်များကြည့်ရန်', direct: 'တိုက်ရိုက်လျှောက်ထားမှု', chat: 'အလုပ်ရှင်နှင့် တိုက်ရိုက်စကားပြောခြင်း', skills: 'သင်နှင့်အတူရှိမည့် ကျွမ်းကျင်မှု', workerTitle: 'အလုပ်သမားများအတွက် ဖန်တီးထားသည်', workerText: 'ရှင်းလင်းသောအလုပ်၊ တိုက်ရိုက်ဆက်သွယ်မှု၊ ပိုကောင်းသောအနာဂတ်။' },
    marketplace: { kicker: 'စင်ကာပူတစ်ဝန်း အခွင့်အလမ်းများ', title: 'မရှုပ်ထွေးဘဲ အလုပ်ရှာပါ။', description: 'အလုပ်အချက်အလက်များကို နှိုင်းယှဉ်ပါ၊ ကျွမ်းကျင်မှုတိုးတက်စေပြီး အလုပ်ရှင်များနှင့် တိုက်ရိုက်ချိတ်ဆက်ပါ။', openRoles: 'အလုပ်လစ်လပ်', categories: 'အလုပ်အမျိုးအစား', direct: 'တိုက်ရိုက်လျှောက်ထားမှု', browseCategory: 'အမျိုးအစားအလိုက်ရှာရန်', categoryHelp: 'သင့်ကျွမ်းကျင်မှုနှင့် စိတ်ဝင်စားမှုကိုက်ညီသောအလုပ်ရှာပါ', jobs: 'အလုပ်များ', browse: 'အလုပ်များ', opportunities: 'အခွင့်အလမ်း {count} ခုရှိသည်', search: 'အလုပ်ရှာရန်', recent: 'နောက်ဆုံးတင်ထားသည်', salaryHigh: 'လစာ: မြင့်မှနိမ့်', salaryLow: 'လစာ: နိမ့်မှမြင့်', relevant: 'အသင့်တော်ဆုံး', noResults: 'အလုပ်မတွေ့ပါ။ ရှာဖွေမှုကို ပြောင်းကြည့်ပါ။', viewDetails: 'အသေးစိတ်ကြည့်ရန်' },
    filters: { title: 'စစ်ထုတ်ရန်', active: 'အသုံးပြုထားသောစစ်ထုတ်မှု', clear: 'အားလုံးရှင်းရန်', salary: 'လစာအပိုင်းအခြား', categories: 'အမျိုးအစားများ', location: 'နေရာ', type: 'အလုပ်ပုံစံ' },
    auth: { welcome: 'ပြန်လည်ကြိုဆိုပါသည်', continue: 'Bridge ကို ဆက်သုံးရန် ဝင်ပါ', create: 'အကောင့်ဖန်တီးရန်', join: 'ယနေ့ Bridge သို့ ဝင်ရောက်ပါ', email: 'အီးမေးလ်', password: 'စကားဝှက်', fullName: 'အမည်အပြည့်အစုံ', phone: 'ဖုန်းနံပါတ်', confirmPassword: 'စကားဝှက်အတည်ပြုရန်', jobSeeker: 'အလုပ်ရှာသူ', employer: 'အလုပ်ရှင်', signIn: 'ဝင်ရန်', signingIn: 'ဝင်နေသည်...', noAccount: 'အကောင့်မရှိသေးဘူးလား?', already: 'အကောင့်ရှိပြီးသားလား?', signUp: 'စာရင်းသွင်းရန်' },
    footer: { mission: 'စင်ကာပူရှိ အလုပ်ရှင်များနှင့် ကျွမ်းကျင်ရွှေ့ပြောင်းအလုပ်သမားများကို ချိတ်ဆက်ပေးခြင်း', workers: 'အလုပ်ရှာသူများအတွက်', employers: 'အလုပ်ရှင်များအတွက်', rights: 'မူပိုင်ခွင့်အားလုံးရရှိထားသည်။' }
  },
  zh: {
    language: '语言',
    nav: { home: '首页', browseJobs: '浏览职位', reviews: '公司评价', quiz: 'AI 测验', postJob: '发布职位', candidates: '浏览候选人', messages: '消息', profile: '个人资料', achievements: '成就', applications: '申请', darkMode: '深色模式', lightMode: '浅色模式', logout: '退出', login: '登录', signUp: '注册' },
    hero: { eyebrow: '新加坡以劳动者为本的招聘平台', line1: '连接求职者与新加坡雇主', line2: '让人才遇见机会', line3: '在新加坡建立职业生涯', description: '您在新加坡迈向成功的道路。连接优秀雇主，从今天开始建立职业生涯。', primary: '寻找下一个机会', secondary: '浏览职位', direct: '直接申请', chat: '与雇主实时沟通', skills: '随您同行的技能', workerTitle: '为劳动者而设计', workerText: '清晰职位、直接联系、更好职业。' },
    marketplace: { kicker: '全新加坡工作机会', title: '清楚放心地找工作。', description: '比较清晰的职位信息、提升技能，并与雇主直接联系。', openRoles: '个空缺职位', categories: '个职位类别', direct: '直接申请', browseCategory: '按类别浏览', categoryHelp: '寻找符合您技能和兴趣的职位', jobs: '个职位', browse: '浏览职位', opportunities: '共有 {count} 个机会', search: '搜索职位', recent: '最新发布', salaryHigh: '薪资：从高到低', salaryLow: '薪资：从低到高', relevant: '最相关', noResults: '未找到职位，请调整搜索条件。', viewDetails: '查看详情' },
    filters: { title: '筛选', active: '已选筛选', clear: '全部清除', salary: '薪资范围', categories: '职位类别', location: '地点', type: '工作类型' },
    auth: { welcome: '欢迎回来', continue: '登录以继续使用 Bridge', create: '创建账户', join: '立即加入 Bridge', email: '电子邮箱', password: '密码', fullName: '姓名', phone: '电话号码', confirmPassword: '确认密码', jobSeeker: '求职者', employer: '雇主', signIn: '登录', signingIn: '正在登录...', noAccount: '还没有账户？', already: '已有账户？', signUp: '注册' },
    footer: { mission: '连接新加坡雇主与有技能的外籍劳动者', workers: '求职者专区', employers: '雇主专区', rights: '版权所有。' }
  },
  id: {
    language: 'Bahasa',
    nav: { home: 'Beranda', browseJobs: 'Cari Pekerjaan', reviews: 'Ulasan Perusahaan', quiz: 'Kuis AI', postJob: 'Pasang Lowongan', candidates: 'Cari Kandidat', messages: 'Pesan', profile: 'Profil', achievements: 'Pencapaian', applications: 'Lamaran', darkMode: 'Mode Gelap', lightMode: 'Mode Terang', logout: 'Keluar', login: 'Masuk', signUp: 'Daftar' },
    hero: { eyebrow: 'Platform rekrutmen Singapura yang mengutamakan pekerja', line1: 'Menghubungkan Pencari Kerja dengan Perusahaan Singapura', line2: 'Menghubungkan Talenta dengan Peluang', line3: 'Bangun Karier di Singapura', description: 'Jalan Anda menuju sukses di Singapura. Terhubung dengan perusahaan terbaik dan bangun karier Anda hari ini.', primary: 'Temukan peluang berikutnya', secondary: 'Lihat pekerjaan', direct: 'Lamaran langsung', chat: 'Obrolan langsung dengan perusahaan', skills: 'Keahlian yang selalu bersama Anda', workerTitle: 'Dibangun untuk pekerja', workerText: 'Pekerjaan jelas, kontak langsung, karier lebih baik.' },
    marketplace: { kicker: 'Peluang di seluruh Singapura', title: 'Cari kerja tanpa kebingungan.', description: 'Bandingkan informasi pekerjaan, tingkatkan keahlian, dan hubungi perusahaan secara langsung.', openRoles: 'lowongan tersedia', categories: 'kategori pekerjaan', direct: 'Lamaran langsung', browseCategory: 'Telusuri berdasarkan kategori', categoryHelp: 'Temukan pekerjaan yang sesuai dengan keahlian dan minat Anda', jobs: 'pekerjaan', browse: 'Cari Pekerjaan', opportunities: '{count} peluang tersedia', search: 'Cari pekerjaan', recent: 'Terbaru', salaryHigh: 'Gaji: Tinggi ke Rendah', salaryLow: 'Gaji: Rendah ke Tinggi', relevant: 'Paling Relevan', noResults: 'Pekerjaan tidak ditemukan. Ubah pencarian Anda.', viewDetails: 'Lihat Detail' },
    filters: { title: 'Filter', active: 'Filter Aktif', clear: 'Hapus Semua', salary: 'Rentang Gaji', categories: 'Kategori', location: 'Lokasi', type: 'Jenis Pekerjaan' },
    auth: { welcome: 'Selamat Datang Kembali', continue: 'Masuk untuk melanjutkan ke Bridge', create: 'Buat Akun', join: 'Bergabunglah dengan Bridge hari ini', email: 'Email', password: 'Kata Sandi', fullName: 'Nama Lengkap', phone: 'Nomor Telepon', confirmPassword: 'Konfirmasi Kata Sandi', jobSeeker: 'Pencari Kerja', employer: 'Perusahaan', signIn: 'Masuk', signingIn: 'Sedang masuk...', noAccount: 'Belum punya akun?', already: 'Sudah punya akun?', signUp: 'Daftar' },
    footer: { mission: 'Menghubungkan perusahaan dengan pekerja migran terampil di Singapura', workers: 'Untuk Pencari Kerja', employers: 'Untuk Perusahaan', rights: 'Hak cipta dilindungi.' }
  },
  fil: {
    language: 'Wika',
    nav: { home: 'Home', browseJobs: 'Maghanap ng Trabaho', reviews: 'Mga Review ng Kumpanya', quiz: 'AI Quiz', postJob: 'Mag-post ng Trabaho', candidates: 'Mga Kandidato', messages: 'Mga Mensahe', profile: 'Profile', achievements: 'Mga Tagumpay', applications: 'Mga Aplikasyon', darkMode: 'Dark Mode', lightMode: 'Light Mode', logout: 'Mag-logout', login: 'Mag-login', signUp: 'Mag-sign Up' },
    hero: { eyebrow: 'Platform sa Singapore na inuuna ang manggagawa', line1: 'Pinag-uugnay ang mga Naghahanap ng Trabaho at mga Employer sa Singapore', line2: 'Pinag-uugnay ang Talento at Oportunidad', line3: 'Bumuo ng Karera sa Singapore', description: 'Ang landas mo tungo sa tagumpay sa Singapore. Kumonekta sa mahuhusay na employer at simulan ang iyong karera ngayon.', primary: 'Hanapin ang susunod na oportunidad', secondary: 'Tingnan ang mga trabaho', direct: 'Direktang aplikasyon', chat: 'Direktang chat sa employer', skills: 'Mga kasanayang dala mo', workerTitle: 'Ginawa para sa mga manggagawa', workerText: 'Malinaw na trabaho, direktang ugnayan, mas magandang karera.' },
    marketplace: { kicker: 'Mga oportunidad sa buong Singapore', title: 'Maghanap ng trabaho nang malinaw.', description: 'Ihambing ang malinaw na detalye, paunlarin ang kasanayan, at direktang kumonekta sa employer.', openRoles: 'bukas na posisyon', categories: 'kategorya', direct: 'Direktang aplikasyon', browseCategory: 'Maghanap ayon sa kategorya', categoryHelp: 'Humanap ng trabahong tugma sa iyong kasanayan at interes', jobs: 'trabaho', browse: 'Maghanap ng Trabaho', opportunities: '{count} oportunidad ang available', search: 'Maghanap ng trabaho', recent: 'Pinakabago', salaryHigh: 'Sahod: Mataas pababa', salaryLow: 'Sahod: Mababa pataas', relevant: 'Pinakanauugnay', noResults: 'Walang nahanap na trabaho. Baguhin ang iyong paghahanap.', viewDetails: 'Tingnan ang Detalye' },
    filters: { title: 'Mga Filter', active: 'Aktibong Filter', clear: 'Alisin Lahat', salary: 'Saklaw ng Sahod', categories: 'Mga Kategorya', location: 'Lokasyon', type: 'Uri ng Trabaho' },
    auth: { welcome: 'Maligayang Pagbabalik', continue: 'Mag-login upang magpatuloy sa Bridge', create: 'Gumawa ng Account', join: 'Sumali sa Bridge ngayon', email: 'Email', password: 'Password', fullName: 'Buong Pangalan', phone: 'Numero ng Telepono', confirmPassword: 'Kumpirmahin ang Password', jobSeeker: 'Naghahanap ng Trabaho', employer: 'Employer', signIn: 'Mag-login', signingIn: 'Nagla-login...', noAccount: 'Wala pang account?', already: 'May account na?', signUp: 'Mag-sign up' },
    footer: { mission: 'Pinag-uugnay ang mga employer at bihasang migranteng manggagawa sa Singapore', workers: 'Para sa Naghahanap ng Trabaho', employers: 'Para sa Employer', rights: 'Lahat ng karapatan ay nakalaan.' }
  },
  ms: {
    language: 'Bahasa',
    nav: { home: 'Laman Utama', browseJobs: 'Cari Kerja', reviews: 'Ulasan Syarikat', quiz: 'Kuiz AI', postJob: 'Iklankan Kerja', candidates: 'Cari Calon', messages: 'Mesej', profile: 'Profil', achievements: 'Pencapaian', applications: 'Permohonan', darkMode: 'Mod Gelap', lightMode: 'Mod Cerah', logout: 'Log Keluar', login: 'Log Masuk', signUp: 'Daftar' },
    hero: { eyebrow: 'Platform pengambilan Singapura yang mengutamakan pekerja', line1: 'Menghubungkan Pencari Kerja dengan Majikan Singapura', line2: 'Menghubungkan Bakat dengan Peluang', line3: 'Bina Kerjaya di Singapura', description: 'Laluan anda menuju kejayaan di Singapura. Berhubung dengan majikan terbaik dan bina kerjaya anda hari ini.', primary: 'Cari peluang seterusnya', secondary: 'Lihat pekerjaan', direct: 'Permohonan terus', chat: 'Sembang terus dengan majikan', skills: 'Kemahiran yang dibawa bersama', workerTitle: 'Dibina untuk pekerja', workerText: 'Kerja yang jelas, hubungan terus, kerjaya lebih baik.' },
    marketplace: { kicker: 'Peluang di seluruh Singapura', title: 'Cari kerja tanpa kekeliruan.', description: 'Bandingkan butiran kerja, tingkatkan kemahiran dan berhubung terus dengan majikan.', openRoles: 'jawatan kosong', categories: 'kategori kerja', direct: 'Permohonan terus', browseCategory: 'Lihat mengikut kategori', categoryHelp: 'Cari kerja yang sesuai dengan kemahiran dan minat anda', jobs: 'kerja', browse: 'Cari Kerja', opportunities: '{count} peluang tersedia', search: 'Cari kerja', recent: 'Terkini', salaryHigh: 'Gaji: Tinggi ke Rendah', salaryLow: 'Gaji: Rendah ke Tinggi', relevant: 'Paling Berkaitan', noResults: 'Tiada kerja ditemui. Cuba ubah carian anda.', viewDetails: 'Lihat Butiran' },
    filters: { title: 'Penapis', active: 'Penapis Aktif', clear: 'Kosongkan Semua', salary: 'Julat Gaji', categories: 'Kategori', location: 'Lokasi', type: 'Jenis Kerja' },
    auth: { welcome: 'Selamat Kembali', continue: 'Log masuk untuk meneruskan ke Bridge', create: 'Cipta Akaun', join: 'Sertai Bridge hari ini', email: 'E-mel', password: 'Kata Laluan', fullName: 'Nama Penuh', phone: 'Nombor Telefon', confirmPassword: 'Sahkan Kata Laluan', jobSeeker: 'Pencari Kerja', employer: 'Majikan', signIn: 'Log Masuk', signingIn: 'Sedang log masuk...', noAccount: 'Belum mempunyai akaun?', already: 'Sudah mempunyai akaun?', signUp: 'Daftar' },
    footer: { mission: 'Menghubungkan majikan dengan pekerja migran berkemahiran di Singapura', workers: 'Untuk Pencari Kerja', employers: 'Untuk Majikan', rights: 'Hak cipta terpelihara.' }
  },
  th: {
    language: 'ภาษา',
    nav: { home: 'หน้าหลัก', browseJobs: 'ค้นหางาน', reviews: 'รีวิวบริษัท', quiz: 'แบบทดสอบ AI', postJob: 'ลงประกาศงาน', candidates: 'ค้นหาผู้สมัคร', messages: 'ข้อความ', profile: 'โปรไฟล์', achievements: 'ความสำเร็จ', applications: 'ใบสมัคร', darkMode: 'โหมดมืด', lightMode: 'โหมดสว่าง', logout: 'ออกจากระบบ', login: 'เข้าสู่ระบบ', signUp: 'สมัครสมาชิก' },
    hero: { eyebrow: 'แพลตฟอร์มหางานสิงคโปร์ที่ให้ความสำคัญกับแรงงาน', line1: 'เชื่อมต่อผู้หางานกับนายจ้างในสิงคโปร์', line2: 'เชื่อมต่อความสามารถกับโอกาส', line3: 'สร้างอาชีพในสิงคโปร์', description: 'เส้นทางสู่ความสำเร็จในสิงคโปร์ เชื่อมต่อกับนายจ้างชั้นนำและเริ่มสร้างอาชีพวันนี้', primary: 'ค้นหาโอกาสถัดไป', secondary: 'ดูงาน', direct: 'สมัครโดยตรง', chat: 'สนทนากับนายจ้างโดยตรง', skills: 'ทักษะที่ติดตัวคุณ', workerTitle: 'สร้างขึ้นเพื่อแรงงาน', workerText: 'งานชัดเจน ติดต่อโดยตรง อาชีพที่ดีกว่า' },
    marketplace: { kicker: 'โอกาสทั่วสิงคโปร์', title: 'หางานอย่างมั่นใจและชัดเจน', description: 'เปรียบเทียบข้อมูลงาน พัฒนาทักษะ และติดต่อนายจ้างโดยตรง', openRoles: 'ตำแหน่งว่าง', categories: 'หมวดหมู่งาน', direct: 'สมัครโดยตรง', browseCategory: 'ค้นหาตามหมวดหมู่', categoryHelp: 'ค้นหางานที่ตรงกับทักษะและความสนใจของคุณ', jobs: 'งาน', browse: 'ค้นหางาน', opportunities: 'มี {count} โอกาส', search: 'ค้นหางาน', recent: 'ล่าสุด', salaryHigh: 'เงินเดือน: สูงไปต่ำ', salaryLow: 'เงินเดือน: ต่ำไปสูง', relevant: 'เกี่ยวข้องมากที่สุด', noResults: 'ไม่พบงาน ลองปรับการค้นหา', viewDetails: 'ดูรายละเอียด' },
    filters: { title: 'ตัวกรอง', active: 'ตัวกรองที่ใช้', clear: 'ล้างทั้งหมด', salary: 'ช่วงเงินเดือน', categories: 'หมวดหมู่', location: 'สถานที่', type: 'ประเภทงาน' },
    auth: { welcome: 'ยินดีต้อนรับกลับ', continue: 'เข้าสู่ระบบเพื่อใช้งาน Bridge ต่อ', create: 'สร้างบัญชี', join: 'เข้าร่วม Bridge วันนี้', email: 'อีเมล', password: 'รหัสผ่าน', fullName: 'ชื่อ-นามสกุล', phone: 'หมายเลขโทรศัพท์', confirmPassword: 'ยืนยันรหัสผ่าน', jobSeeker: 'ผู้หางาน', employer: 'นายจ้าง', signIn: 'เข้าสู่ระบบ', signingIn: 'กำลังเข้าสู่ระบบ...', noAccount: 'ยังไม่มีบัญชี?', already: 'มีบัญชีแล้ว?', signUp: 'สมัครสมาชิก' },
    footer: { mission: 'เชื่อมต่อนายจ้างกับแรงงานข้ามชาติที่มีทักษะในสิงคโปร์', workers: 'สำหรับผู้หางาน', employers: 'สำหรับนายจ้าง', rights: 'สงวนลิขสิทธิ์' }
  },
  si: {
    language: 'භාෂාව',
    nav: { home: 'මුල් පිටුව', browseJobs: 'රැකියා සොයන්න', reviews: 'සමාගම් සමාලෝචන', quiz: 'AI ප්‍රශ්නාවලිය', postJob: 'රැකියාවක් පළ කරන්න', candidates: 'අයදුම්කරුවන්', messages: 'පණිවිඩ', profile: 'පැතිකඩ', achievements: 'ජයග්‍රහණ', applications: 'අයදුම්පත්', darkMode: 'අඳුරු මාදිලිය', lightMode: 'ආලෝක මාදිලිය', logout: 'පිටවන්න', login: 'පිවිසෙන්න', signUp: 'ලියාපදිංචි වන්න' },
    hero: { eyebrow: 'සිංගප්පූරුවේ සේවක ප්‍රමුඛ බඳවාගැනීමේ වේදිකාව', line1: 'රැකියා සොයන්නන් සිංගප්පූරු සේවායෝජකයන් සමඟ සම්බන්ධ කිරීම', line2: 'දක්ෂතාව අවස්ථා සමඟ සම්බන්ධ කිරීම', line3: 'සිංගප්පූරුවේ වෘත්තිය ගොඩනඟන්න', description: 'සිංගප්පූරුවේ සාර්ථකත්වයට ඔබගේ මාර්ගය. හොඳ සේවායෝජකයන් සමඟ සම්බන්ධ වී අදම වෘත්තිය ගොඩනඟන්න.', primary: 'ඊළඟ අවස්ථාව සොයන්න', secondary: 'රැකියා බලන්න', direct: 'සෘජු අයදුම්', chat: 'සේවායෝජකයා සමඟ සෘජු කතාබහ', skills: 'ඔබ සමඟ යන කුසලතා', workerTitle: 'සේවකයන් සඳහා නිර්මාණය කර ඇත', workerText: 'පැහැදිලි රැකියා, සෘජු සම්බන්ධතා, හොඳ වෘත්තියක්.' },
    marketplace: { kicker: 'සිංගප්පූරුව පුරා අවස්ථා', title: 'අවුලකින් තොරව රැකියාව සොයන්න.', description: 'රැකියා තොරතුරු සසඳන්න, කුසලතා වර්ධනය කරන්න සහ සේවායෝජකයන් සමඟ සෘජුව සම්බන්ධ වන්න.', openRoles: 'විවෘත තනතුරු', categories: 'රැකියා කාණ්ඩ', direct: 'සෘජු අයදුම්', browseCategory: 'කාණ්ඩය අනුව සොයන්න', categoryHelp: 'ඔබගේ කුසලතා සහ උනන්දුවට ගැළපෙන රැකියා සොයන්න', jobs: 'රැකියා', browse: 'රැකියා සොයන්න', opportunities: 'අවස්ථා {count}ක් ඇත', search: 'රැකියා සොයන්න', recent: 'නවතම', salaryHigh: 'වැටුප: ඉහළ සිට පහළට', salaryLow: 'වැටුප: පහළ සිට ඉහළට', relevant: 'වඩාත් ගැළපෙන', noResults: 'රැකියා හමු නොවීය. සෙවුම වෙනස් කරන්න.', viewDetails: 'විස්තර බලන්න' },
    filters: { title: 'පෙරහන්', active: 'සක්‍රීය පෙරහන්', clear: 'සියල්ල ඉවත් කරන්න', salary: 'වැටුප් පරාසය', categories: 'කාණ්ඩ', location: 'ස්ථානය', type: 'රැකියා වර්ගය' },
    auth: { welcome: 'නැවත සාදරයෙන් පිළිගනිමු', continue: 'Bridge භාවිතය සඳහා පිවිසෙන්න', create: 'ගිණුමක් සාදන්න', join: 'අදම Bridge හා එක්වන්න', email: 'විද්‍යුත් තැපෑල', password: 'මුරපදය', fullName: 'සම්පූර්ණ නම', phone: 'දුරකථන අංකය', confirmPassword: 'මුරපදය තහවුරු කරන්න', jobSeeker: 'රැකියා සොයන්නා', employer: 'සේවායෝජකයා', signIn: 'පිවිසෙන්න', signingIn: 'පිවිසෙමින්...', noAccount: 'ගිණුමක් නැද්ද?', already: 'දැනටමත් ගිණුමක් තිබේද?', signUp: 'ලියාපදිංචි වන්න' },
    footer: { mission: 'සිංගප්පූරුවේ සේවායෝජකයන් සහ දක්ෂ සංක්‍රමණික සේවකයන් සම්බන්ධ කිරීම', workers: 'රැකියා සොයන්නන් සඳහා', employers: 'සේවායෝජකයන් සඳහා', rights: 'සියලු හිමිකම් ඇවිරිණි.' }
  },
  te: {
    language: 'భాష',
    nav: { home: 'హోమ్', browseJobs: 'ఉద్యోగాలు', reviews: 'కంపెనీ సమీక్షలు', quiz: 'AI క్విజ్', postJob: 'ఉద్యోగం పోస్ట్ చేయండి', candidates: 'అభ్యర్థులు', messages: 'సందేశాలు', profile: 'ప్రొఫైల్', achievements: 'విజయాలు', applications: 'దరఖాస్తులు', darkMode: 'డార్క్ మోడ్', lightMode: 'లైట్ మోడ్', logout: 'లాగ్ అవుట్', login: 'లాగిన్', signUp: 'నమోదు' },
    hero: { eyebrow: 'సింగపూర్ కార్మిక ప్రాధాన్య నియామక వేదిక', line1: 'ఉద్యోగార్థులను సింగపూర్ యజమానులతో కలుపుతున్నాం', line2: 'ప్రతిభను అవకాశాలతో కలుపుతున్నాం', line3: 'సింగపూర్‌లో కెరీర్ నిర్మించండి', description: 'సింగపూర్‌లో విజయానికి మీ మార్గం. మంచి యజమానులతో కలసి ఈరోజే మీ కెరీర్‌ను నిర్మించండి.', primary: 'తదుపరి అవకాశాన్ని కనుగొనండి', secondary: 'ఉద్యోగాలు చూడండి', direct: 'నేరుగా దరఖాస్తు', chat: 'యజమానితో నేరుగా చాట్', skills: 'మీతో ఉండే నైపుణ్యాలు', workerTitle: 'కార్మికుల కోసం నిర్మించబడింది', workerText: 'స్పష్టమైన ఉద్యోగాలు, నేరుగా సంప్రదింపు, మెరుగైన కెరీర్.' },
    marketplace: { kicker: 'సింగపూర్ అంతటా అవకాశాలు', title: 'గందరగోళం లేకుండా పని వెతకండి.', description: 'ఉద్యోగ వివరాలను పోల్చండి, నైపుణ్యాలను పెంచుకోండి మరియు యజమానులతో నేరుగా కలవండి.', openRoles: 'ఖాళీ ఉద్యోగాలు', categories: 'ఉద్యోగ విభాగాలు', direct: 'నేరుగా దరఖాస్తు', browseCategory: 'విభాగం ప్రకారం చూడండి', categoryHelp: 'మీ నైపుణ్యాలు, ఆసక్తులకు సరిపోయే ఉద్యోగాలు కనుగొనండి', jobs: 'ఉద్యోగాలు', browse: 'ఉద్యోగాలు', opportunities: '{count} అవకాశాలు అందుబాటులో ఉన్నాయి', search: 'ఉద్యోగం వెతకండి', recent: 'తాజావి', salaryHigh: 'జీతం: ఎక్కువ నుండి తక్కువ', salaryLow: 'జీతం: తక్కువ నుండి ఎక్కువ', relevant: 'అత్యంత సంబంధిత', noResults: 'ఉద్యోగాలు లభించలేదు. శోధనను మార్చండి.', viewDetails: 'వివరాలు చూడండి' },
    filters: { title: 'ఫిల్టర్లు', active: 'సక్రియ ఫిల్టర్లు', clear: 'అన్నీ తొలగించండి', salary: 'జీతం పరిధి', categories: 'విభాగాలు', location: 'ప్రాంతం', type: 'ఉద్యోగ రకం' },
    auth: { welcome: 'తిరిగి స్వాగతం', continue: 'Bridge కొనసాగించడానికి లాగిన్ చేయండి', create: 'ఖాతా సృష్టించండి', join: 'ఈరోజే Bridgeలో చేరండి', email: 'ఇమెయిల్', password: 'పాస్‌వర్డ్', fullName: 'పూర్తి పేరు', phone: 'ఫోన్ నంబర్', confirmPassword: 'పాస్‌వర్డ్ నిర్ధారించండి', jobSeeker: 'ఉద్యోగార్థి', employer: 'యజమాని', signIn: 'లాగిన్', signingIn: 'లాగిన్ అవుతోంది...', noAccount: 'ఖాతా లేదా?', already: 'ఇప్పటికే ఖాతా ఉందా?', signUp: 'నమోదు' },
    footer: { mission: 'సింగపూర్‌లో యజమానులను నైపుణ్యం గల వలస కార్మికులతో కలుపుతున్నాం', workers: 'ఉద్యోగార్థుల కోసం', employers: 'యజమానుల కోసం', rights: 'అన్ని హక్కులు పరిరక్షించబడ్డాయి.' }
  },
  ml: {
    language: 'ഭാഷ',
    nav: { home: 'ഹോം', browseJobs: 'ജോലികൾ', reviews: 'കമ്പനി അവലോകനങ്ങൾ', quiz: 'AI ക്വിസ്', postJob: 'ജോലി പോസ്റ്റ് ചെയ്യുക', candidates: 'ഉദ്യോഗാർത്ഥികൾ', messages: 'സന്ദേശങ്ങൾ', profile: 'പ്രൊഫൈൽ', achievements: 'നേട്ടങ്ങൾ', applications: 'അപേക്ഷകൾ', darkMode: 'ഡാർക്ക് മോഡ്', lightMode: 'ലൈറ്റ് മോഡ്', logout: 'ലോഗ് ഔട്ട്', login: 'ലോഗിൻ', signUp: 'രജിസ്റ്റർ' },
    hero: { eyebrow: 'സിംഗപ്പൂരിലെ തൊഴിലാളി-പ്രഥമ നിയമന പ്ലാറ്റ്‌ഫോം', line1: 'തൊഴിലന്വേഷകരെ സിംഗപ്പൂർ തൊഴിലുടമകളുമായി ബന്ധിപ്പിക്കുന്നു', line2: 'കഴിവുകളെ അവസരങ്ങളുമായി ബന്ധിപ്പിക്കുന്നു', line3: 'സിംഗപ്പൂരിൽ കരിയർ നിർമ്മിക്കുക', description: 'സിംഗപ്പൂരിലെ വിജയത്തിലേക്കുള്ള നിങ്ങളുടെ വഴി. മികച്ച തൊഴിലുടമകളുമായി ബന്ധപ്പെട്ടു ഇന്ന് തന്നെ കരിയർ നിർമ്മിക്കുക.', primary: 'അടുത്ത അവസരം കണ്ടെത്തുക', secondary: 'ജോലികൾ കാണുക', direct: 'നേരിട്ടുള്ള അപേക്ഷ', chat: 'തൊഴിലുടമയുമായി നേരിട്ടുള്ള ചാറ്റ്', skills: 'നിങ്ങളോടൊപ്പം വരുന്ന കഴിവുകൾ', workerTitle: 'തൊഴിലാളികൾക്കായി നിർമ്മിച്ചത്', workerText: 'വ്യക്തമായ ജോലികൾ, നേരിട്ടുള്ള ബന്ധം, മികച്ച കരിയർ.' },
    marketplace: { kicker: 'സിംഗപ്പൂർ മുഴുവൻ അവസരങ്ങൾ', title: 'ആശയക്കുഴപ്പമില്ലാതെ ജോലി കണ്ടെത്തുക.', description: 'ജോലി വിവരങ്ങൾ താരതമ്യം ചെയ്യുക, കഴിവുകൾ വളർത്തുക, തൊഴിലുടമകളുമായി നേരിട്ട് ബന്ധപ്പെടുക.', openRoles: 'ഒഴിവുകൾ', categories: 'ജോലി വിഭാഗങ്ങൾ', direct: 'നേരിട്ടുള്ള അപേക്ഷ', browseCategory: 'വിഭാഗം അനുസരിച്ച് കാണുക', categoryHelp: 'നിങ്ങളുടെ കഴിവിനും താൽപര്യത്തിനും യോജിച്ച ജോലികൾ കണ്ടെത്തുക', jobs: 'ജോലികൾ', browse: 'ജോലികൾ', opportunities: '{count} അവസരങ്ങൾ ലഭ്യമാണ്', search: 'ജോലി തിരയുക', recent: 'ഏറ്റവും പുതിയത്', salaryHigh: 'ശമ്പളം: ഉയർന്നത് മുതൽ', salaryLow: 'ശമ്പളം: കുറഞ്ഞത് മുതൽ', relevant: 'ഏറ്റവും അനുയോജ്യം', noResults: 'ജോലികൾ കണ്ടെത്തിയില്ല. തിരച്ചിൽ മാറ്റുക.', viewDetails: 'വിശദാംശങ്ങൾ' },
    filters: { title: 'ഫിൽട്ടറുകൾ', active: 'സജീവ ഫിൽട്ടറുകൾ', clear: 'എല്ലാം മായ്ക്കുക', salary: 'ശമ്പള പരിധി', categories: 'വിഭാഗങ്ങൾ', location: 'സ്ഥലം', type: 'ജോലി തരം' },
    auth: { welcome: 'വീണ്ടും സ്വാഗതം', continue: 'Bridge തുടരാൻ ലോഗിൻ ചെയ്യുക', create: 'അക്കൗണ്ട് സൃഷ്ടിക്കുക', join: 'ഇന്ന് തന്നെ Bridge-ൽ ചേരുക', email: 'ഇമെയിൽ', password: 'പാസ്‌വേഡ്', fullName: 'പൂർണ്ണ പേര്', phone: 'ഫോൺ നമ്പർ', confirmPassword: 'പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക', jobSeeker: 'തൊഴിലന്വേഷകൻ', employer: 'തൊഴിലുടമ', signIn: 'ലോഗിൻ', signingIn: 'ലോഗിൻ ചെയ്യുന്നു...', noAccount: 'അക്കൗണ്ട് ഇല്ലേ?', already: 'അക്കൗണ്ട് ഉണ്ടോ?', signUp: 'രജിസ്റ്റർ' },
    footer: { mission: 'സിംഗപ്പൂരിലെ തൊഴിലുടമകളെയും വിദഗ്ധ കുടിയേറ്റ തൊഴിലാളികളെയും ബന്ധിപ്പിക്കുന്നു', workers: 'തൊഴിലന്വേഷകർക്കായി', employers: 'തൊഴിലുടമകൾക്കായി', rights: 'എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.' }
  }
}

Object.entries(homeTranslations).forEach(([localeCode, localizedHomepage]) => {
  messages[localeCode] = {
    ...messages[localeCode],
    ...localizedHomepage
  }
})

// Specialist screens intentionally fall back to English for any
// specialist screen not yet translated, so no interface ever shows raw keys.
const savedLocale = localStorage.getItem('bridge-locale')
const browserLocale = navigator.language?.split('-')[0]
const locale = supportedLocales.some(item => item.code === savedLocale)
  ? savedLocale
  : supportedLocales.some(item => item.code === browserLocale)
    ? browserLocale
    : 'en'

export default createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'en',
  messages
})
