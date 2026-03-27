export interface Translations {
  greeting: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
    format: (time: string, name?: string) => string;
  };
  tabs: {
    home: string;
    bookmarks: string;
    settings: string;
  };
  home: {
    swipeUp: string;
    readFullStory: string;
    trending: string;
    all: string;
  };
  bookmarks: {
    title: string;
    saved: (n: number) => string;
    emptyTitle: string;
    emptyDesc: string;
    readMore: string;
    readFullStory: string;
  };
  settings: {
    title: string;
    profile: string;
    yourName: string;
    namePlaceholder: string;
    notSet: string;
    edit: string;
    save: string;
    cancel: string;
    categoriesLabel: string;
    categoriesHint: (min: number, selected: number) => string;
    keywordsLabel: string;
    keywordsHint: string;
    noKeywords: string;
    keywordPlaceholder: string;
    maxKeywords: string;
    notificationsLabel: string;
    digestTimeLabel: string;
    digestTimeHint: string;
    languageLabel: string;
    languageHint: string;
    appearance: string;
    darkMode: string;
    about: string;
    appTagline: string;
    version: string;
    invalidName: string;
    nameError: string;
  };
  search: {
    placeholder: string;
    cancel: string;
    emptyHint: string;
    error: string;
    noResults: (query: string) => string;
    readFullStory: string;
  };
  empty: {
    errorTitle: string;
    noStoriesTitle: string;
    errorDesc: string;
    noStoriesDesc: string;
    retry: string;
  };
  notifications: {
    title: string;
    emptyTitle: string;
    emptyDesc: string;
    articles: (n: number) => string;
    today: string;
    yesterday: string;
  };
  onboarding: {
    categoriesTitle: string;
    categoriesHint: string;
    andDivider: string;
    keywordsTitle: string;
    keywordsHint: string;
    keywordPlaceholder: string;
    addKeyword: string;
    maxKeywords: string;
    permissionNotifTitle: string;
    permissionNotifDesc: string;
    permissionStorageTitle: string;
    permissionStorageDesc: string;
    allowBtn: string;
    maybeLater: string;
    startReading: string;
    selectMore: (n: number) => string;
    addOneKeyword: string;
  };
}

export const en: Translations = {
  greeting: {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
    format: (time, name) => name ? `Good ${time}, ${name}` : `Good ${time}`,
  },
  tabs: {
    home: 'Home',
    bookmarks: 'Bookmarks',
    settings: 'Settings',
  },
  home: {
    swipeUp: 'SWIPE UP',
    readFullStory: 'Read Full Story',
    trending: 'Trending',
    all: 'All',
  },
  bookmarks: {
    title: 'Bookmarks',
    saved: (n) => `${n} saved`,
    emptyTitle: 'No bookmarks yet',
    emptyDesc: 'Tap the heart icon on any article to save it here.',
    readMore: 'Read More',
    readFullStory: 'Read Full Story',
  },
  settings: {
    title: 'Settings',
    profile: 'PROFILE',
    yourName: 'Your Name',
    namePlaceholder: 'Your name',
    notSet: 'Not set',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    categoriesLabel: 'MY CATEGORIES',
    categoriesHint: (min, selected) => `Minimum ${min} required · ${selected} selected`,
    keywordsLabel: 'MY KEYWORDS',
    keywordsHint: 'Up to 2 keywords for your daily digest',
    noKeywords: 'No keywords added yet',
    keywordPlaceholder: 'Add a keyword…',
    maxKeywords: 'Max 2 keywords reached',
    notificationsLabel: 'NOTIFICATIONS',
    digestTimeLabel: 'Daily digest time',
    digestTimeHint: 'When to deliver your keyword digest',
    languageLabel: 'LANGUAGE',
    languageHint: 'Changing language will instantly update all app text and refetch news.',
    appearance: 'APPEARANCE',
    darkMode: 'Dark Mode',
    about: 'ABOUT',
    appTagline: 'Your daily news',
    version: 'Version',
    invalidName: 'Invalid Name',
    nameError: 'Please enter at least 2 characters.',
  },
  search: {
    placeholder: 'Search news…',
    cancel: 'Cancel',
    emptyHint: 'Search for any topic, person, or event',
    error: 'Something went wrong. Try again.',
    noResults: (q) => `No results for "${q}"`,
    readFullStory: 'Read Full Story',
  },
  empty: {
    errorTitle: 'Could not load news',
    noStoriesTitle: 'No stories found',
    errorDesc: 'Check your connection or add your NewsData.io API key in config.',
    noStoriesDesc: 'Try a different category',
    retry: 'Retry',
  },
  notifications: {
    title: 'Keyword Digest',
    emptyTitle: 'No digests yet',
    emptyDesc: 'Add keywords during setup to track topics and get daily news digests.',
    articles: (n) => `${n} article${n !== 1 ? 's' : ''}`,
    today: 'Today',
    yesterday: 'Yesterday',
  },
  onboarding: {
    categoriesTitle: 'Choose your categories',
    categoriesHint: 'These shape your daily feed',
    andDivider: 'AND',
    keywordsTitle: 'Track up to 2 keywords',
    keywordsHint: "You'll get a daily digest of news matching these — delivered to your notifications",
    keywordPlaceholder: 'Add your own keyword…',
    addKeyword: '+',
    maxKeywords: 'Max 2 keywords',
    permissionNotifTitle: 'Get daily keyword digests',
    permissionNotifDesc: "We'll notify you when new articles match your keywords.",
    permissionStorageTitle: 'Save your preferences',
    permissionStorageDesc: 'Your settings are saved locally on this device.',
    allowBtn: 'Allow',
    maybeLater: 'Maybe later',
    startReading: 'Start reading →',
    selectMore: (n) => `Select ${n} more categor${n !== 1 ? 'ies' : 'y'}`,
    addOneKeyword: 'Add at least 1 keyword',
  },
};

