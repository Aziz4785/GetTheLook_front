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

  // Helper to render each square item
  const renderItemSquare = (item: ClothingItem, label: string) => (
    <TouchableOpacity style={styles.square} onPress={() => pickImage(item)}>
      {images[item] ? (
        <Image source={{ uri: images[item]! }} style={styles.image} />
      ) : (
        // Replace this Text with your SVG component later
        <Text style={styles.label}>{label}</Text>
        // Example: <YourSvgIconComponent width={50} height={50} />
      )}
    </TouchableOpacity>
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
            {renderItemSquare('trousers', 'Trousers')}
            {renderItemSquare('shorts', 'Shorts')}
            {renderItemSquare('skirt', 'Skirt')}
            {renderItemSquare('shoes', 'Shoes')}
            <View style={styles.squareInvisible} />
          </View>

          <Text style={styles.subTitle}>Select the item you are looking for :</Text>

          <View style={styles.selectionContainer}>
            <Picker
              selectedValue={selectedItem}
              onValueChange={(itemValue) => setSelectedItem(itemValue)}
            >
              <Picker.Item label="Top" value="top" />
              <Picker.Item label="Trousers" value="trousers" />
              <Picker.Item label="Shorts" value="shorts" />
              <Picker.Item label="Skirt" value="skirt" />
              <Picker.Item label="Shoes" value="shoes" />
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
});