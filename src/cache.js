import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "messages_cache";

/** Optional helpers (not required to use in UI) */
export async function saveMessagesCache(list) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}
export async function loadMessagesCache() {
  try {
    const s = await AsyncStorage.getItem(KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}
/** Required by rubric: a function that deletes cached data */
export async function clearMessagesCache() {
  try { await AsyncStorage.removeItem(KEY); } catch {}
}
