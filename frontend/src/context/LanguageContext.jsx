import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    mapAndHeatmap: 'Map & Heatmap',
    buy: 'Buy',
    rent: 'Rent',
    commercial: 'Commercial',
    residential: 'Residential',
    aboutUs: 'About Us',
    contact: 'Contact',
    dashboard: 'Dashboard',
    login: 'Login',
    register: 'Register',
    addProperty: 'List Your Property',

    // Search & Hero
    heroTitle: 'Find Your Perfect Property Through Verified Brokers',
    heroSubtitle: 'Direct owner contact is protected. Our certified in-house brokers inspect properties, coordinate visits, and guide your deal safely.',
    whatAreYouLookingFor: 'What are you looking for?',
    wantToRentOrBuy: 'Do you want to Rent or Buy?',
    whereDoYouWantIt: 'Where do you want it? (City / Locality)',
    whatIsYourBudget: 'What is your budget?',
    searchPropertiesBtn: 'Search Properties',
    useCurrentLocation: 'Use My Current Location',
    selectFromMap: 'Select on Map',
    voiceSearchTooltip: 'Speak to search in Hindi or English',
    listening: 'Listening... Speak now (e.g., "Crossing Republik 3 BHK")',

    // Categories
    flatApartment: 'Flat / Apartment',
    room: 'Room',
    pgHostel: 'PG / Co-Living',
    independentHouse: 'House / Villa',
    commercialOffice: 'Commercial / Office',
    plotLand: 'Plot / Land',

    // Property Card & Details
    verifiedListing: 'Verified by Broker',
    perMonth: '/month',
    totalPrice: 'Total Price',
    enquireNow: 'Enquire via Broker',
    scheduleVisit: 'Schedule Accompanied Visit',
    compare: 'Compare',
    removeCompare: 'Remove',
    amenities: 'Amenities',
    furnishing: 'Furnishing',
    parking: 'Parking',
    carpetArea: 'Carpet Area',
    superArea: 'Super Area',

    // Owner Wizard
    ownerWizardTitle: 'List Your Property on Redstone',
    ownerWizardSubtitle: 'Our in-house broker will physically inspect, photograph, and verify your property before publishing.',
    step1Purpose: 'Purpose (Sell / Rent / PG)',
    step2Category: 'Property Category',
    step3Type: 'Property Type',
    step4Specs: 'Specifications & Dimensions',
    step5Price: 'Pricing & Maintenance',
    step6Address: 'Address & Society',
    step7MapPin: 'Map Pin Location',
    step8Media: 'Photos & Videos',
    step9Review: 'Review & Submit for Verification',

    // Heatmap & Density
    availabilityHeatmap: 'Supply Density (Layer A)',
    demandHeatmap: 'Buyer Demand (Layer B)',
    marketGaps: 'Locality Supply/Demand Gaps',
    densityClusters: 'Active Listings Density',
    activeLeads: 'Buyer Demand Leads',

    // Privacy Notice
    privacyShieldNotice: 'Owner Privacy Guarantee: Personal phone numbers & emails are never disclosed publicly. All site visits are escorted by certified brokers.',
  },

  hi: {
    // Navigation
    home: 'होम',
    mapAndHeatmap: 'मैप और हीटमैप',
    buy: 'खरीदें (Buy)',
    rent: 'किराया (Rent)',
    commercial: 'कमर्शियल',
    residential: 'रेजिडेंशियल',
    aboutUs: 'हमारे बारे में',
    contact: 'संपर्क करें',
    dashboard: 'डैशबोर्ड',
    login: 'लॉग इन',
    register: 'रजिस्टर करें',
    addProperty: 'अपनी प्रॉपर्टी ऐड करें',

    // Search & Hero
    heroTitle: 'सत्यापित ब्रोकर्स के साथ अपनी मनपसंद प्रॉपर्टी खोजें',
    heroSubtitle: 'मालिक का नंबर सुरक्षित रहता है। हमारे सर्टिफाइड ब्रोकर्स खुद प्रॉपर्टी देखकर आपको विजिट करवाते हैं।',
    whatAreYouLookingFor: 'आपको क्या चाहिए?',
    wantToRentOrBuy: 'किराये पर चाहिए या खरीदना है?',
    whereDoYouWantIt: 'कहाँ पर चाहिए? (शहर / इलाका)',
    whatIsYourBudget: 'आपका बजट कितना है?',
    searchPropertiesBtn: 'प्रॉपर्टी खोजें',
    useCurrentLocation: 'मेरी करंट लोकेशन इस्तेमाल करें',
    selectFromMap: 'मैप पर चुनें',
    voiceSearchTooltip: 'बोलकर सर्च करें (हिंदी या इंग्लिश में)',
    listening: 'सुन रहे हैं... बोलिए (जैसे: "Crossing Republik 3 BHK")',

    // Categories
    flatApartment: 'फ्लैट / अपार्टमेंट',
    room: 'कमरा (Room)',
    pgHostel: 'पीजी / हॉस्टल',
    independentHouse: 'मकान / विला',
    commercialOffice: 'दुकान / ऑफिस',
    plotLand: 'प्लॉट / जमीन',

    // Property Card & Details
    verifiedListing: 'ब्रोकर द्वारा सत्यापित',
    perMonth: '/महीना',
    totalPrice: 'कुल कीमत',
    enquireNow: 'ब्रोकर से बात करें',
    scheduleVisit: 'विजिट बुक करें',
    compare: 'तुलना करें',
    removeCompare: 'हटाएं',
    amenities: 'सुविधाएं (Amenities)',
    furnishing: 'फर्निशिंग',
    parking: 'पार्किंग',
    carpetArea: 'कारपेट एरिया',
    superArea: 'सुपर एरिया',

    // Owner Wizard
    ownerWizardTitle: 'अपनी प्रॉपर्टी रेडस्टोन पर ऐड करें',
    ownerWizardSubtitle: 'हमारा इन-हाउस ब्रोकर खुद आकर प्रॉपर्टी का निरीक्षण और फोटो लेगा, फिर लाइव करेगा।',
    step1Purpose: 'मकसद (बेचना / किराया / पीजी)',
    step2Category: 'प्रॉपर्टी की श्रेणी',
    step3Type: 'प्रॉपर्टी का प्रकार',
    step4Specs: 'कमरे और साइज की जानकारी',
    step5Price: 'किराया / कीमत और मेंटेनेंस',
    step6Address: 'पूरा पता और सोसाइटी',
    step7MapPin: 'मैप पर सही लोकेशन पिन करें',
    step8Media: 'फोटो और वीडियो',
    step9Review: 'जांचें और वेरिफिकेशन के लिए भेजें',

    // Heatmap & Density
    availabilityHeatmap: 'उपलब्ध प्रॉपर्टीज (Layer A)',
    demandHeatmap: 'खरीदार डिमांड (Layer B)',
    marketGaps: 'इलाके का सप्लाई-डिमांड अनुपात',
    densityClusters: 'प्रॉपर्टी घनत्व',
    activeLeads: 'सक्रिय ग्राहक डिमांड',

    // Privacy Notice
    privacyShieldNotice: 'मालिक की गोपनीयता की गारंटी: फोन नंबर या ईमेल कभी पब्लिक में नहीं दिखेगा। हर विजिट हमारे ब्रोकर के साथ होती है।',
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('redstone_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('redstone_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
