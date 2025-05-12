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
      <View style={styles.centeredRowWrapper}>
        <View style={styles.buttonRow}>
          <MenuButton
            title="Find a Complement"
            Icon={TshirtIcon}
            onPress={() => {
              router.push('/(tabs)/find-complement')
            }}
          />
          <MenuButton
            title="Wardrobe Wizard"
            Icon={HangerIcon}
            onPress={() => {}}
            comingSoon
          />
          <MenuButton
            title="Smart Search"
            Icon={SearchIcon}
            onPress={() => {}}
            comingSoon
          />
        </View>
      </View>
    </View>
  );
}

type MenuButtonProps = {
  title: string;
  Icon: React.FC<SvgProps>;
  onPress: () => void;
  comingSoon?: boolean;
};

function MenuButton({ title, Icon, onPress, comingSoon }: MenuButtonProps) {
  return (
    <View style={styles.menuButtonContainer}>
      <View style={styles.menuButtonWrapper}>
        {comingSoon && <Text style={styles.comingSoonText}>Coming Soon</Text>}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Icon width={48} height={48} />
        </TouchableOpacity>
      </View>
      <Text style={styles.menuText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 100,
    marginBottom: 0,
    color: '#222',
    letterSpacing: 1,
  },
  centeredRowWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: '60%', // This pushes the buttonRow down to 40% of the available height
    alignItems: 'center',
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  menuButtonContainer: {
    alignItems: 'center',
    width: 100,
  },
  menuButtonWrapper: {
    position: 'relative',
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
  comingSoonText: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#666',
    color: 'white',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
    overflow: 'hidden',
  },
});