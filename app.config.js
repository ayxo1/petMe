const IS_DEV = process.env.APP_VARIANT === 'development';

module.exports = {
  "expo": {
    "name": IS_DEV ? "pet-a-pet (Dev)" : 'pet-a-pet',
    "slug": "petMe",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "petme",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Your location will help connect you with nearby pets and pet owners.",
        "NSMotionUsageDescription": "Used to create a tilt effect on profile cards.",
        "ITSAppUsesNonExemptEncryption": false
      },
      "bundleIdentifier": IS_DEV ? "com.ayxo.petMe.dev" : "com.ayxo.petMe"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "permissions": [
        "android.permission.RECORD_AUDIO"
      ]
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/icon.png"
    },
    "plugins": [
      "expo-router",
      "expo-localization",
      "expo-apple-authentication",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/icon.png",
          "color": "#ffffff"
        }
      ],
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you setup a profile for you and your pets."
        }
      ],
      "expo-web-browser",
      [
        "expo-font",
        {
          "fonts": []
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "bd449a89-ce32-4d41-a65e-f0ad8a4230e4"
      }
    },
    "owner": "ayxo",
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/bd449a89-ce32-4d41-a65e-f0ad8a4230e4"
    }
  }
}