import React from "react";
import { Alert, TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as ImagePicker from "expo-image-picker";
import { storage } from "../src/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CustomActions = ({ onSend, wrapperStyle, iconTextStyle }) => {
  const { showActionSheetWithOptions } = useActionSheet();

  const uploadAndSendImage = async (uri) => {
    try {
      const res = await fetch(uri);
      const blob = await res.blob();
      const key = `images/${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const r = ref(storage, key);
      await uploadBytes(r, blob);
      const url = await getDownloadURL(r);
      onSend({ image: url }); // GiftedChat will wrap and forward to your onSend
    } catch (e) {
      Alert.alert("Image upload failed", String(e?.message || e));
    }
  };

  const pickImage = async () => {
    const permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissions?.granted) {
      Alert.alert("Permission required", "Please allow photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      await uploadAndSendImage(result.assets[0].uri);
    }
  };

  const onActionPress = () => {
    const options = ["Choose From Library", "Take Picture", "Send Location", "Cancel"];
    const cancelButtonIndex = 3;
    showActionSheetWithOptions({ options, cancelButtonIndex }, (i) => {
      if (i === 0) pickImage();
      else if (i === 1 || i === 2) {
        Alert.alert("Coming soon", "We’ll add this in the next steps.");
      }
    });
  };

  return (
    <TouchableOpacity
      accessible
      accessibilityRole="button"
      accessibilityLabel="Open actions"
      accessibilityHint="Opens options like choose photo"
      style={styles.container}
      onPress={onActionPress}
    >
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text style={[styles.iconText, iconTextStyle]}>＋</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { width: 32, height: 32, marginLeft: 8, marginBottom: 8 },
  wrapper: {
    flex: 1,
    borderRadius: 16,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { color: "#6b7280", fontWeight: "bold", fontSize: 18 },
});

export default CustomActions;
