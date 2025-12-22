import React, { useCallback, useLayoutEffect, useState } from "react";
import { Platform, KeyboardAvoidingView, Text } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GiftedChat, Bubble, InputToolbar, Composer, Send } from "react-native-gifted-chat";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { db } from "../src/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

export default function Chat() {
  const params = useLocalSearchParams();
  const name   = (params?.name ?? "User").toString();
  const uid    = (params?.uid  ?? "anon").toString();
  const bg     = (params?.bg   ?? "#cfdcc6").toString();

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: "chat" });
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          _id: d.id,
          text: data?.text ?? "",
          user: data?.user,
          createdAt:
            data?.createdAt?.toDate
              ? data.createdAt.toDate()
              : data?.createdAt?.toMillis
              ? new Date(data.createdAt.toMillis())
              : new Date(),
        });
      });
      setMessages(list);
    });
    return () => unsub && unsub();
  }, [navigation]);

  const onSend = useCallback(async (newMessages = []) => {
    const m = newMessages[0];
    if (!m?.text?.trim()) return;
    await addDoc(collection(db, "messages"), {
      text: m.text,
      createdAt: serverTimestamp(),
      user: { _id: uid, name },
    });
    setText("");
  }, [uid, name]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={["left","right","bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top}
        pointerEvents="box-none"
      >
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{ _id: uid, name }}
          alwaysShowSend
          alignTop

          /* controlled input */
          text={text}
          onInputTextChanged={setText}
          isKeyboardInternallyHandled={false}

          listViewProps={{
            keyboardShouldPersistTaps: "always",
            keyboardDismissMode: Platform.OS === "ios" ? "on-drag" : "none",
          }}

          /* 🔧 Keep input row horizontal & Send at right */
          renderInputToolbar={(props) => (
            <InputToolbar
              {...props}
              containerStyle={{
                backgroundColor: "#ffffff",
                borderTopColor: "#e5e5ea",
                borderTopWidth: 1,
              }}
              primaryStyle={{
                flexDirection: "row",         // make it a row
                alignItems: "center",
                paddingHorizontal: 6,
              }}
            />
          )}

          renderComposer={(props) => (
            <Composer
              {...props}
              placeholder="Type a message..."
              placeholderTextColor="#7a7a7a"
              multiline
              keyboardAppearance={Platform.OS === "ios" ? "light" : "default"}
              textInputStyle={{ color: "#111", fontSize: 16, flex: 1 }}  // grow to push Send right
              textInputProps={{
                editable: true,
                autoCorrect: true,
                autoCapitalize: "sentences",
                allowFontScaling: false,
              }}
            />
          )}

          renderSend={(props) => (
            <Send
              {...props}
              disabled={!props.text?.trim()}
              containerStyle={{
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 8,
                marginRight: 8,               // nudge to edge
              }}
            >
              <Text
                style={{
                  color: props.text?.trim() ? "#0a84ff" : "#9aa0a6",
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                Send
              </Text>
            </Send>
          )}

          renderBubble={(props) => (
            <Bubble
              {...props}
              wrapperStyle={{
                left:  { backgroundColor: "#ffffff" },
                right: { backgroundColor: "#0a84ff" },
              }}
              textStyle={{
                left:  { color: "#111111" },
                right: { color: "#ffffff" },
              }}
            />
          )}

          bottomOffset={Platform.OS === "ios" ? 34 : 0}
          minInputToolbarHeight={56}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
