/**
 * Benchmarks (the BENCHMARK table in the ERD). A benchmark is the average tip
 * percentage at a restaurant over a period, calculated from anonymised tip
 * entries. Module 3 of the app: administrators create, read, update and delete.
 */
import { collection, deleteDoc, doc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';

import { COLLECTIONS, DEFAULT_RESTAURANT } from '../config/constants';
import { db } from '../config/firebase';
import { averageTipPercentage, filterByDateRange } from '../utils/calculations';
import { cacheBenchmark } from './offlineQueue';
import { fetchRestaurantTips } from './tipService';

const benchmarksCollection = () => collection(db, COLLECTIONS.benchmarks);
const forRestaurant = (restaurantId) => query(benchmarksCollection(), where('restaurantId', '==', restaurantId));

/** Newest calculation first. */
const toSortedList = (snapshot) =>
  snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => b.calculatedAt - a.calculatedAt);

/** Read: listens to a restaurant's benchmarks, newest first. */
export function subscribeToBenchmarks(restaurantId, onChange, onError) {
  return onSnapshot(forRestaurant(restaurantId), (snapshot) => onChange(toSortedList(snapshot)), onError);
}

/** Read: fetches the current benchmark once (used by the guest calculator) and caches it. */
export async function fetchLatestBenchmark(restaurantId) {
  const latest = toSortedList(await getDocs(forRestaurant(restaurantId)))[0] ?? null;
  await cacheBenchmark(latest);
  return latest;
}

/**
 * Create: calculates a benchmark from every tip logged at the restaurant in
 * the period. Only the average and the entry count are stored, never who
 * earned what.
 * @throws when there are no tip entries in the period.
 */
export async function calculateBenchmark({ restaurantId, periodStart, periodEnd }) {
  const tips = filterByDateRange(await fetchRestaurantTips(restaurantId), periodStart, periodEnd);
  if (!tips.length) {
    const error = new Error('There are no tip entries in this period.');
    error.code = 'benchmark/no-data';
    throw error;
  }

  // Make sure the restaurant record exists before linking a benchmark to it.
  await setDoc(
    doc(db, COLLECTIONS.restaurants, restaurantId),
    { name: DEFAULT_RESTAURANT.name, address: DEFAULT_RESTAURANT.address, active: true },
    { merge: true }
  );

  const dates = tips.map((tip) => tip.shiftDate).sort();
  const benchmark = {
    restaurantId,
    periodStart: periodStart ?? dates[0],
    periodEnd: periodEnd ?? dates[dates.length - 1],
    averageTipPercentage: averageTipPercentage(tips),
    entryCount: tips.length,
    calculatedAt: Date.now(),
    source: 'calculated',
  };
  await setDoc(doc(benchmarksCollection()), benchmark);
  return benchmark;
}

/** Update: an administrator corrects the figure by hand. */
export function updateBenchmark(id, averageTipPercentage) {
  return updateDoc(doc(benchmarksCollection(), id), { averageTipPercentage, source: 'manual' });
}

/** Delete: removes a benchmark. */
export function deleteBenchmark(id) {
  return deleteDoc(doc(benchmarksCollection(), id));
}
