import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ImageCropModal from '../../components/ImageCropModal';
import { log } from '../../utils/logger';
// Comments mapping item types to suggested SVG names (from previous context)
// Top: tshirt.svg
// Trousers: pants.svg
// Shorts: shorts.svg
// Skirt: skirt.svg
// Shoes: shoes.svg
import MenIcon from '../../assets/icons/men.svg';
import PantsIcon from '../../assets/icons/pants.svg';
import ShoesIcon from '../../assets/icons/shoes.svg';
import ShortsIcon from '../../assets/icons/shorts.svg';
import SkirtIcon from '../../assets/icons/skirt.svg';
import TshirtIcon from '../../assets/icons/tshirt.svg';
import WomenIcon from '../../assets/icons/women.svg';
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
  const [gender, setGender] = useState<string | null>(null);
  const [images, setImages] = useState<ClothingImages>({
    top: null,
    trousers: null,
    shorts: null,
    skirt: null,
    shoes: null,
  });
  const [croppingModalVisible, setCroppingModalVisible] = useState(false);
  const [croppingItem, setCroppingItem] = useState<ClothingItem | null>(null);
  const [croppingImageUri, setCroppingImageUri] = useState<string | null>(null);

  
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
      "For best results:",
      "• Take your photo in a well-lit area (natural light is great!)\n• Use a plain, light or white background\n• Make sure the garment is fully visible with nothing covering it",
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
                      allowsEditing: false, // We'll crop manually
                      quality: 1,
                    });
                    if (!result.canceled) {
                      setCroppingItem(item);
                      setCroppingImageUri(result.assets[0].uri);
                      setCroppingModalVisible(true);
                    }
                  },
                },
                {
                  text: "Gallery",
                  onPress: async () => {
                    let result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: false, // We'll crop manually
                      quality: 1,
                    });
                    if (!result.canceled) {
                      setCroppingItem(item);
                      setCroppingImageUri(result.assets[0].uri);
                      setCroppingModalVisible(true);
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

  const handleSubmit = async () => {
    // Check if at least one image is uploaded
    const hasAnyImage = Object.values(images).some(value => value !== null);
    if (!hasAnyImage) {
      Alert.alert('Almost there!', 'Please upload at least one image before submitting.');
      return;
    }
    if (!gender) {
      Alert.alert('Gender Required', 'Please select a gender before submitting.');
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
    formData.append('gender', gender);
    //log('Form Data:', formData);
    
    setLoading(true);
    
    try {
      log('Sending request...');
      //const response = await fetch('http://192.168.1.10:8000/recommend', {
      const response = await fetch('https://getthelook-server.onrender.com/recommend', {
        method: 'POST',
        body: formData, // Only this
      });
      log('Request sent, awaiting response...');
      const data = await response.json();
      //log('Server response:', data);
  
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

  const renderGenderSquare = (label: string, value: string) => {
    // Choose the correct icon
    const IconComponent = value === 'men' ? MenIcon : WomenIcon;
    const isSelected = gender === value;
    
    return (
      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[
            styles.genderSquare,
            isSelected && styles.genderSquareSelected
          ]}
          onPress={() => setGender(value)}
        >
          {IconComponent && (
            <IconComponent 
              width={40} 
              height={40} 
              fill={isSelected ? '#fff' : 'rgb(100, 13, 20)'} 
            />
          )}
        </TouchableOpacity>
        <Text style={[
          styles.genderLabel,
          isSelected && styles.genderLabelSelected
        ]}>
          {label}
        </Text>
      </View>
    );
  };

  // Helper to render each square item
  const renderItemSquare = (item: ClothingItem, label: string, disabled: boolean = false) => {
    const IconComponent = itemIcons[item];
    const hasImage = !!images[item];
    
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={[
            styles.itemSquare,
            disabled && styles.itemSquareDisabled,
            hasImage && styles.itemSquareWithImage
          ]}
          onPress={() => !disabled && pickImage(item)}
          disabled={disabled}
        >
          {hasImage ? (
            <>
              <Image source={{ uri: images[item]! }} style={styles.itemImage} resizeMode="cover" />
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => clearImage(item)}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.iconContainer}>
              {IconComponent && (
                <IconComponent 
                  width={36} 
                  height={36} 
                  fill={disabled ? "#bbb" : "rgb(100, 13, 20)"} 
                />
              )}
              <View style={styles.addIconOverlay}>
                <Text style={[styles.addIcon, disabled && styles.addIconDisabled]}>+</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
        <Text style={[
          styles.itemLabel, 
          disabled && styles.itemLabelDisabled,
          hasImage && styles.itemLabelSelected
        ]}>
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}> 
          <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>Find Your Perfect Match</Text>
            <Text style={styles.subtitle}>Upload your items and discover complementary pieces</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Which items do you have?</Text>
            <View style={styles.grid}>
              {renderItemSquare('top', 'Top', selectedCategoryCount >= 2 && !categorySelected.top)}
              {renderItemSquare('trousers', 'Trousers', categorySelected.bottom || (selectedCategoryCount >= 2 && !categorySelected.bottom))}
              {renderItemSquare('shorts', 'Shorts', categorySelected.bottom || (selectedCategoryCount >= 2 && !categorySelected.bottom))}
              {renderItemSquare('skirt', 'Skirt', categorySelected.bottom || (selectedCategoryCount >= 2 && !categorySelected.bottom))}
              {renderItemSquare('shoes', 'Shoes', selectedCategoryCount >= 2 && !categorySelected.shoes)}
              <View style={styles.squareInvisible} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What are you looking for?</Text>
            <View style={styles.targetItemsContainer}>
              {availableOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.targetItemButton,
                    selectedItem === option.value && styles.targetItemButtonSelected
                  ]}
                  onPress={() => setSelectedItem(option.value)}
                >
                  <Text style={[
                    styles.targetItemText,
                    selectedItem === option.value && styles.targetItemTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>For</Text>
            <View style={styles.genderRow}>
              {renderGenderSquare('Men', 'men')}
              {renderGenderSquare('Women', 'women')}
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Finding Matches...' : 'Find The Perfect Piece'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="rgb(100, 13, 20)" />
            <Text style={styles.loadingText}>Finding your perfect recommendations...</Text>
            <Text style={styles.loadingSubtext}>This may take a few moments</Text>
          </View>
        </View>
      )}
      <ImageCropModal
        visible={croppingModalVisible}
        imageUri={croppingImageUri || ''}
        onCrop={(croppedUri) => {
          if (croppingItem) {
            setImages(prev => ({ ...prev, [croppingItem]: croppedUri }));
          }
          setCroppingModalVisible(false);
          setCroppingImageUri(null);
          setCroppingItem(null);
        }}
        onCancel={() => {
          setCroppingModalVisible(false);
          setCroppingImageUri(null);
          setCroppingItem(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'rgb(100, 13, 20)',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  itemContainer: {
    alignItems: 'center',
  },
  itemSquare: {
    width: 90,
    height: 90,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemSquareDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#d0d0d0',
    opacity: 0.6,
  },
  itemSquareWithImage: {
    borderColor: 'rgb(100, 13, 20)',
    borderWidth: 2,
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconOverlay: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: 'rgb(100, 13, 20)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addIconDisabled: {
    color: '#ccc',
  },
  squareInvisible: {
    width: 90,
    height: 90,
  },
  itemLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  itemLabelDisabled: {
    color: '#bbb',
  },
  itemLabelSelected: {
    color: 'rgb(100, 13, 20)',
    fontWeight: '600',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  clearButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
    fontSize: 12,
  },
  targetItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  targetItemButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  targetItemButtonSelected: {
    backgroundColor: 'rgb(100, 13, 20)',
    borderColor: 'rgb(100, 13, 20)',
  },
  targetItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  targetItemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
  },
  genderContainer: {
    alignItems: 'center',
  },
  genderSquare: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  genderSquareSelected: {
    backgroundColor: 'rgb(100, 13, 20)',
    borderColor: 'rgb(100, 13, 20)',
    transform: [{ scale: 1.05 }],
  },
  genderLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  genderLabelSelected: {
    color: 'rgb(100, 13, 20)',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: 'rgb(100, 13, 20)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: 'rgb(100, 13, 20)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 250,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});