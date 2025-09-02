import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin SDK once (modular API)
(() => {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      // eslint-disable-next-line no-console
      console.warn(
        "Firebase Admin credentials are not fully set. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment."
      );
      return;
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
})();

// Export the Admin Auth instance
export const adminAuth = getAuth();
