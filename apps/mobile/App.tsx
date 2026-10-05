import { formatLength } from '@woodworks/core';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// Placeholder shop screen. The real one shows today's tasks, measurements and
// the shopping list for the active project.
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Woodworks</Text>
      <Text>In the shop: {formatLength(19.05, 'in')} board, cut to {formatLength(450, 'mm')}.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf6f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#7a4a24',
    marginBottom: 8,
  },
});
