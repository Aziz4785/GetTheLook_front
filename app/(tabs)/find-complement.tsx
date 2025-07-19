import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ImageCropModal from '../../components/ImageCropModal';
import { useTranslation } from '../../hooks/useTranslation';
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
  top: string[];
  trousers: string[];
  shorts: string[];
  skirt: string[];
  shoes: string[];
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
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState('top');  //React Hooks must be used in the top level of the component
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState<string | null>(null);
  const [images, setImages] = useState<ClothingImages>({
    top: [],
    trousers: [],
    shorts: [],
    skirt: [],
    shoes: [],
  });
  const [croppingModalVisible, setCroppingModalVisible] = useState(false);
  const [croppingItem, setCroppingItem] = useState<ClothingItem | null>(null);
  const [croppingImageUri, setCroppingImageUri] = useState<string | null>(null);
  
  // Loading animation states
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));

  
  // Function to handle picking an image
  const pickImage = async (item: ClothingItem) => {
    // Check if already has 3 images
    if (images[item].length >= 3) {
      Alert.alert(t('findComplement.maximumReached'), t('findComplement.maximumReachedMessage'));
      return;
    }

    // Request permissions
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(t('findComplement.permissionsRequired'), t('findComplement.permissionsRequiredMessage'));
      return;
    }
  
    // Show instruction first
    Alert.alert(
      t('findComplement.forBestResults'),
      t('findComplement.bestResultsMessage'),
      [
        {
          text: t('findComplement.ok'),
          onPress: () => {
            // After user acknowledges, prompt to choose source
            Alert.alert(
              t('findComplement.selectImageSource'),
              t('findComplement.chooseOption'),
              [
                {
                  text: t('findComplement.camera'),
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
                  text: t('findComplement.library'),
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
                { text: t('findComplement.cancel'), style: 'cancel' },
              ]
            );
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    // Check if at least one image is uploaded
    const hasAnyImage = Object.values(images).some(value => value.length > 0);
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
        if (value.length > 0 && key !== selectedItem) {
          value.forEach((imageUri: string , index: number) => {
            formData.append(key, {
              uri: imageUri,
              name: `${key}_${index}.png`,
              type: 'image/png',
            } as any); // 'as any' to satisfy TypeScript for React Native FormData
          });
        }
      });
    //Add selectedItem to the formData
    formData.append('target', selectedItem);
    formData.append('gender', gender);
    //log('Form Data:', formData);
    
    setLoading(true);
    
    try {
      //log('Sending request...');
      //const response = await fetch('http://192.168.1.10:8000/recommend', {
      const response = await fetch('https://getthelook-server.onrender.com/recommend', {
        method: 'POST',
        body: formData, // Only this
      });

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
    setImages((prev) => ({ ...prev, [item]: [] }));
  };


  const uploadedItems = Object.keys(images).filter((key) => images[key as ClothingItem].length > 0);

  // For bottom wear, if any of 'trousers', 'shorts', or 'skirt' is uploaded, exclude all three
  const hasBottom = ['trousers', 'shorts', 'skirt'].some((item) => uploadedItems.includes(item));

  const isBottomCategory = (item: ClothingItem) =>
    ['trousers', 'shorts', 'skirt'].includes(item);
  
  // Check which categories have been selected
  const categorySelected = {
    top: images['top'].length > 0,
    bottom: (['trousers', 'shorts', 'skirt'] as ClothingItem[]).some((item) => images[item].length > 0),
    shoes: images['shoes'].length > 0,
  };
  // Count how many distinct categories have been selected
  const selectedCategoryCount = Object.values(categorySelected).filter(Boolean).length;


  const availableOptions = [
    { label: t('findComplement.top'), value: 'top' as ClothingItem },
    { label: t('findComplement.trousers'), value: 'trousers' as ClothingItem },
    { label: t('findComplement.shorts'), value: 'shorts' as ClothingItem },
    { label: t('findComplement.skirt'), value: 'skirt' as ClothingItem },
    { label: t('findComplement.shoes'), value: 'shoes' as ClothingItem },
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
    const itemImages = images[item];
    const hasImages = itemImages.length > 0;
    //const canAddMore = itemImages.length < 3;
    // Calculate total images by category
    const topCategoryTotal = images.top.length;
    const bottomCategoryTotal = images.trousers.length + images.shorts.length + images.skirt.length;
    const shoesCategoryTotal = images.shoes.length;
    
    // Check if any category has reached the limit of 3 images
    const anyyCategoryAtLimit = topCategoryTotal >= 3 || bottomCategoryTotal >= 3 || shoesCategoryTotal >= 3;
    
    // For the current item, check if its category would exceed 3 images
    let currentCategoryTotal = 0;
    if (item === 'top') {
      currentCategoryTotal = topCategoryTotal;
    } else if (['trousers', 'shorts', 'skirt'].includes(item)) {
      currentCategoryTotal = bottomCategoryTotal;
    } else if (item === 'shoes') {
      currentCategoryTotal = shoesCategoryTotal;
    }
    
    // const categoriesWithImages = [
    //   images.top.length > 0,
    //   bottomCategoryTotal > 0, // any bottom wear has images
    //   images.shoes.length > 0
    // ].filter(Boolean).length;

    
    const canAddMore = (!anyyCategoryAtLimit && currentCategoryTotal < 3) &&  (selectedCategoryCount <= 1); //only one category has images.length>0;


    const isDisabled = disabled || !canAddMore;  // reuse this twice below

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={[
            styles.itemSquare,
            isDisabled && styles.itemSquareDisabled,
            hasImages && styles.itemSquareWithImage,
          ]}

          onPress={() => {
            if (!isDisabled) {
              pickImage(item);
            }
          }}
          disabled={isDisabled}
    >
          {hasImages ? (
            <View style={styles.imageStackContainer}>
              {/* Count badge */}
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{itemImages.length}</Text>
              </View>
              
              {/* Render stacked images with fanned effect */}
              {itemImages.map((imageUri, index) => (
                <View
                key={index}
                style={[
                  styles.stackedImageContainer,
                  {
                    transform: [
                      { translateX: index * 5 },
                      { translateY: index * -1 },
                      { rotate: `${(index - (itemImages.length - 1) / 2) * 6}deg` }
                    ],
                    zIndex: index,
                  }
                ]}
              >
                  <Image 
                    source={{ uri: imageUri }} 
                    style={styles.stackedImage} 
                    resizeMode="cover" 
                  />
                  
                </View>
              ))}
              
              {/* Show + button if can add more */}
              {canAddMore && (
                <View style={styles.addMoreOverlay}>
                  <Text style={styles.addMoreIcon}>+</Text>
                </View>
              )}
              
              {/* Clear all button */}
              <TouchableOpacity
                style={styles.clearButton} 
                onPress={() => clearImage(item)}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
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
          hasImages && styles.itemLabelSelected
        ]}>
          {label}
        </Text>
      </View>
    );
  };

  // Helper function to get what user will receive
  const getRecommendationDescription = () => {
    const uploadedCategories = [];
    const uploadedCounts = [];
    
    if (images.top.length > 0) {
      uploadedCategories.push('tops');
      uploadedCounts.push(`${images.top.length} top${images.top.length > 1 ? 's' : ''}`);
    }
    
    const bottomItems = ['trousers', 'shorts', 'skirt'].filter(item => images[item as ClothingItem].length > 0);
    if (bottomItems.length > 0) {
      uploadedCategories.push('bottom wear');
      const totalBottoms = bottomItems.reduce((sum, item) => sum + images[item as ClothingItem].length, 0);
      uploadedCounts.push(`${totalBottoms} bottom piece${totalBottoms > 1 ? 's' : ''}`);
    }
    
    if (images.shoes.length > 0) {
      uploadedCategories.push('shoes');
      uploadedCounts.push(`${images.shoes.length} shoe${images.shoes.length > 1 ? 's' : ''}`);
    }

    const targetItemName = selectedItem === 'trousers' ? 'trousers' : 
                          selectedItem === 'shorts' ? 'shorts' :
                          selectedItem === 'skirt' ? 'skirt' :
                          selectedItem === 'top' ? 'tops' : 'shoes';

    if (uploadedCounts.length === 1) {
      return `Finding ${targetItemName} that perfectly match your ${uploadedCounts[0]}`;
    } else if (uploadedCounts.length === 2) {
      return `Finding ${targetItemName} that complement both your ${uploadedCounts[0]} and ${uploadedCounts[1]}`;
    } else {
      return `Finding ${targetItemName} that work with all your uploaded pieces`;
    }
  };

  // Enhanced loading tips with animations
  const loadingTips = [
    '🎨 ' + t('findComplement.analyzingColorsAndPatterns'),
    '👗 ' + t('findComplement.matchingStylesAndAesthetics'),
    '🔍 ' + t('findComplement.searchingThroughZalando'),
    '🔍 ' + t('findComplement.searchingThroughAmazon'),
  ];

  // Animate tip changes
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      // Fade out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Change tip
        setCurrentTipIndex((prevIndex) => (prevIndex + 1) % loadingTips.length);
        
        // Fade in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [loading, fadeAnim, scaleAnim]);

  // Reset animation values when loading starts
  useEffect(() => {
    if (loading) {
      setCurrentTipIndex(0);
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
    }
  }, [loading]);

  return (
    <SafeAreaView style={styles.safeArea}> 
      <ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}> 
          <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>{t('findComplement.mainTitle')}</Text>
            {/*<Text style={styles.subtitle}>{t('findComplement.subtitle')}</Text>*/}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('findComplement.whichItemsHave')}</Text>
            <Text style={styles.instructionText}>{t('findComplement.addItemsInstruction')}</Text>
            <View style={styles.grid}>
              {/* {renderItemSquare('top', 'Top', selectedCategoryCount >= 2 && !categorySelected.top)} */}
              {renderItemSquare('top', t('findComplement.top'), (selectedCategoryCount >= 2 && !categorySelected.top) || Object.entries(images).some(([key, value]) => key !== 'top' && value.length > 1) || (images.trousers.length >=1 && images.shorts.length >=1)  || (images.trousers.length >=1 && images.skirt.length >=1) || (images.shorts.length >=1 && images.skirt.length >=1)   )}
              {/*renderItemSquare('trousers', 'Trousers', images.shorts.length > 0 || images.skirt.length > 0 || (selectedCategoryCount >= 2 && images.trousers.length === 0))} */}
              {renderItemSquare('trousers', t('findComplement.trousers'),  (selectedCategoryCount >= 2 && images.trousers.length === 0) || Object.entries(images).some(([key, value]) => key !== 'trousers' && key !== 'shorts' && key !== 'skirt' && value.length > 1))}
              {/* {renderItemSquare('shorts', 'Shorts', images.skirt.length > 0 || images.trousers.length > 0 || (selectedCategoryCount >= 2 && images.shorts.length === 0))} */}
              {renderItemSquare('shorts', t('findComplement.shorts'), (selectedCategoryCount >= 2 && images.shorts.length === 0) || Object.entries(images).some(([key, value]) => key !== 'shorts' && key !== 'trousers' && key !== 'skirt' && value.length > 1))}
              {/* {renderItemSquare('skirt', 'Skirt', images.shorts.length > 0 || images.trousers.length > 0 || (selectedCategoryCount >= 2 && images.skirt.length === 0))} */}
              {renderItemSquare('skirt', t('findComplement.skirt'), (selectedCategoryCount >= 2 && images.skirt.length === 0) || Object.entries(images).some(([key, value]) => key !== 'skirt' && key !== 'trousers' && key !== 'shorts' && value.length > 1))}
              {/* {renderItemSquare('shoes', 'Shoes', selectedCategoryCount >= 2 && !categorySelected.shoes)} */}
              {renderItemSquare('shoes', t('findComplement.shoes'), (selectedCategoryCount >= 2 && !categorySelected.shoes) || Object.entries(images).some(([key, value]) => key !== 'shoes' && value.length > 1) ||  (images.trousers.length >=1 && images.shorts.length >=1)  || (images.trousers.length >=1 && images.skirt.length >=1) || (images.shorts.length >=1 && images.skirt.length >=1) )}

              <View style={styles.squareInvisible} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('findComplement.whatLookingFor')}</Text>
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
            <Text style={styles.sectionTitle}>{t('findComplement.for')}</Text>
            <View style={styles.genderRow}>
              {renderGenderSquare(t('findComplement.men'), 'men')}
              {renderGenderSquare(t('findComplement.women'), 'women')}
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
              {loading ? t('findComplement.findingMatches') : t('findComplement.findPerfectPiece')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinnerContainer}>
              <ActivityIndicator size="large" color="rgb(100, 13, 20)" />
              <View style={styles.loadingRings}>
                <View style={[styles.loadingRing, styles.loadingRing1]} />
                <View style={[styles.loadingRing, styles.loadingRing2]} />
              </View>
            </View>
            
            {/*<Text style={styles.loadingTitle}>{t('findComplement.aiWorkingMagic')}</Text>*/}
            <Text style={styles.loadingDescription}>
              {getRecommendationDescription()}
            </Text>
            
            <Animated.View 
              style={[
                styles.loadingTipContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <Text style={styles.loadingTip}>
                {loadingTips[currentTipIndex]}
              </Text>
            </Animated.View>
            
            <View style={styles.loadingProgress}>
              <View style={styles.progressDots}>
                {loadingTips.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      currentTipIndex === index && styles.progressDotActive
                    ]}
                  />
                ))}
              </View>
            </View>
            
            <Text style={styles.loadingFooter}>This may take a few moments</Text>
          </View>
        </View>
      )}
      <ImageCropModal
        visible={croppingModalVisible}
        imageUri={croppingImageUri || ''}
        onCrop={(croppedUri) => {
          if (croppingItem) {
            setImages(prev => ({ 
              ...prev, 
              [croppingItem]: [...prev[croppingItem], croppedUri]
            }));
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
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginTop: -15,
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
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
    overflow: 'visible',
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
  imageStackContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible', // Add this to prevent clipping
  },
  stackedImageContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  stackedImage: {
    width: '100%',
    height: '100%',
  },
  clearSingleButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgb(100, 13, 20)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  addMoreIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearAllButton: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: 'rgba(255,0,0,0.9)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 100,
  },
  clearAllButtonText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  countBadge: {
    position: 'absolute',
    top: -10, // Position so only bottom quarter shows
    left: -10, // Position so only right quarter shows  
    backgroundColor: 'rgb(100, 13, 20)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
    borderWidth: 2,
    borderColor: '#fff',
  },
  countBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  clearButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
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
  loadingSpinnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRings: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingRing: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 2,
  },
  loadingRing1: {
    backgroundColor: 'rgb(100, 13, 20)',
  },
  loadingRing2: {
    backgroundColor: 'rgba(100, 13, 20, 0.5)',
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  loadingDescription: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingTipContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  loadingTip: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingProgress: {
    marginTop: 20,
    marginBottom: 10,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  progressDotActive: {
    backgroundColor: 'rgb(100, 13, 20)',
  },
  loadingFooter: {
    marginTop: 16,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});