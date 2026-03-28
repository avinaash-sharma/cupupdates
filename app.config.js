// Dynamic Expo config — extends app.json with runtime env vars.
// PostHog token/host are injected here so they're accessible via
// expo-constants (Constants.expoConfig.extra) at runtime.
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    posthogProjectToken: process.env.EXPO_PUBLIC_POSTHOG_KEY,
    posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST,
  },
});
