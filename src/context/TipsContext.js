// Shares the server's tip entries and offline queue across the
// Log tip, History and Account screens
// All screens read the same data, so new entries show in history right away
import NetInfo from '@react-native-community/netinfo';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { NETWORK_TIMEOUT_MS } from '../config/constants';
import {
  addPendingTip,
  cacheTips,
  getCachedTips,
  getPendingTips,
  removePendingTip,
  syncPendingTips,
} from '../services/offlineQueue';
import { deleteTip, newTipId, saveTip, subscribeToTips, updateTip } from '../services/tipService';
import { calculateTipPercentage, sortNewestFirst } from '../utils/calculations';
import { isOnlineState, withTimeout } from '../utils/network';
import { parseAmount } from '../utils/validation';
import { useAuth } from './AuthContext';

const TipsContext = createContext(null);

// Converts form text into the fields saved in the database
function toEntryFields({ shiftDate, billAmount, tipAmount, partySize }) {
  const bill = parseAmount(billAmount);
  const tip = parseAmount(tipAmount);
  return {
    shiftDate,
    billAmount: bill,
    tipAmount: tip,
    partySize: Number(partySize),
    tipPercentage: calculateTipPercentage(bill, tip),
  };
}

// Checks if an error means no connection (not a permission error)
const isConnectionError = (error) => ['network/timeout', 'unavailable'].includes(error?.code);

export function TipsProvider({ children }) {
  const { user } = useAuth();
  const userId = user.uid;

  const [syncedEntries, setSyncedEntries] = useState([]);
  const [pendingEntries, setPendingEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const isSyncing = useRef(false);

  // Uploads queued entries and returns how many were uploaded
  const syncNow = useCallback(async () => {
    if (isSyncing.current) return 0;
    isSyncing.current = true;
    try {
      const { uploaded, remaining } = await syncPendingTips(userId);
      setPendingEntries(remaining);
      return uploaded;
    } finally {
      isSyncing.current = false;
    }
  }, [userId]);

  // Shows data saved on the phone first, then listens for cloud updates
  useEffect(() => {
    let active = true;
    Promise.all([getCachedTips(userId), getPendingTips(userId)]).then(([cachedTips, pending]) => {
      if (!active) return;
      setSyncedEntries((current) => (current.length ? current : cachedTips));
      setPendingEntries(pending);
      if (cachedTips.length || pending.length) setLoading(false);
    });

    const stopTips = subscribeToTips(
