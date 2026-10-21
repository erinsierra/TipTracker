// Calculator sessions (CALCULATOR_SESSION table in the ERD)
// Each record is anonymous: bill, suggested and chosen tip %, and display variant
// No customer details are stored
import { addDoc, collection, getDocs } from 'firebase/firestore';

import { COLLECTIONS } from '../config/constants';
import { db } from '../config/firebase';

const sessionsCollection = () => collection(db, COLLECTIONS.calculatorSessions);

// Create: saves one use of the customer calculator
export function logCalculatorSession({ displayVariantId, billAmount, suggestedPercentage, selectedPercentage }) {
  return addDoc(sessionsCollection(), {
    displayVariantId,
    billAmount,
    suggestedPercentage,
    selectedPercentage,
    createdAt: Date.now(),
  });
}

// Read (admin): gets all sessions for the A/B analytics screen
export async function fetchCalculatorSessions() {
  const snapshot = await getDocs(sessionsCollection());
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}
