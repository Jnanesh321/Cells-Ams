import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [state, setState] = useState<NetInfoState>({ isConnected: true, isInternetReachable: true } as NetInfoState);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(setState);
    return () => unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    const s = await NetInfo.fetch();
    setState(s);
  }, []);

  return {
    isConnected: state.isConnected ?? true,
    isInternetReachable: state.isInternetReachable,
    type: state.type,
    refresh,
  };
}