export const hi: Translations = {
  greeting: {
    morning: 'सुबह',
    afternoon: 'दोपहर',
    evening: 'शाम',
    night: 'रात',
    format: (time, name) => name ? `शुभ ${time}, ${name}` : `शुभ ${time}`,
  },
  tabs: {
    home: 'होम',
    bookmarks: 'बुकमार्क',
    settings: 'सेटिंग्स',
  },
  home: {
    swipeUp: 'ऊपर स्वाइप करें',
    readFullStory: 'पूरी खबर पढ़ें',
    trending: 'ट्रेंडिंग',
    all: 'सभी',
  },
  bookmarks: {
    title: 'बुकमार्क',
    saved: (n) => `${n} सहेजे`,
    emptyTitle: 'अभी कोई बुकमार्क नहीं',
    emptyDesc: 'किसी भी लेख पर दिल का निशान दबाएं।',
    readMore: 'और पढ़ें',
    readFullStory: 'पूरी खबर पढ़ें',
  },
  settings: {
    title: 'सेटिंग्स',
    profile: 'प्रोफ़ाइल',
    yourName: 'आपका नाम',
    namePlaceholder: 'आपका नाम',
    notSet: 'सेट नहीं',
    edit: 'बदलें',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    categoriesLabel: 'मेरी श्रेणियां',
    categoriesHint: (min, selected) => `न्यूनतम ${min} जरूरी · ${selected} चुने`,
    keywordsLabel: 'मेरे कीवर्ड',
    keywordsHint: 'दैनिक डाइजेस्ट के लिए 2 कीवर्ड तक',
    noKeywords: 'अभी कोई कीवर्ड नहीं',
    keywordPlaceholder: 'कीवर्ड जोड़ें…',
    maxKeywords: 'अधिकतम 2 कीवर्ड',
    notificationsLabel: 'नोटिफिकेशन',
    digestTimeLabel: 'दैनिक डाइजेस्ट समय',
    digestTimeHint: 'कीवर्ड डाइजेस्ट कब भेजें',
    languageLabel: 'भाषा',
    languageHint: 'भाषा बदलने पर सभी टेक्स्ट और खबरें तुरंत अपडेट होंगी।',
    appearance: 'दिखावट',
    darkMode: 'डार्क मोड',
    about: 'जानकारी',
    appTagline: 'आपकी दैनिक खबर',
    version: 'संस्करण',
    invalidName: 'अमान्य नाम',
    nameError: 'कम से कम 2 अक्षर दर्ज करें।',
  },
  search: {
    placeholder: 'खबरें खोजें…',
    cancel: 'रद्द करें',
    emptyHint: 'कोई विषय, व्यक्ति या घटना खोजें',
    error: 'कुछ गलत हुआ। फिर कोशिश करें।',
    noResults: (q) => `"${q}" के लिए कोई परिणाम नहीं`,
    readFullStory: 'पूरी खबर पढ़ें',
  },
  empty: {
    errorTitle: 'खबरें नहीं मिलीं',
    noStoriesTitle: 'कोई खबर नहीं मिली',
    errorDesc: 'इंटरनेट कनेक्शन जांचें।',
    noStoriesDesc: 'दूसरी श्रेणी आजमाएं',
    retry: 'पुनः प्रयास',
  },
  notifications: {
    title: 'कीवर्ड डाइजेस्ट',
    emptyTitle: 'अभी कोई डाइजेस्ट नहीं',
    emptyDesc: 'कीवर्ड ट्रैक करने के लिए सेटअप में जोड़ें।',
    articles: (n) => `${n} लेख`,
    today: 'आज',
    yesterday: 'कल',
  },
  onboarding: {
    categoriesTitle: 'अपनी श्रेणियां चुनें',
    categoriesHint: 'ये आपकी दैनिक फ़ीड को आकार देती हैं',
    andDivider: 'और',
    keywordsTitle: '2 कीवर्ड तक ट्रैक करें',
    keywordsHint: 'इनसे मेल खाती खबरें आपको नोटिफिकेशन में मिलेंगी',
    keywordPlaceholder: 'अपना कीवर्ड जोड़ें…',
    addKeyword: '+',
    maxKeywords: 'अधिकतम 2 कीवर्ड',
    permissionNotifTitle: 'दैनिक डाइजेस्ट पाएं',
    permissionNotifDesc: 'जब आपके कीवर्ड से मेल खाते लेख आएं, हम आपको सूचित करेंगे।',
    permissionStorageTitle: 'प्राथमिकताएं सहेजें',
    permissionStorageDesc: 'आपकी सेटिंग्स इस डिवाइस पर स्थानीय रूप से सहेजी जाती हैं।',
    allowBtn: 'अनुमति दें',
    maybeLater: 'बाद में',
    startReading: 'पढ़ना शुरू करें →',
    selectMore: (n) => `${n} और श्रेणी चुनें`,
    addOneKeyword: 'कम से कम 1 कीवर्ड जोड़ें',
  },
};

export const translations: Record<string, Translations> = { en, hi };
