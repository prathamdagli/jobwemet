import { initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

// Initialize the Admin SDK exactly once. In the emulator the Firebase CLI
// injects FIREBASE_CONFIG, so initializeApp() with no args is sufficient.
// In production this resolves the project from the deployed environment.
const app: App = initializeApp();

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: Storage = getStorage(app);
