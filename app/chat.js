import React, { useCallback, useLayoutEffect, useState } from "react";
import { Platform, KeyboardAvoidingView, Text } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GiftedChat, Bubble, InputToolbar, Composer, Send } from "react-native-gifted-chat";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { db, storage } from "../src/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import MapView from "react-native-maps";
import AudioBubble from "./components/AudioBubble";
import CustomActions from "./components/CustomActions";

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
          image: data?.image,
          location: data?.location,
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
    return unsub;
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

  // ✅ Helper used by CustomActions to send images/locations as messages
  const sendAttachment = async (payload) => {
    try {
      await addDoc(collection(db, "messages"), {
        ...payload,                       // { image: url } or { location: {lat, long} }
        createdAt: serverTimestamp(),
        user: { _id: uid, name },
      });
    } catch (e) {
      console.log("sendAttachment error", e);
    }
  };

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
          placeholder="Type a message..."

          /* 🔘 Action (+) button for image/location */
          renderActions={(p) => (
            <CustomActions
              {...p}
              storage={storage}
              uid={uid}
              onSend={sendAttachment}
            />
          )}

          /* 🗺️ Show a small map when a message has location */
          renderCustomView={({ currentMessage }) =>
            currentMessage?.location ? (
              <MapView
                style={{ width: 150, height: 100, borderRadius: 12, margin: 4 }}
                region={{
                  latitude: currentMessage.location.latitude,
                  longitude: currentMessage.location.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              />
            ) : null
          }

          renderInputToolbar={(props) => (
            <InputToolbar
              {...props}
              containerStyle={{
                borderTopWidth: 1,
                borderTopColor: "#e5e7eb",
                paddingHorizontal: 8,
                paddingVertical: 6,
                backgroundColor: "#fff",
              }}
              primaryStyle={{ alignItems: "center" }}
            />
          )}

          renderComposer={(props) => (
            <Composer
              {...props}
              placeholder="Type a message..."
              placeholderTextColor="#7a7a7a"
              textInputAutoFocus={false}
              multiline
              textInputProps={{
                editable: true,
                autoCorrect: true,
                autoCapitalize: "sentences",
                allowFontScaling: false,
              }}
              textInputStyle={{ color: "#111", fontSize: 16, flex: 1 }}
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
                marginRight: 8,
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
                left:  { backgroundColor: "#f2f2f7" },
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
