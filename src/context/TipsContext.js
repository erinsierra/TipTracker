/**
 * Shares the signed-in server's tip entries and the offline queue between the
 * Log tip, History and Account screens. Because every screen reads the same
 * data, a new entry shows up in the history immediately.
 */
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

/** Converts the text typed into the tip form into the fields stored in the database. */
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

/** Errors that mean "no connection" rather than "not allowed". */
const isConnectionError = (error) => ['network/timeout', 'unavailable'].includes(error?.code);

export function TipsProvider({ children }) {
  const { user } = useAuth();
  const userId = user.uid;

  const [syncedEntries, setSyncedEntries] = useState([]);
  const [pendingEntries, setPendingEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const isSyncing = useRef(false);

  /** Uploads queued entries. Returns how many were uploaded. */
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

  // Show what is saved on the phone straight away, then listen to the cloud.
  useEffect(() => {
    let active = true;
    Promise.all([getCachedTips(userId), getPendingTips(userId)]).then(([cachedTips, pending]) => {
      if (!active) return;
      setSyncedEntries((current) => (current.length ? current : cachedTips));
      setPendingEntries(pending);
      if (cachedTips.length || pending.length) setLoading(false);
    });

    const stopTips = subscribeToTips(
      userId,
      (entries, fromCache) => {
        setLoading(false);
        // Opening the app offline gives an empty result: keep the saved copy instead.
        if (fromCache && !entries.length) return;
        setSyncedEntries(entries);
        cacheTips(userId, entries);
      },
      () => setLoading(false)
    );

    return () => {
      active = false;
      stopTips();
    };
  }, [userId]);

  // Track the connection and upload the queue as soon as signal returns.
  useEffect(
    () =>
      NetInfo.addEventListener((state) => {
        const online = isOnlineState(state);
        setIsOnline(online);
        if (online) syncNow();
      }),
    [syncNow]
  );

  /**
   * Saves a new entry. Without signal (or on a very slow one) the entry goes
   * into the offline queue instead.
   * @returns {'saved' | 'queued'}
   */
  const addTip = useCallback(
    async (form) => {
      const id = newTipId();
      const entry = { ...toEntryFields(form), userId, createdAt: Date.now() };

      if (isOnline) {
        try {
          await withTimeout(saveTip(id, entry), NETWORK_TIMEOUT_MS);
          return 'saved';
        } catch (error) {
          if (!isConnectionError(error)) throw error;
        }
      }
      setPendingEntries(await addPendingTip(userId, { id, ...entry }));
      return 'queued';
    },
    [isOnline, userId]
  );

    /** Changes an entry that is already in the cloud. */
  const editTip = useCallback((id, form) => withTimeout(updateTip(id, toEntryFields(form)), NETWORK_TIMEOUT_MS), []);
  
  /** Deletes an entry from the cloud, or from the queue if it has not synced yet. */
  const removeTip = useCallback(
    async (entry) => {
      if (entry.synced === false) {
        setPendingEntries(await removePendingTip(userId, entry.id));
        return;
      }
      await withTimeout(deleteTip(entry.id), NETWORK_TIMEOUT_MS);
    },
    [userId]
  );

  const value = useMemo(() => {
    const pendingIds = new Set(pendingEntries.map((entry) => entry.id));
    const entries = sortNewestFirst([...pendingEntries, ...syncedEntries.filter((entry) => !pendingIds.has(entry.id))]);
    return { entries, pendingCount: pendingEntries.length, loading, isOnline, addTip, editTip, removeTip, syncNow };
  }, [syncedEntries, pendingEntries, loading, isOnline, addTip, editTip, removeTip, syncNow]);

  return <TipsContext.Provider value={value}>{children}</TipsContext.Provider>;
}

export function useTips() {
  return useContext(TipsContext);
}
