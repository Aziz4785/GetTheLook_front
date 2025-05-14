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
        return 'ENSEMBL (Dev)';
    }

    if (IS_PREVIEW) {
        return 'ENSEMBL (Preview)';
    }

    return 'ENSEMBL';
};

  
export default ({ config }) => ({
    ...config,
    "name": getAppName(),
    "slug": "getTheLook_front",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "getthelookfront",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": getUniqueIdentifier(),
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSCameraUsageDescription": "This app needs access to your camera to take photos of clothing.",
        "NSPhotoLibraryUsageDescription": "This app needs access to your photo library to choose images."
      }
    },
    "android": {
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ],
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
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
          "recordAudioAndroid": false
        }
      ],
      "expo-image-picker"
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
  