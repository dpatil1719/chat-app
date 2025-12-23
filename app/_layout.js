import React, { useEffect, useMemo } from "react";
import { Stack } from "expo-router";
import { useNetInfo } from "@react-native-community/netinfo";
import { ConnectivityContext } from "../src/connectivity";
import { enableNetwork, disableNetwork } from "firebase/firestore";
import { db } from "../src/firebase";

export default function RootLayout() {
  const net = useNetInfo();
  const isConnected = net.isConnected ?? null;

  // Toggle Firestore network based on connectivity
  useEffect(() => {
    if (isConnected === false) {
      disableNetwork(db);
    } else if (isConnected === true) {
      enableNetwork(db);
    }
  }, [isConnected]);

  const value = useMemo(() => ({ isConnected }), [isConnected]);

  // Keep your headers/stack behavior as-is
  return (
    <ConnectivityContext.Provider value={value}>
      <Stack />
    </ConnectivityContext.Provider>
  );
}
