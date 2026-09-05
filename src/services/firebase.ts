import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { UserSafe } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Initialize Firebase App safely
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp({
    apiKey: firebaseConfigJson.apiKey,
    authDomain: firebaseConfigJson.authDomain,
    projectId: firebaseConfigJson.projectId,
    storageBucket: firebaseConfigJson.storageBucket,
    messagingSenderId: firebaseConfigJson.messagingSenderId,
    appId: firebaseConfigJson.appId
  });
} else {
  app = getApp();
}

// Initialize Auth
export const auth: Auth = getAuth(app);

// Initialize Firestore with specific database ID from config
const dbId = firebaseConfigJson.firestoreDatabaseId || undefined;
export const db: Firestore = dbId && dbId !== '(default)'
  ? getFirestore(app, dbId)
  : getFirestore(app);

export interface CloudAuditLog {
  id?: string;
  action: string;
  performedBy: string;
  userEmail?: string;
  userRole?: string;
  targetUserId?: string;
  details?: Record<string, any> | string;
  timestamp: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Persist or synchronize user data in Cloud Firestore
 */
export async function syncUserToFirestore(user: Partial<UserSafe> & { id: string }): Promise<boolean> {
  try {
    if (!user || !user.id) return false;
    const userRef = doc(db, 'users', user.id);
    const payload: Record<string, any> = {
      id: user.id,
      updatedAt: serverTimestamp()
    };

    if (user.email !== undefined) payload.email = user.email;
    if (user.name !== undefined) payload.name = user.name;
    if (user.role !== undefined) payload.role = user.role;
    if (user.queriesRemaining !== undefined) payload.queriesRemaining = user.queriesRemaining;
    if (user.totalQueriesUsed !== undefined) payload.totalQueriesUsed = user.totalQueriesUsed;
    if (user.isImportUnlocked !== undefined) payload.isImportUnlocked = user.isImportUnlocked;
    if (user.isBatchUnlocked !== undefined) payload.isBatchUnlocked = user.isBatchUnlocked;
    if (user.company !== undefined) payload.company = user.company;
    if (user.nif !== undefined) payload.nif = user.nif;
    if (user.phone !== undefined) payload.phone = user.phone;
    if (user.country !== undefined) payload.country = user.country;
    if (user.activePlanId !== undefined) payload.activePlanId = user.activePlanId;

    await setDoc(userRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.warn('[Firebase] syncUserToFirestore error:', error);
    return false;
  }
}

/**
 * Fetch user document from Cloud Firestore
 */
export async function getUserFromFirestore(userId: string): Promise<Record<string, any> | null> {
  try {
    if (!userId) return null;
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.warn('[Firebase] getUserFromFirestore error:', error);
    return null;
  }
}

/**
 * Record immutable cloud audit log in Firestore
 */
export async function logAuditToFirestore(event: {
  action: string;
  performedBy: string;
  userEmail?: string;
  userRole?: string;
  targetUserId?: string;
  details?: Record<string, any> | string;
}): Promise<boolean> {
  try {
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const logRef = doc(db, 'audit_logs', logId);

    const logData: CloudAuditLog = {
      action: event.action,
      performedBy: event.performedBy,
      userEmail: event.userEmail,
      userRole: event.userRole,
      targetUserId: event.targetUserId,
      details: event.details,
      timestamp: serverTimestamp(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server'
    };

    await setDoc(logRef, logData);
    return true;
  } catch (error) {
    console.warn('[Firebase] logAuditToFirestore error:', error);
    return false;
  }
}

/**
 * Retrieve recent cloud audit logs from Firestore
 */
export async function fetchAuditLogsFromFirestore(limitCount: number = 50): Promise<CloudAuditLog[]> {
  try {
    const logsCol = collection(db, 'audit_logs');
    const q = query(logsCol, orderBy('timestamp', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);

    const logs: CloudAuditLog[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      logs.push({
        id: docSnap.id,
        action: data.action || 'Ação do Sistema',
        performedBy: data.performedBy || 'Sistema',
        userEmail: data.userEmail,
        userRole: data.userRole,
        targetUserId: data.targetUserId,
        details: data.details,
        timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
        userAgent: data.userAgent
      });
    });

    return logs;
  } catch (error) {
    console.warn('[Firebase] fetchAuditLogsFromFirestore error (falling back to local):', error);
    return [];
  }
}

/**
 * Save simulation record to Cloud Firestore
 */
export async function saveSimulationToFirestore(
  userId: string,
  moduleType: string,
  summary: Record<string, any>
): Promise<boolean> {
  try {
    const simId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const simRef = doc(db, 'simulations', simId);

    await setDoc(simRef, {
      id: simId,
      userId,
      moduleType,
      summary,
      createdAt: serverTimestamp()
    });

    // Also record audit log of simulation
    await logAuditToFirestore({
      action: `SIMULATION_${moduleType.toUpperCase()}`,
      performedBy: userId,
      details: { simulationId: simId, module: moduleType }
    });

    return true;
  } catch (error) {
    console.warn('[Firebase] saveSimulationToFirestore error:', error);
    return false;
  }
}

export { app };
