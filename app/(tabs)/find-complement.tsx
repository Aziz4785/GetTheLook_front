import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Button, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Comments mapping item types to suggested SVG names (from previous context)
// Top: tshirt.svg
// Trousers: pants.svg
// Shorts: shorts.svg
// Skirt: skirt.svg
// Shoes: shoes.svg

// Interface for the image state
interface ClothingImages {
  top: string | null;
  trousers: string | null;
  shorts: string | null;
  skirt: string | null;
  shoes: string | null;
}

type ClothingItem = keyof ClothingImages;

export default function FindComplementScreen() {
  const [selectedItem, setSelectedItem] = useState('top');  //React Hooks must be used in the top level of the component
  const [images, setImages] = useState<ClothingImages>({
    top: null,
    trousers: null,
    shorts: null,
    skirt: null,
    shoes: null,
  });

  // Function to handle picking an image
  const pickImage = async (item: ClothingItem) => {
    // Request permissions
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert('Permissions required', 'Camera and media library permissions are needed to select images.');
      return;
    }

    // Ask user to choose source
    Alert.alert(
      "Select Image Source",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: async () => {
            let result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1], // Keep it square
              quality: 1,
            });

            if (!result.canceled) {
              setImages(prev => ({ ...prev, [item]: result.assets[0].uri }));
            }
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
             let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1], // Keep it square
              quality: 1,
            });

            if (!result.canceled) {
                setImages(prev => ({ ...prev, [item]: result.assets[0].uri }));
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  // Function to handle submission
  const handleSubmit = () => {
    console.log('Selected Images:', images);
    // Add your submission logic here (e.g., send to backend)
    Alert.alert('Submitted', 'Images submitted (check console log).');
  };

  // Determine which items have already been selected (uploaded)
  const clearImage = (item: ClothingItem) => {
    setImages((prev) => ({ ...prev, [item]: null }));
  };

  const uploadedItems = Object.keys(images).filter((key) => images[key as ClothingItem]);

  // For bottom wear, if any of 'trousers', 'shorts', or 'skirt' is uploaded, exclude all three
  const hasBottom = ['trousers', 'shorts', 'skirt'].some((item) => uploadedItems.includes(item));

  const availableOptions = [
    { label: 'Top', value: 'top' as ClothingItem },
    { label: 'Trousers', value: 'trousers' as ClothingItem },
    { label: 'Shorts', value: 'shorts' as ClothingItem },
    { label: 'Skirt', value: 'skirt' as ClothingItem },
    { label: 'Shoes', value: 'shoes' as ClothingItem },
  ].filter(option => {
    if (option.value === 'top' && uploadedItems.includes('top')) return false;
    if (['trousers', 'shorts', 'skirt'].includes(option.value) && hasBottom) return false;
    if (option.value === 'shoes' && uploadedItems.includes('shoes')) return false;
    return true;
  });
  
  // Helper to render each square item
  const renderItemSquare = (item: ClothingItem, label: string, disabled: boolean = false) => (
    <View style={styles.squareContainer}>
      <TouchableOpacity
        style={[styles.square, disabled && styles.disabledSquare]}
        onPress={() => !disabled && pickImage(item)}
        disabled={disabled}
      >
        {images[item] ? (
          <>
            <Image source={{ uri: images[item]! }} style={styles.image} resizeMode="cover" />
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => clearImage(item)}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={[styles.label, disabled && styles.disabledLabel]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}> 
      <ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View> 
          <Text style={styles.title}>Select the Items you have :</Text>

          <View style={styles.grid}>
            {renderItemSquare('top', 'Top')}
            {renderItemSquare('trousers', 'Trousers', !!images['skirt'] || !!images['shorts'])}
            {renderItemSquare('shorts', 'Shorts', !!images['skirt'] || !!images['trousers'])}
            {renderItemSquare('skirt', 'Skirt', !!images['trousers'] || !!images['shorts'])}
            {renderItemSquare('shoes', 'Shoes')}
            <View style={styles.squareInvisible} />
          </View>

          <Text style={styles.title}>Select the item you are looking for :</Text>

          <View style={styles.selectionContainer}>
          <Picker
            selectedValue={selectedItem}
            onValueChange={(itemValue) => setSelectedItem(itemValue)}
          >
            {availableOptions.map(option => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
          </View>

          <View style={styles.buttonContainer}>
            <Button title="Submit" onPress={handleSubmit} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginBottom: 40,
  },
  square: {
    width: 100,
    height: 100,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
   squareInvisible: {
    width: 100,
    height: 100,
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    alignItems: 'flex-end',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  selectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  squareContainer: {
    position: 'relative',
  },
  
  clearButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledSquare: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  
  disabledLabel: {
    color: '#999',
  },
});