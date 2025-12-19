import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { router } from 'expo-router';

const COLORS = ['#090C08', '#474056', '#8A95A5', '#B9C6AE'];

export default function Index() {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[2]);

  const go = () =>
    router.push({
      pathname: '/chat',
      params: { name: name.trim() || 'Guest', color },
    });

  return (
    <ImageBackground source={require('../assets/bg.png')} style={{ flex: 1 }}>
      <View style={s.container}>
        <Text style={s.title}>Chat App</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="#888"
          style={s.input}
        />

        <Text style={s.label}>Choose background color:</Text>
        <View style={s.colorsRow}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setColor(c)}
              style={[s.swatch, { backgroundColor: c }, color === c && s.swatchActive]}
              accessibilityRole="button"
              accessibilityLabel={`Select color ${c}`}
            />
          ))}
        </View>

        <TouchableOpacity onPress={go} style={s.button}>
          <Text style={s.buttonText}>Start chatting</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(255,255,255,0.92)' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 14, fontSize: 16, color: '#111' },
  label: { marginTop: 18, marginBottom: 8, color: '#333' },
  colorsRow: { flexDirection: 'row', gap: 12 },
  swatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: '#000' },
  button: { marginTop: 22, backgroundColor: '#377dff', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
