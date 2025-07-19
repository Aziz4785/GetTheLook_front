import * as ImageManipulator from 'expo-image-manipulator';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTranslation } from '../hooks/useTranslation';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CROP_SIZE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.7;

interface ImageCropModalProps {
  visible: boolean;
  imageUri: string;
  onCrop: (croppedUri: string) => void;
  onCancel: () => void;
}

export default function ImageCropModal({ visible, imageUri, onCrop, onCancel }: ImageCropModalProps) {
  const { t } = useTranslation();
  const [cropRect, setCropRect] = useState({
    x: (SCREEN_WIDTH - CROP_SIZE) / 2,
    y: (SCREEN_HEIGHT - CROP_SIZE) / 2.5, // A reasonable starting point
    width: CROP_SIZE,
    height: CROP_SIZE,
  });
  const [cropping, setCropping] = useState(false);

  // Store initial gesture state to avoid bugs from stale closures
  const gestureState = useRef({
    initialRect: { ...cropRect },
    lastDx: 0,
    lastDy: 0,
  }).current;

  // PanResponder for moving the entire crop rectangle
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        gestureState.initialRect = { ...cropRect };
      },
      onPanResponderMove: (_, gesture) => {
        const { initialRect } = gestureState;
        const newX = initialRect.x + gesture.dx;
        const newY = initialRect.y + gesture.dy;

         // Log gesture and calculations
        // console.log('Gesture dx:', gesture.dx, 'dy:', gesture.dy);
        // console.log('Initial rect:', initialRect);
        // console.log('NewX:', newX, 'NewY:', newY);

        // // Clamp position to stay within screen bounds
        // const clampedX = Math.max(0, Math.min(newX, SCREEN_WIDTH - cropRect.width));
        // const clampedY = Math.max(0, Math.min(newY, SCREEN_HEIGHT - cropRect.height));

        // setCropRect(rect => ({ ...rect, x: clampedX, y: clampedY }));
        // FIX: Use `initialRect` for boundary checks to ensure we have the correct,
        // up-to-date dimensions for the current gesture.
        const clampedX = Math.max(0, Math.min(newX, SCREEN_WIDTH));
        const clampedY = Math.max(0, Math.min(newY, SCREEN_HEIGHT));

         // Log clamped values
        // console.log('ClampedX:', clampedX, 'ClampedY:', clampedY);
  
        setCropRect(rect => ({ ...rect, x: clampedX, y: clampedY }));

      },
    })
  ).current;

  // PanResponder for resizing from the bottom-right corner
  const resizeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Reset deltas on new gesture
        gestureState.lastDx = 0;
        gestureState.lastDy = 0;
      },
      onPanResponderMove: (_, gesture) => {
        // Calculate change from the last event
        const dx_change = gesture.dx - gestureState.lastDx;
        const dy_change = gesture.dy - gestureState.lastDy;

        // Store current dx/dy for the next event
        gestureState.lastDx = gesture.dx;
        gestureState.lastDy = gesture.dy;

        setCropRect(currentRect => {
            const newWidth = currentRect.width + dx_change;
            const newHeight = currentRect.height + dy_change;

            // Clamp size to stay within screen bounds and have a minimum size.
            const clampedWidth = Math.max(50, Math.min(newWidth, SCREEN_WIDTH - currentRect.x));
            const clampedHeight = Math.max(50, Math.min(newHeight, SCREEN_HEIGHT - currentRect.y));
            
            return { ...currentRect, width: clampedWidth, height: clampedHeight };
        });
      },
    })
  ).current;

  // [FIXED] PanResponder for resizing from the top-left corner
  const resizeResponderTopLeft = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Reset deltas on new gesture
        gestureState.lastDx = 0;
        gestureState.lastDy = 0;
      },
      onPanResponderMove: (_, gesture) => {
        // Calculate change from the last event
        const dx_change = gesture.dx - gestureState.lastDx;
        const dy_change = gesture.dy - gestureState.lastDy;

        // Store current dx/dy for the next event
        gestureState.lastDx = gesture.dx;
        gestureState.lastDy = gesture.dy;

        setCropRect(currentRect => {
            const newX = currentRect.x + dx_change;
            const newY = currentRect.y + dy_change;
            const newWidth = currentRect.width - dx_change;
            const newHeight = currentRect.height - dy_change;

            // Basic clamping to prevent negative size or position
            if (newWidth < 50 || newHeight < 50 || newX < 0 || newY < 0) {
              return currentRect; // Don't apply invalid change
            }

            return {
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight,
            };
        });
      },
    })
  ).current;

  // [FIXED] The cropping logic now correctly handles different image aspect ratios
  const handleCrop = async () => {
    if (cropping) return;
    setCropping(true);

    try {
      // 1. Get the original image's dimensions
      const { width: imgWidth, height: imgHeight } = await new Promise<{width: number, height: number}>((resolve, reject) => {
        Image.getSize(imageUri, (width, height) => resolve({width, height}), reject);
      });

      // 2. Calculate the dimensions and position of the image as displayed on the screen
      const screenAspectRatio = SCREEN_WIDTH / SCREEN_HEIGHT;
      const imageAspectRatio = imgWidth / imgHeight;
      
      let displayedWidth = SCREEN_WIDTH;
      let displayedHeight = SCREEN_HEIGHT;
      
      if (imageAspectRatio > screenAspectRatio) {
        // Image is wider than the screen (letterboxed)
        displayedHeight = SCREEN_WIDTH / imageAspectRatio;
      } else {
        // Image is taller than the screen (pillarboxed)
        displayedWidth = SCREEN_HEIGHT * imageAspectRatio;
      }

      const offsetX = (SCREEN_WIDTH - displayedWidth) / 2;
      const offsetY = (SCREEN_HEIGHT - displayedHeight) / 2;
      
      // 3. Calculate the scale factor between the displayed image and the original image
      const scale = imgWidth / displayedWidth;

      // 4. Translate the on-screen crop rectangle coordinates to the original image's coordinates
      const cropData = {
        originX: Math.round((cropRect.x - offsetX) * scale),
        originY: Math.round((cropRect.y - offsetY) * scale),
        width: Math.round(cropRect.width * scale),
        height: Math.round(cropRect.height * scale),
      };

      // Ensure the crop area is within the image bounds before cropping
      if (cropData.originX < 0 || cropData.originY < 0 || cropData.originX + cropData.width > imgWidth || cropData.originY + cropData.height > imgHeight) {
          console.warn("Crop area is out of image bounds. Clamping values.");
          cropData.originX = Math.max(0, cropData.originX);
          cropData.originY = Math.max(0, cropData.originY);
          cropData.width = Math.min(imgWidth - cropData.originX, cropData.width);
          cropData.height = Math.min(imgHeight - cropData.originY, cropData.height);
      }

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ crop: cropData }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );
      onCrop(result.uri);

    } catch (e) {
      console.error(e);
      alert('Cropping failed. Please try again.');
    } finally {
      setCropping(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.fullScreenOverlay}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
        />
        {/* Dark overlay to highlight the crop area */}
        <View style={StyleSheet.absoluteFill} >
            <View style={[styles.overlayPart, {left: 0, top: 0, width: cropRect.x, height: SCREEN_HEIGHT }]} />
            <View style={[styles.overlayPart, {left: cropRect.x, top: 0, width: cropRect.width, height: cropRect.y }]} />
            <View style={[styles.overlayPart, {left: cropRect.x + cropRect.width, top: 0, right: 0, height: SCREEN_HEIGHT }]} />
            <View style={[styles.overlayPart, {left: cropRect.x, top: cropRect.y + cropRect.height, width: cropRect.width, bottom: 0 }]} />
        </View>

        {/* Crop rectangle and handles */}
        <View
          style={[
            styles.cropRect,
            {
              left: cropRect.x,
              top: cropRect.y,
              width: cropRect.width,
              height: cropRect.height,
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View
            style={[styles.resizeHandle, styles.topLeft]}
            {...resizeResponderTopLeft.panHandlers}
          />
          <View
            style={[styles.resizeHandle, styles.bottomRight]}
            {...resizeResponder.panHandlers}
          />
        </View>
        
        <Text style={styles.title}>{t('imageCropModal.adjustFrame')}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={onCancel} disabled={cropping}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cropButton]} onPress={handleCrop} disabled={cropping}>
            {cropping ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Crop</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


// --- Styles (Slightly reorganized for clarity) ---
const styles = StyleSheet.create({
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: '#000', // Solid black is often better for focus
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    position: 'absolute',
    top: 100,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 30,
    zIndex: 1, // To ensure it's on top of the overlay
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    resizeMode: 'contain', // Crucial for our calculations
  },
  overlayPart: {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  cropRect: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    // backgroundColor: 'rgba(255,255,255,0.1)', // Overlay parts handle this now
  },
  resizeHandle: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
  },
  topLeft: {
    left: -15,
    top: -15,
  },
  bottomRight: {
    right: -15,
    bottom: -15,
  },
  buttonRow: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  cropButton: {
    backgroundColor: 'rgb(100, 13, 20)'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});