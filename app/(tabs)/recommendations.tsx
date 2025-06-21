import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Recommendation {
  img_url: string;
  link: string;
  brand: string;
  score: number;
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
                style={[
                  styles.productCard,
                  item.score > 0.88 && styles.highlightedCard
                ]}
                onPress={() => openProductLink(item.link)}
              >
                {item.score > 0.9 && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.badgeText}>★</Text>
                  </View>
                )}
                <Image 
                  source={{ uri: item.img_url }} 
                  style={styles.productImage} 
                  resizeMode="contain"
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
  highlightedCard: {
    borderColor: 'rgb(100,13,20)',
    borderWidth: 3,
    shadowColor: 'rgb(100,13,20)',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 8,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgb(100,13,20)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
});