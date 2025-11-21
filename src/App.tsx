import { Route, Routes, useNavigate } from "react-router-dom"
import { AllRoutes } from "./lib/route"
import ProtectedRoute from "./lib/ProtectedRoute"
import { useEffect } from "react";
import { useAuthStore } from "./zustand/useAuthStore";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import { account, databases } from "./appwrite/appwriteConfig";
import { URL } from "./lib/URL";
import { conf } from "./lib/conf";

function App() {
  const navigate=useNavigate()
const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

 useEffect(() => {
  const checkAuth = async () => {
    try {
      const authUser = await account.get();
      const userDoc = await databases.getDocument(
        conf.appwrite.databaseId,
        conf.appwrite.usersCollectionId,
        authUser.$id
      );
      setUser({
        $id: userDoc.$id,
        email: userDoc.email,
        fullname: userDoc.fullname,
        username: userDoc.username,
        role: userDoc.role,
        bio: userDoc.bio,
        photoURL: userDoc.photoURL,
        photoFileId: userDoc.photoFileId,
      });

    } catch (err) {
      console.log("User not logged in",err);
      clearUser();
      navigate(URL.LOGIN);
    }
  };

  checkAuth();
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
