import React, { useEffect, useState, useCallback } from "react";
import { Platform, KeyboardAvoidingView, SafeAreaView } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import { useLocalSearchParams, Stack } from "expo-router";

export default function Chat() {
  const { name = "Chat", color = "#C1CCB8" } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: "Hello developer 👋",
        createdAt: new Date(),
        user: { _id: 2, name: "React Native", avatar: "https://placeimg.com/140/140/any" },
      },
      { _id: 2, text: "You entered the chat", createdAt: new Date(), system: true },
    ]);
  }, []);

  const onSend = useCallback((newMessages = []) => {
    setMessages((prev) => GiftedChat.append(prev, newMessages));
  }, []);

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{ right: { backgroundColor: "#111827" }, left: { backgroundColor: "#E5E7EB" } }}
      textStyle={{ right: { color: "#fff" }, left: { color: "#111827" } }}
    />
  );

  // Lift the input above the home indicator
  const bottomOffset = Platform.OS === "ios" ? 36 : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color }}>
      <Stack.Screen options={{ title: String(name) }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <GiftedChat
          messages={messages}
          onSend={(msgs) => onSend(msgs)}
          user={{ _id: 1, name: String(name) }}
          renderBubble={renderBubble}
          bottomOffset={bottomOffset}
          keyboardShouldPersistTaps="never"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
