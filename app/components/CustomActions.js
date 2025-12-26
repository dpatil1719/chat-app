import React, { useRef } from "react";
import { Alert, TouchableOpacity, Text, View, StyleSheet, Platform, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Audio } from "expo-av";

/**
 * Props expected:
 * - storage: Firebase Storage instance
 * - uid: current user id
 * - onSend: helper from Chat.js that adds a message to Firestore
 * - wrapperStyle, iconTextStyle: GiftedChat styles passthrough
 */
export default function CustomActions({ storage, uid, onSend, wrapperStyle, iconTextStyle }) {
  const { showActionSheetWithOptions } = useActionSheet();
  const recordingRef = useRef(null);

  const generateReference = (uri, prefix = "image") => {
    const ts = Date.now();
    const name = uri?.split("/").pop() || `${prefix}.bin`;
    return `${prefix}-${uid}-${ts}-${name}`;
  };

  const uploadAndSendImage = async (uri) => {
    try {
      const r = await fetch(uri);
      const blob = await r.blob();
      const unique = generateReference(uri, "image");
      const uploadRef = ref(storage, unique);
      await uploadBytes(uploadRef, blob);
      const url = await getDownloadURL(uploadRef);
      onSend({ image: url }); // images already render in GiftedChat
    } catch (e) {
      console.log("upload image error", e);
      Alert.alert("Upload failed", "Could not upload the image.");
    }
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm?.granted) {
        return Alert.alert("Permission required", "Please allow photo library access.");
      }
      // No mediaTypes passed: default is images (also avoids deprecation warnings)
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.8,
        selectionLimit: 1,
        allowsMultipleSelection: false,
      });
      if (!result.canceled) {
        await uploadAndSendImage(result.assets[0].uri);
      }
    } catch (e) {
      console.log("pickImage error", e);
      Alert.alert("Cannot open library", "Please try again.");
    }
  };

  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm?.granted) {
        return Alert.alert("Permission required", "Please allow camera access to take a photo.");
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
    } catch (e) {
      const msg = String(e?.message || e);
      if (msg.toLowerCase().includes("simulator")) {
        Alert.alert("Camera not available", "The iOS simulator doesn’t have a camera. Please test on a physical device.");
      } else {
        console.log("takePhoto error", e);
        Alert.alert("Camera error", "Unable to use the camera.");
      }
    }
  };

  const getLocation = async () => {
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm?.granted) {
        return Alert.alert(
          "Permission required",
          "We need your permission to share your current location.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => (Linking?.openSettings ? Linking.openSettings() : null) },
          ]
        );
      }
      const loc = await Location.getCurrentPositionAsync({});
      onSend({ location: { latitude: loc.coords.latitude, longitude: loc.coords.longitude } });
    } catch (e) {
      console.log("getLocation error", e);
      Alert.alert("Location error", "Unable to get your current location.");
    }
  };

  // --- Audio recording (Bonus) ---
  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm?.granted) {
        return Alert.alert("Permission required", "Please allow microphone access to record audio.");
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: 1, // default
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      recordingRef.current = rec;
      Alert.alert("Recording", "Recording started.\nOpen the + menu again and tap 'Stop Recording' to send.");
    } catch (e) {
      const msg = String(e?.message || e);
      if (Platform.OS === "ios" && msg.toLowerCase().includes("simulator")) {
        Alert.alert("Microphone", "Recording may not work reliably in the simulator. Please test on a physical device.");
      } else {
        console.log("startRecording error", e);
        Alert.alert("Recording error", "Could not start recording.");
      }
    }
  };

  const stopRecordingAndSend = async () => {
    try {
      const rec = recordingRef.current;
      if (!rec) return;
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      recordingRef.current = null;

      // Upload audio (m4a)
      const r = await fetch(uri);
      const blob = await r.blob();
      const key = generateReference(uri || "audio.m4a", "audio");
      const uploadRef = ref(storage, key);
      await uploadBytes(uploadRef, blob, { contentType: "audio/m4a" });
      const url = await getDownloadURL(uploadRef);

      // Send with a small text so it's visible even without a custom player
      onSend({ audio: url, text: "🎙️ Voice message" });
    } catch (e) {
      console.log("stopRecordingAndSend error", e);
      Alert.alert("Audio upload failed", "Could not upload the audio message.");
    }
  };

  const onActionPress = () => {
    const hasRecording = !!recordingRef.current;
    const options = [
      "Choose From Library",
      "Take Photo",
      "Share Location",
      hasRecording ? "Stop Recording" : "Record Audio",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      { options, cancelButtonIndex },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0: return pickImage();
          case 1: return takePhoto();
          case 2: return getLocation();
          case 3:
            if (recordingRef.current) return stopRecordingAndSend();
            else return startRecording();
          default:
            return;
        }
      }
    );
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Open actions menu"
      accessibilityHint="Choose to send a photo, take a photo, share location, or record audio"
      style={styles.container}
      onPress={onActionPress}
    >
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text style={[styles.iconText, iconTextStyle]}>＋</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 14,
    backgroundColor: "transparent",
    textAlign: "center",
    includeFontPadding: false,
  },
});
