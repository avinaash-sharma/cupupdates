import Constants from 'expo-constants';
import PostHog from 'posthog-react-native';

const token: string = Constants.expoConfig?.extra?.posthogProjectToken ?? '';
const host: string = Constants.expoConfig?.extra?.posthogHost ?? 'https://us.i.posthog.com';

export const posthog = new PostHog(token || 'unknown', { host, disabled: !token });
