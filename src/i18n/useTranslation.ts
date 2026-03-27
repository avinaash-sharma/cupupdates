import { useLanguage } from '../context/LanguageContext';
import { translations, Translations } from './translations';

export const useTranslation = (): Translations => {
  const { language } = useLanguage();
  return translations[language] ?? translations.en;
};
