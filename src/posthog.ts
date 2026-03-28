import Constants from 'expo-constants';
import PostHog from 'posthog-react-native';

const token: string = Constants.expoConfig?.extra?.posthogProjectToken ?? '';
const host: string = Constants.expoConfig?.extra?.posthogHost ?? '';

export const posthog = new PostHog(token, { host });
