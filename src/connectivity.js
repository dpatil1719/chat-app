import React, { createContext, useContext } from "react";

// isConnected can be: true | false | null (while detecting)
export const ConnectivityContext = createContext({ isConnected: null });

export const useConnectivity = () => useContext(ConnectivityContext);
