import { getAuth } from "firebase-admin/auth";
import { getFirestore, doc, updateDoc, serverTimestamp } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialiser Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export async function PATCH(req) {
  try {
    const { firstName, lastName, phoneNumber } = await req.json();

    // Récupérer l'utilisateur depuis le header Authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Non authentifié" }),
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const auth = getAuth();

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Token invalide" }),
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;

    // Validation
    if (!firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: "Le prénom et le nom sont obligatoires" }),
        { status: 400 }
      );
    }

    // Mettre à jour le profil dans Firestore
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      phoneNumber: phoneNumber || "",
      dateModification: serverTimestamp(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Profil mis à jour avec succès",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur serveur" }),
      { status: 500 }
    );
  }
}
