import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

const COLORS = ["#C1CCB8", "#FDE68A", "#BFDBFE", "#FECACA", "#E5E7EB"];

export default function Start() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const startChatting = () => {
    router.push({
      pathname: "/chat",
      params: { name: name || "Anonymous", color },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.container, { backgroundColor: color }]}>
        <Text style={styles.title}>Welcome, {name ? name : "Friend"} 👋</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="#6B7280"
          accessible
          accessibilityLabel="Your name"
          accessibilityHint="Enter your display name for the chat."
        />

        <Text style={styles.label}>Pick a background color</Text>
        <View style={styles.swatches}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setColor(c)}
              style={[styles.swatch, { backgroundColor: c, borderColor: color === c ? "#111827" : "transparent" }]}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Choose background color ${c}`}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={startChatting}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Start chatting"
          accessibilityHint="Navigates to the chat screen."
        >
          <Text style={styles.buttonText}>Start chatting</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "flex-end" },
  title: { fontSize: 28, fontWeight: "700", color: "#111827", marginBottom: 24 },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    color: "#111827",
    marginBottom: 16,
  },
  label: { color: "#111827", fontWeight: "600", marginBottom: 8 },
  swatches: { flexDirection: "row", gap: 12, marginBottom: 24 },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
