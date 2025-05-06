import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Comments mapping item types to suggested SVG names (from previous context)
// Top: tshirt.svg
// Trousers: pants.svg
// Shorts: shorts.svg
// Skirt: skirt.svg
// Shoes: shoes.svg
import PantsIcon from '../../assets/icons/pants.svg';
import ShoesIcon from '../../assets/icons/shoes.svg';
import ShortsIcon from '../../assets/icons/shorts.svg';
import SkirtIcon from '../../assets/icons/skirt.svg';
import TshirtIcon from '../../assets/icons/tshirt.svg';
// Interface for the image state
interface ClothingImages {
  top: string | null;
  trousers: string | null;
  shorts: string | null;
  skirt: string | null;
  shoes: string | null;
}
const itemIcons: Record<ClothingItem, React.ComponentType<any>> = {
  top: TshirtIcon,
  trousers: PantsIcon,
  shorts: ShortsIcon,
  skirt: SkirtIcon,
  shoes: ShoesIcon,
};
type ClothingItem = keyof ClothingImages;

export default function FindComplementScreen() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState('top');  //React Hooks must be used in the top level of the component
  const [loading, setLoading] = useState(false);
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
  
    // Show instruction first
    Alert.alert(
      "Photo Guidelines",
      "To get the best results:\n\n• Use natural or neutral lighting (well-lit room)\n• Choose a plain, neutral background\n• Make sure the garment is clearly visible with no objects on top",
      [
        {
          text: "OK",
          onPress: () => {
            // After user acknowledges, prompt to choose source
            Alert.alert(
              "Select Image Source",
              "Choose an option",
              [
                {
                  text: "Camera",
                  onPress: async () => {
                    let result = await ImagePicker.launchCameraAsync({
                      allowsEditing: true,
                      aspect: [1, 1],
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
                      aspect: [1, 1],
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
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Function to handle submission
  // const handleSubmit = () => {
  //   // Create the request object
  //   const request: Record<string, string> = {};
    
  //   //print selectedItem
  //   console.log('Selected Target Item:', selectedItem);
    
  //   // Add all uploaded images except the selected item
  //   Object.entries(images).forEach(([key, value]) => {
  //     console.log(`Checking image: key=${key}, value=${value ? '[exists]' : 'null/undefined'}`);
  //     if (value && key !== selectedItem) {
  //       console.log(`--> Added to request: key=${key}`);
  //       request[key] = value;
  //     }
  //     else{
  //       console.log(`--> Skipped: key=${key}`);
  //     }
  //   });
  //   console.log('=== SUBMISSION DEBUG ===');
  //   console.log('Selected Target Item:', selectedItem);
  //   console.log('Filtered Input Images:', request);
  //   console.log('Raw Images Object:', images);
  //   console.log('========================');
  //   // Log the request for debugging
  //   console.log('Request:', {
  //     target: selectedItem,
  //     inputs: request
  //   });

  //   // Add your submission logic here (e.g., send to backend)
  //   Alert.alert('Submitted', 'Images submitted successfully.');
  // };
  const handleSubmit = async () => {
    // Check if at least one image is uploaded
    const hasAnyImage = Object.values(images).some(value => value !== null);
    if (!hasAnyImage) {
      Alert.alert('Almost there!', 'Please upload at least one image before submitting.');
      return;
    }

    const formData = new FormData();
  
    // Add each image except the selected one
    Object.entries(images).forEach(([key, value]) => {
      if (value && key !== selectedItem) {
        formData.append(key, {
          uri: value, // use value directly, not value.uri
          name: `${key}.png`,
          type: 'image/png',
        } as any); // 'as any' to satisfy TypeScript for React Native FormData
      }
    });
    //Add selectedItem to the formData
    formData.append('target', selectedItem);
    console.log('Form Data:', formData);
    
    setLoading(true);
    
    try {
      console.log('Sending request...');
      const response = await fetch('http://192.168.1.10:8000/recommend', {
      //const response = await fetch('https://getthelook-server.onrender.com/recommend', {
        method: 'POST',
        body: formData, // Only this
      });
      console.log('Request sent, awaiting response...');
      const data = await response.json();
      console.log('Server response:', data);
  
      if (data.recommendations && data.recommendations.length > 0) {
        // Navigate to recommendations page with the data
        router.push({
          pathname: '/recommendations',
          params: { recommendations: JSON.stringify(data.recommendations) }
        });
      } else {
        Alert.alert('No Recommendations', 'No matching items were found.');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      Alert.alert('Error', 'Failed to send request to the server.');
    } finally {
      setLoading(false);
    }
  };
  // Determine which items have already been selected (uploaded)
  const clearImage = (item: ClothingItem) => {
    setImages((prev) => ({ ...prev, [item]: null }));
  };

  const uploadedItems = Object.keys(images).filter((key) => images[key as ClothingItem]);

  // For bottom wear, if any of 'trousers', 'shorts', or 'skirt' is uploaded, exclude all three
  const hasBottom = ['trousers', 'shorts', 'skirt'].some((item) => uploadedItems.includes(item));

  const isBottomCategory = (item: ClothingItem) =>
    ['trousers', 'shorts', 'skirt'].includes(item);
  
  // Check which categories have been selected
  const categorySelected = {
    top: !!images['top'],
    bottom: (['trousers', 'shorts', 'skirt'] as ClothingItem[]).some((item) => !!images[item]),
    shoes: !!images['shoes'],
  };
  // Count how many distinct categories have been selected
  const selectedCategoryCount = Object.values(categorySelected).filter(Boolean).length;

  const availableOptions = [
    { label: 'Top', value: 'top' as ClothingItem },
    { label: 'Trousers', value: 'trousers' as ClothingItem },
    { label: 'Shorts', value: 'shorts' as ClothingItem },
    { label: 'Skirt', value: 'skirt' as ClothingItem },
    { label: 'Shoes', value: 'shoes' as ClothingItem },
  ].filter(option => {
    const val = option.value;
    if (val === 'top') return !categorySelected.top;
    if (val === 'shoes') return !categorySelected.shoes;
    if (isBottomCategory(val)) return !categorySelected.bottom;
    return true;
  });
  
  useEffect(() => {
    if (!availableOptions.find(option => option.value === selectedItem)) {
      // Set selectedItem to the first available option if the current one is not valid
      if (availableOptions.length > 0) {
        setSelectedItem(availableOptions[0].value);
      }
    }
  }, [availableOptions, selectedItem]);

  // Helper to render each square item
  const renderItemSquare = (item: ClothingItem, label: string, disabled: boolean = false) => {
    const IconComponent = itemIcons[item];
    return (
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
            IconComponent && <IconComponent width={48} height={48} fill={disabled ? "#999" : "#555"} />
          )}
        </TouchableOpacity>
        <Text style={[styles.label, disabled && styles.disabledLabel, { textAlign: 'center', marginTop: 6 }]}>
          {label}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}> 
      <ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View> 
          <Text style={styles.title}>Select the Items you have :</Text>

          <View style={styles.grid}>
            {renderItemSquare('top', 'Top', selectedCategoryCount >= 2 && !categorySelected.top)}
            {renderItemSquare('trousers', 'Trousers', categorySelected.bottom || (selectedCategoryCount >= 2 && !categorySelected.bottom))}
            {renderItemSquare('shorts', 'Shorts', categorySelected.bottom || (selectedCategoryCount >= 2 && !categorySelected.bottom))}
            {renderItemSquare('skirt', 'Skirt', categorySelected.bottom || (selectedCategoryCount >= 2 && !categorySelected.bottom))}
            {renderItemSquare('shoes', 'Shoes', selectedCategoryCount >= 2 && !categorySelected.shoes)}
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
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Finding recommendations...</Text>
        </View>
      )}
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
    marginBottom: 5,
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
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});