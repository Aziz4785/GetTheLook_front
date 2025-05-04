import HangerIcon from '@/assets/images/hanger.svg';
import SearchIcon from '@/assets/images/search.svg';
import TshirtIcon from '@/assets/images/tshirt.svg';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgProps } from 'react-native-svg';


export default function HomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Get The Look</Text>
      <View style={styles.buttonRow}>
        <MenuButton
          title="Find a Complement"
          Icon={TshirtIcon}
          onPress={() => {
            // handle navigation or action
            router.push('/(tabs)/find-complement')
          }}
        />
        <MenuButton
          title="Wardrobe Wizard"
          Icon={HangerIcon}
          onPress={() => {
            // handle navigation or action
          }}
        />
        <MenuButton
          title="Smart Search"
          Icon={SearchIcon}
          onPress={() => {
            // handle navigation or action
          }}
        />
      </View>
    </View>
  );
}

type MenuButtonProps = {
  title: string;
  Icon: React.FC<SvgProps>;
  onPress: () => void;
};

function MenuButton({ title, Icon, onPress }: MenuButtonProps) {
  return (
    <View style={styles.menuButtonContainer}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Icon width={48} height={48} />
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
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40, // space between app name and buttons
    marginTop: 32,    // space from the top of the screen
    color: '#222',    // optional: makes the text a bit darker
    letterSpacing: 1, // optional: adds a little spacing between letters
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  menuButtonContainer: {
    alignItems: 'center',
    width: 100,
  },
  menuButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    marginTop: 10,
  },
});