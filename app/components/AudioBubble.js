import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Audio } from "expo-av";

const mmss = (ms) => {
  if (!ms && ms !== 0) return "0:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function AudioBubble({ uri }) {
  const soundRef = useRef(null);
  const mounted = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState({ positionMillis: 0, durationMillis: 0 });

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      (async () => {
        try {
          if (soundRef.current) {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }
        } catch {}
      })();
    };
  }, [uri]);

  const ensureLoaded = async () => {
    if (soundRef.current) return;
    setIsLoading(true);
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false },
      (st) => {
        if (!mounted.current) return;
        setStatus(st);
        if ("isPlaying" in st) setIsPlaying(st.isPlaying);
        if (st.didJustFinish) setIsPlaying(false);
      }
    );
    soundRef.current = sound;
    setIsLoading(false);
  };

  const onTogglePlay = async () => {
    try {
      await ensureLoaded();
      const st = await soundRef.current.getStatusAsync();
      if (st.isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (e) {
      console.log("audio error", e);
    }
  };

  const onRestart = async () => {
    try {
      await ensureLoaded();
      await soundRef.current.setPositionAsync(0);
      await soundRef.current.playAsync();
    } catch (e) {
      console.log("audio restart error", e);
    }
  };

  return (
    <View style={styles.box}>
      <TouchableOpacity style={styles.button} onPress={onTogglePlay} accessibilityRole="button" accessibilityLabel={isPlaying ? "Pause audio" : "Play audio"}>
        {isLoading ? <ActivityIndicator /> : <Text style={styles.btnText}>{isPlaying ? "Pause" : "Play"}</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.secondary]} onPress={onRestart}>
        <Text style={styles.btnText}>↺</Text>
      </TouchableOpacity>
      <Text style={styles.time}>
        {mmss(status.positionMillis)} / {mmss(status.durationMillis)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#f2f2f7",
    maxWidth: 220,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#0a84ff",
    marginRight: 8,
  },
  secondary: {
    backgroundColor: "#9aa0a6",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
  time: {
    marginLeft: 4,
    fontVariant: ["tabular-nums"],
    color: "#333",
  },
});
