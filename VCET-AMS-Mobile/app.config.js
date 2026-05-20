const API_URL = process.env.API_URL || 'http://10.0.2.2:3000';
const IS_HTTPS = API_URL.startsWith('https://');

module.exports = {
  expo: {
    name: 'VCET AMS',
    slug: 'vcet-ams-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    android: {
      package: 'com.vcet.ams',
      adaptiveIcon: {
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundColor: '#0f172a',
      },
      softwareKeyboardLayoutMode: 'pan',
    },
    ios: {
      bundleIdentifier: 'com.vcet.ams',
      supportsTablet: true,
      infoPlist: IS_HTTPS
        ? {}
        : {
            NSAppTransportSecurity: {
              NSAllowsArbitraryLoads: true,
            },
          },
    },
    web: {
      bundler: 'metro',
    },
    plugins: [
      'expo-secure-store',
      [
        'expo-build-properties',
        {
          android: {
            usesCleartextTraffic: !IS_HTTPS,
          },
        },
      ],
    ],
    updates: {
      enabled: false,
    },
    extra: {
      supportsTablet: false,
      apiUrl: API_URL,
    },
  },
};
