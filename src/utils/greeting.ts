import { Translations } from '../i18n/translations';

export const getGreeting = (t: Translations, name: string): string => {
  const hour = new Date().getHours();

  let time: string;
  if (hour >= 5 && hour < 12) time = t.greeting.morning;
  else if (hour >= 12 && hour < 17) time = t.greeting.afternoon;
  else if (hour >= 17 && hour < 21) time = t.greeting.evening;
  else time = t.greeting.night;

  return t.greeting.format(time, name.trim() || undefined);
};
