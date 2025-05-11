import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Recommendation {
  img_url: string;
  link: string;
  brand: string;
}

export default function RecommendationsScreen() {
  const params = useLocalSearchParams();
  
  // Parse recommendations from the route params
  const recommendationsParam = params.recommendations as string;
  let recommendations: Recommendation[] = [];
  
  try {
    recommendations = recommendationsParam ? JSON.parse(recommendationsParam) : [];
  } catch (error) {
    console.error('Error parsing recommendations:', error);
  }
  
  const openProductLink = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Error opening URL:', err);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <Text style={styles.title}>Recommended Items</Text>
        
        {recommendations.length === 0 ? (
          <Text style={styles.noResults}>No recommendations found</Text>
        ) : (
          <View style={styles.grid}>
            {recommendations.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.productCard}
                onPress={() => openProductLink(item.link)}
              >
                <Image 
                  source={{ uri: item.img_url }} 
                  style={styles.productImage} 
                  resizeMode="cover"
                />
                <Text style={styles.brandText}>{item.brand}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContentContainer: {
    flexGrow: 1,
    padding: 20,
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
    justifyContent: 'space-between',
    gap: 10,
  },
  productCard: {
    width: '48%', 
    aspectRatio: 0.75,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: '85%',
  },
  brandText: {
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40,
  },
});