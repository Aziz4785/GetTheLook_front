const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

console.log("APP_VARIANT =", process.env.APP_VARIANT); //  Debug log

const getUniqueIdentifier = () => {
    if (IS_DEV) {
      return 'com.azizkanoun.getthelook.dev';
    }
  
    if (IS_PREVIEW) {
      return 'com.azizkanoun.getthelook.preview';
    }
  
    return 'com.azizkanoun.getthelook';
  };
  
const getAppName = () => {
    if (IS_DEV) {
        return 'Get The Look (Dev)';
    }

    if (IS_PREVIEW) {
        return 'Get The Look (Preview)';
    }

    return 'Get The Look';
};

  
export default ({ config }) => ({
    ...config,
    "name": getAppName(),
    "slug": "getTheLook_front",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "getthelookfront",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": getUniqueIdentifier(),
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "40b820c6-0cac-4861-9ce4-3f8d69d0cd4b"
      }
    },
    "owner": "azizkanoun"

  });
  