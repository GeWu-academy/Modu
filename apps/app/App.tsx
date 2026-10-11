import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modu</Text>
      <Text style={styles.subtitle}>移动采集端</Text>
      <Text style={styles.description}>
        React Native + Expo 已就绪，业务功能将在这里逐步接入。
      </Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    color: '#0f172a',
    fontSize: 36,
    fontWeight: '700',
  },
  subtitle: {
    color: '#334155',
    fontSize: 18,
    marginTop: 12,
  },
  description: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 24,
    maxWidth: 320,
    textAlign: 'center',
  },
});
