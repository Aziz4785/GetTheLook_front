import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

// Import translation files
import en from '../locales/en.json';
import fr from '../locales/fr.json';

// Create the i18n instance
const i18n = new I18n();

// Set the key-value pairs for the different languages
i18n.translations = {
  en,
  fr,
};

// Set the locale once at the beginning of your app
const deviceLocales = getLocales();
//console.log('🌍 Device locales detected:', deviceLocales);

if (deviceLocales.length > 0) {
  const deviceLanguageCode = deviceLocales[0].languageCode;
  const deviceLanguageTag = deviceLocales[0].languageTag;
  
  //console.log('📱 Device language code:', deviceLanguageCode);
  //console.log('📱 Device language tag:', deviceLanguageTag);
  
  // Check if French is supported - look for 'fr' in language code or language tag
  // const isFrench = deviceLanguageCode === 'fr' || 
  //                  deviceLanguageTag?.startsWith('fr') ||
  //                  deviceLocales.some(locale => 
  //                    locale.languageCode === 'fr' || 
  //                    locale.languageTag?.startsWith('fr')
  //                  );
  const isFrench = deviceLanguageCode === 'fr' || 
                   deviceLanguageTag?.startsWith('fr');

  i18n.locale = isFrench ? 'fr' : 'en';
  //console.log('🔤 Selected app locale:', i18n.locale);
} else {
  i18n.locale = 'en';
  //console.log('⚠️ No device locales found, defaulting to English');
}

// When a value is missing from a language it'll fall back to another language with the key present
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n; 