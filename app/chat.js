import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';

export default function Chat() {
  const navigation = useNavigation();
  const { name, color } = useLocalSearchParams();

  useEffect(() => {
    navigation.setOptions({ title: (name && String(name)) || 'Chat' });
  }, [name, navigation]);

  return (
    <View style={[s.container, { backgroundColor: color ? String(color) : '#fff' }]}>
      <Text style={s.h1}>Welcome, {name || 'Guest'} 👋</Text>
      <Text style={s.sub}>Chat UI comes next.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  sub: { color: '#666' },
});
