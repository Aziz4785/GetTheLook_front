import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';



export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <MenuButton
          title="Find a Complement"
          imageSource={require('@/assets/images/tshirt.svg')}
          onPress={() => {
            // handle navigation or action
          }}
        />
        <MenuButton
          title="Wardrobe Wizard"
          imageSource={require('@/assets/images/hanger.svg')}
          onPress={() => {
            // handle navigation or action
          }}
        />
        <MenuButton
          title="Smart Search"
          imageSource={require('@/assets/images/search.svg')}
          onPress={() => {
            // handle navigation or action
          }}
        />
      </View>
    </View>
  );
}

function MenuButton({ title, imageSource, onPress }) {
  return (
    <View style={styles.menuButtonContainer}>
      <TouchableOpacity style={styles.menuButton} onPress={onPress} activeOpacity={0.7}>
        <Image source={imageSource} style={styles.menuImage} />
      </TouchableOpacity>
      <Text style={styles.menuText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 24,
  },
  menuButtonContainer: {
    alignItems: 'center',
    width: 100,
  },
  menuButton: {
    width: 100,
    height: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
  },
  menuImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  menuText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
});