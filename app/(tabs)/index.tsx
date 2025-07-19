import HangerIcon from '@/assets/images/hanger.svg';
import SearchIcon from '@/assets/images/search.svg';
import TshirtIcon from '@/assets/images/tshirt.svg';
import { useTranslation } from '@/hooks/useTranslation';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgProps } from 'react-native-svg';


export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const handleContactPress = () => {
    const subject = encodeURIComponent('App feedback');
    const body    = encodeURIComponent('\n\n——\nsent from ensembl.ai');
    Linking.openURL(`mailto:ensembl.ai@gmail.com?subject=${subject}&body=${body}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>{t('app.name')}</Text>
      <Text style={styles.betaSubtitle}>
        {t('home.betaSubtitle')}
      </Text>
      <View style={styles.centeredRowWrapper}>
        <View style={styles.buttonRow}>
          <MenuButton
            title={t('home.findComplement')}
            Icon={TshirtIcon}
            onPress={() => {
              router.push('/(tabs)/find-complement')
            }}
          />
          <MenuButton
            title={t('home.wardrobeWizard')}
            Icon={HangerIcon}
            onPress={() => {}}
            comingSoon
          />
          <MenuButton
            title={t('home.smartSearch')}
            Icon={SearchIcon}
            onPress={() => {}}
            comingSoon
          />
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/affiliate-disclosure')}
          style={styles.footerButton}
        >
          <Text style={styles.affiliateText}>
            {t('home.legal')}
          </Text>
        </TouchableOpacity>
        {/* ·  middle dot separator  */}
        <Text style={styles.footerText}>{' · '}</Text>

        {/* ✉️  CONTACT  */}
        <TouchableOpacity
          onPress={handleContactPress}
          style={styles.footerButton}
        >
          <Text style={styles.footerText}>{"contact us"}</Text>
        </TouchableOpacity>
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
  const { t } = useTranslation();
  
  return (
    <View style={styles.menuButtonContainer}>
      <View style={styles.menuButtonWrapper}>
        {comingSoon && <Text style={styles.comingSoonText}>{t('home.comingSoon')}</Text>}
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
    fontSize: 42,
    fontWeight: 'bold',
    marginTop: 100,
    marginBottom: 0,
    color: 'rgb(100,13,20)',
    letterSpacing: 4,
  },
  betaSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 0,
    textAlign: 'center',
    maxWidth: 320,
  },
  centeredRowWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: '40%', // This pushes the buttonRow down to 40% of the available height
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
    backgroundColor: 'rgb(100,13,20)',
    color: 'white',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
    overflow: 'hidden',
  },
  footer: {
    position: 'absolute',
    bottom: 100, // Increased to ensure visibility above tab bar
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  affiliateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  affiliateText: {
    fontSize: 12,
    color: '#666',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  footerButton: {
    padding: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',      // tailwind gray‑500-ish
    textDecorationLine: 'underline',
  },
});