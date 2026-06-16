import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { TimelineData } from './types';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Login failed", error);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed", error);
  }
};

// Data sync logic
export const fetchTimelineData = async (): Promise<TimelineData | null> => {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
    const eventsSnapshot = await getDocs(collection(db, 'events'));

    if (!settingsDoc.exists()) {
      return null;
    }

    const events = eventsSnapshot.docs.map(d => d.data() as any);
    return {
      ...settingsDoc.data(),
      events,
    } as TimelineData;
  } catch (error) {
    console.error("Error fetching data from Firestore:", error);
    return null;
  }
};

export const saveTimelineData = async (data: TimelineData) => {
  try {
    const batch = writeBatch(db);

    const { events, ...settings } = data;
    
    // Save settings
    const settingsRef = doc(db, 'settings', 'global');
    batch.set(settingsRef, settings);

    // Save events
    // For simplicity, we can delete all existing events and recreate them, or just overwrite by ID.
    // Given the admin is the only one modifying, overwriting by ID is fine. 
    // We should also delete events that were removed, but for now we might just upload all current ones.
    const currentEventsSnapshot = await getDocs(collection(db, 'events'));
    const currentEventIds = currentEventsSnapshot.docs.map(d => d.id);
    const newEventIds = events.map(e => e.id);

    // Delete removed events
    const eventsToDelete = currentEventIds.filter(id => !newEventIds.includes(id));
    for (const id of eventsToDelete) {
      batch.delete(doc(db, 'events', id));
    }

    // Set updated events
    for (const event of events) {
        // Ensure id is string to avoid issues
       batch.set(doc(db, 'events', String(event.id)), event);
    }

    await batch.commit();
  } catch (error) {
    console.error("Error saving data to Firestore:", error);
    throw error;
  }
};
