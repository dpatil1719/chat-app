import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { router } from "expo-router";
import { signInAnonymously } from "firebase/auth";
import { getAuthInstance } from "../src/firebase";

export default function Index() {
  const [name, setName] = useState("");
  const [bg, setBg]   = useState("#cfdcc6");

  const onStart = async () => {
    try {
      const auth = getAuthInstance();
      const res = await signInAnonymously(auth);
      const uid = res?.user?.uid || "anon";
      router.push({ pathname: "chat", params: { uid, name: name || "User", bg } });
    } catch (e) {
      Alert.alert("Sign-in failed", String(e?.message || e));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={styles.title}>Welcome{ name ? `, ${name}` : "" } 👋</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={name}
        onChangeText={setName}
        returnKeyType="done"
      />
      <TouchableOpacity style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>Start Chatting</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "600", marginBottom: 24 },
  input: {
    width: "85%",
    height: 48,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
