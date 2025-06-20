import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AffiliateDisclosureScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Affiliate Disclosure</Text>
      </View>

      <View style={styles.content}>
        {/* French Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🇫🇷 Français</Text>
          <Text style={styles.text}>
            En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises.
          </Text>
          <Text style={styles.text}>
            Cette application peut contenir des liens d'affiliation Amazon. Lorsque vous effectuez un achat via ces liens, nous pouvons recevoir une petite commission sans frais supplémentaires pour vous. Cela nous aide à maintenir et améliorer l'application.
          </Text>
          <Text style={styles.text}>
            Nous nous engageons à respecter toutes les réglementations applicables en matière de publicité, de protection des données et de marketing. Toutes les recommandations de produits sont basées sur nos algorithmes et ne sont pas influencées par les commissions d'affiliation.
          </Text>
        </View>

        {/* English Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🇺🇸 English</Text>
          <Text style={styles.text}>
            As an Amazon Associate, I earn from qualifying purchases.
          </Text>
          <Text style={styles.text}>
            This app may contain Amazon affiliate links. When you make a purchase through these links, we may receive a small commission at no additional cost to you. This helps us maintain and improve the app.
          </Text>
          <Text style={styles.text}>
            We are committed to complying with all applicable regulations regarding advertising, data protection, and marketing. All product recommendations are based on our algorithms and are not influenced by affiliate commissions.
          </Text>
        </View>

        {/* Legal Compliance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal Compliance</Text>
          <Text style={styles.smallText}>
            Nous respectons toutes les lois, ordonnances, règles, réglementations applicables en matière de communications, protection des données, publicité et marketing. / We comply with all applicable laws, ordinances, rules, regulations regarding communications, data protection, advertising and marketing.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: 'rgb(100,13,20)',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgb(100,13,20)',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'rgb(100,13,20)',
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
    color: '#333',
  },
  smallText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#666',
    fontStyle: 'italic',
  },
}); 