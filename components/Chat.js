import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Chat = ({ route, navigation }) => {
  const { name = 'Guest', color = '#ffffff' } = route?.params || {};

  useEffect(() => {
    navigation.setOptions({ title: name || 'Chat' });
  }, [navigation, name]);

  return (
    <View style={[styles.container, { backgroundColor: color || '#ffffff' }]}>
      <Text style={styles.msg}>Welcome, {name} 👋</Text>
      <Text style={styles.sub}>Chat UI comes next.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  msg: { fontSize: 20, fontWeight: '600' },
  sub: { marginTop: 6, color: '#444' },
});

export default Chat;
