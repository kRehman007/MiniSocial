    // firebase.js
    import { initializeApp } from 'firebase/app';
    import { getAuth } from 'firebase/auth';
    import { getFirestore } from 'firebase/firestore';

    const firebaseConfig = {
apiKey: "AIzaSyCs3yaP_q_GYwPKo2kEnqQK_MrpfFCzw9k",
  authDomain: "minisocial-bc7b4.firebaseapp.com",
  projectId: "minisocial-bc7b4",
  storageBucket: "minisocial-bc7b4.firebasestorage.app",
  messagingSenderId: "793418843214",
  appId: "1:793418843214:web:76281516ae44b8dbd4ef1f",
  measurementId: "G-GSQZN8VVRK"
    };

    const app = initializeApp(firebaseConfig);
    export const auth = getAuth(app);
    export const db = getFirestore(app);