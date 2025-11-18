import type { User, UserRole } from '@/lib/interface';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth} from './firebaseConfig';


export const authService = {
  async signUp(
    email: string, 
    password: string, 
    fullname: string, 
    username: string, 
    role: UserRole
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      
      const user = userCredential.user;

    //   Update profile with display name
      await updateProfile(user, {
        displayName: fullname
      });

      // Create user document in Firestore
    //   const userData = {
    //     uid: user.uid,
    //     email: user.email,
    //     username,
    //     fullname,
    //     role,
    //     createdAt: new Date().toISOString(),
    //   };

    //   await setDoc(doc(db, 'users', user.uid), userData);

      return {
        uid: user.uid,
        email: user.email!,
        username,
        fullname,
        role,
      };
    } catch (error) {
      throw error;
    }
  },

  async signIn(email: string, password: string) {
     try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  },

  async signOut() {
     try {
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  },

  async deleteAccount() {
    const user = auth.currentUser;
    if (user) {
      try {
        await user.delete();
        // await deleteDoc(doc(db, 'users', user.uid));
        await signOut(auth);
        console.log('User account deleted successfully');
      } catch (error) {
        console.error('Account deletion error:', error);
        throw error;
      } 
    } else {
      throw new Error('No authenticated user found');
    }
}
};