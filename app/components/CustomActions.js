import React from "react";
import { Alert, TouchableOpacity, View, Text, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Props expected from Chat.js:
 * - storage: Firebase Storage instance
 * - uid: current user's id
 * - onSend: function(payload) that writes message to Firestore
 * - wrapperStyle, iconTextStyle: (optional) GiftedChat styling passthroughs
 */
const CustomActions = ({ storage, uid, onSend, wrapperStyle, iconTextStyle }) => {
  const actionSheet = useActionSheet();

  const generateReference = (uri, userId) => {
    const ts = Date.now();
    const parts = (uri || "").split("/");
    const name = parts[parts.length - 1] || "image.jpg";
    return `${userId || "user"}_${ts}_${name}`;
  };

  const uploadAndSendImage = async (imageURI) => {
    try {
      const res = await fetch(imageURI);
      const blob = await res.blob();

      const objectPath = generateReference(imageURI, uid);
      const objectRef = ref(storage, objectPath);

      await uploadBytes(objectRef, blob);
      const url = await getDownloadURL(objectRef);

      onSend({ image: url });
    } catch (e) {
      console.log("upload image error", e);
      Alert.alert("Upload failed", "Could not upload the image. Please try again.");
    }
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm?.granted) {
        Alert.alert(
          "Permission required",
          "Please allow Photos access to pick an image.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => (Linking.openSettings ? Linking.openSettings() : null) },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.9,
        allowsEditing: false,
      });

      if (!result.canceled) {
        await uploadAndSendImage(result.assets[0].uri);
      }
    } catch (e) {
      console.log("pickImage error", e);
      Alert.alert("Image picker error", "Unable to open photo library.");
    }
  };

  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm?.granted) {
        Alert.alert("Permission required", "Please allow camera access to take a photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!result.canceled) {
        await uploadAndSendImage(result.assets[0].uri);
      }
    } catch (e) {
      const msg = String(e?.message || e).toLowerCase();
      if (msg.includes("simulator") || msg.includes("not available")) {
        Alert.alert(
          "Camera not available",
          "The iOS simulator doesn’t have a camera. Please test on a physical device."
        );
      } else {
        console.log("takePhoto error", e);
        Alert.alert("Camera error", "Unable to use the camera.");
      }
    }
  };

  // 🔒 Improved, reliable permission + location flow
  const ensureLocationPermission = async () => {
    // If location services are globally off, nudge the user
    const services = await Location.hasServicesEnabledAsync();
    if (!services) {
      Alert.alert(
        "Turn On Location Services",
        "Location Services are disabled. Enable them in Settings to share your location.",
        [{ text: "Open Settings", onPress: () => (Linking.openSettings ? Linking.openSettings() : null) }, { text: "OK" }]
      );
      return false;
    }

    // Check existing permission first
    const current = await Location.getForegroundPermissionsAsync();
    if (current?.granted) return true;

    // Ask for permission
    const req = await Location.requestForegroundPermissionsAsync();
    if (req?.granted) return true;

    // Still not granted
    Alert.alert(
      "Permission required",
      "We need your permission to share your current location.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => (Linking.openSettings ? Linking.openSettings() : null) },
      ]
    );
    return false;
  };

  const getLocation = async () => {
    try {
      const ok = await ensureLocationPermission();
      if (!ok) return;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // fast + good enough
      });

      onSend({
        location: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        },
      });
    } catch (e) {
      console.log("getLocation error", e);
      Alert.alert("Location error", "Unable to get your current location.");
    }
  };

  const onActionPress = () => {
    const options = ["Choose From Library", "Take Picture", "Send Location", "Cancel"];
    const cancelButtonIndex = options.length - 1;

    actionSheet.showActionSheetWithOptions(
      { options, cancelButtonIndex },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            return pickImage();
          case 1:
            return takePhoto();
          case 2:
            return getLocation();
          default:
            return;
        }
      }
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onActionPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel="Open actions"
      accessibilityHint="Opens options to pick image, take photo, or share location"
    >
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text style={[styles.iconText, iconTextStyle]}>＋</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = {
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
    lineHeight: 20,
  },
};

export default CustomActions;
