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
    "version": "1.0.3",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "getthelookfront",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": getUniqueIdentifier(),
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSCameraUsageDescription": "ENSEMBL needs camera access to help you create outfits. When you take photos of your clothes, we use them to analyze your style and suggest matching items that would complement your existing pieces. For example, if you take a photo of your blue shirt, we'll suggest pants and shoes that would look great with it.",
        "NSPhotoLibraryUsageDescription": "ENSEMBL needs photo library access to help you build complete outfits. When you select photos of your clothes from your library, we use them to understand your style and suggest matching items. For example, if you select a photo of your favorite jeans, we'll suggest tops and shoes that would pair well with them."
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
          "cameraPermission": "$(PRODUCT_NAME) uses the camera to let you take photos of your clothes so we can suggest matching outfit pieces.",
          "microphonePermission": "$(PRODUCT_NAME) uses the microphone only if you record audio, which is not required for most features.",
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
  