import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const Start = ({ navigation }) => {
  const [name, setName] = useState('');

  const goToChat = () => {
    navigation.navigate('Chat', { name: name.trim() || 'Guest', color: '#ffffff' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat App</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor="#9aa4b2"
      />

      <TouchableOpacity
        style={[styles.button, !name.trim() && { opacity: 0.6 }]}
        onPress={goToChat}
        disabled={!name.trim()}
      >
        <Text style={styles.buttonText}>Start Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0d10', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, color: '#e8eef6', marginBottom: 24, fontWeight: '600' },
  input: {
    width: '86%',
    borderWidth: 1, borderColor: '#263043', borderRadius: 12,
    paddingHorizontal: 14, height: 48, color: '#e8eef6', backgroundColor: '#12161b', marginBottom: 16
  },
  button: { backgroundColor: '#1b2331', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20 },
  buttonText: { color: '#e8eef6', fontSize: 16, fontWeight: '600' },
});

export default Start;
