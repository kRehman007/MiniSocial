import { Route, Routes } from "react-router-dom"
import { AllRoutes } from "./lib/route"
import ProtectedRoute from "./lib/ProtectedRoute"
import { useEffect } from "react";
import { useAuthStore } from "./zustand/useAuthStore";
import { onAuthStateChanged } from "firebase/auth";
import { auth} from "./firebase/firebaseConfig";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";

function App() {
const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // try {
        //   const userDoc = await getDoc(doc(db, 'users', user.uid));
          
        //   if (userDoc.exists()) {
        //     const userData = userDoc.data() as User;
        //     setUser(userData);
        //   } else {
        //     console.warn('User document not found in Firestore');
        //     clearUser();
        //   }
        // } catch (error) {
        //   console.error('Error fetching user data:', error);
        //   clearUser();
        // }
        setUser({
          uid: user.uid,
          email: user.email!,
          fullname: user?.displayName || '',
        });
      } else {
        clearUser();
      }
    });

    return () => unsubscribe();
  }, []);
  return (
     <>
   <Toaster
  position="bottom-right"
  reverseOrder={false}
/>
   <Routes>
   {
   AllRoutes.map(({ link, element: Element, isProtected }, index) => {


  if (isProtected) {
    return (
      <Route key={index} path={link} element={
        <ProtectedRoute>
        <>
        <Navbar />
        <div className="pt-24 p-7">
          <Element />
        </div>
        </>
        </ProtectedRoute>
      } />
    )
  }

  return <Route key={index} path={link} element={<Element />} />
})

   }
   </Routes>
   </>
  )
}

export default App
