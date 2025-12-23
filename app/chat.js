import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Platform, KeyboardAvoidingView, Text } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GiftedChat, Bubble, InputToolbar, Composer, Send } from "react-native-gifted-chat";
import { useLocalSearchParams, useNavigation } from "expo-router";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
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
  const name = (params?.name ?? "User").toString();
  const uid  = (params?.uid  ?? "anon").toString();
  const bg   = (params?.bg   ?? "#cfdcc6").toString();

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // ---- NetInfo (with simulator-safe recovery) ------------------------------
  const net = useNetInfo();
  const [netFix, setNetFix] = useState(null);
  const hookConnected = net.isConnected;
  // Treat null as "unknown"; use last polled value; default to true so the
  // simulator shows the toolbar on first render.
  const isConnected = hookConnected == null ? (netFix == null ? true : netFix) : hookConnected;

  useEffect(() => {
    let timer;
    // When the hook says "offline", poll until we're actually back online.
    if (hookConnected === false) {
      setNetFix(false);
      timer = setInterval(() => {
        NetInfo.fetch()
          .then(s => {
            if (s.isConnected) {
              setNetFix(true);
              clearInterval(timer);
            }
          })
          .catch(() => {});
      }, 1500);
    } else if (hookConnected === true) {
      setNetFix(true);
    }
    return () => timer && clearInterval(timer);
  }, [hookConnected]);

  // --------------------------------------------------------------------------

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

  // Simple header offset so the input doesn’t jump under the notch
  const headerOffset = insets.top + 44;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={["left","right","bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerOffset}
        pointerEvents="box-none"
      >
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{ _id: uid, name }}
          alwaysShowSend
          alignTop

          text={text}
          onInputTextChanged={setText}
          placeholder="Type a message..."

          renderInputToolbar={(props) =>
            isConnected ? (
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
            ) : null
          }

          renderComposer={(props) => (
            <Composer
              {...props}
              placeholder="Type a message..."
              placeholderTextColor="#7a7a7a"
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
              containerStyle={{ justifyContent: "center", alignItems: "center", marginHorizontal: 8 }}
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

          listViewProps={{
            keyboardShouldPersistTaps: "always",
            keyboardDismissMode: Platform.OS === "ios" ? "on-drag" : "none",
          }}

          bottomOffset={Platform.OS === "ios" ? 34 : 0}
          minInputToolbarHeight={56}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
