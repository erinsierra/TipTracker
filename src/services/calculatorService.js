/**
 * Calculator sessions (the CALCULATOR_SESSION table in the ERD).
 * Each record is anonymous: it holds the bill, the suggested and chosen tip
 * percentage and the display variant shown, and nothing about the customer.
 */
import { addDoc, collection, getDocs } from 'firebase/firestore';

import { COLLECTIONS } from '../config/constants';
import { db } from '../config/firebase';

const sessionsCollection = () => collection(db, COLLECTIONS.calculatorSessions);

/** Create: records one use of the customer calculator. */
export function logCalculatorSession({ displayVariantId, billAmount, suggestedPercentage, selectedPercentage }) {
  return addDoc(sessionsCollection(), {
    displayVariantId,
    billAmount,
    suggestedPercentage,
    selectedPercentage,
    createdAt: Date.now(),
  });
}

/** Read (admin): all sessions, for the A/B analytics screen. */
export async function fetchCalculatorSessions() {
  const snapshot = await getDocs(sessionsCollection());
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}
