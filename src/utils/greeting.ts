export const getGreeting = (name: string): string => {
  const hour = new Date().getHours();

  let timeOfDay: string;
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'Morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'Afternoon';
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'Evening';
  } else {
    timeOfDay = 'Night';
  }

  const base = `Good ${timeOfDay}`;
  return name.trim() ? `${base}, ${name.trim()}` : base;
};
