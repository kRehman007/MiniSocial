import { Route, Routes } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import { AllRoutes } from "./lib/route"
import ProtectedRoute from "./lib/ProtectedRoute"

function App() {

  return (
     <>
    <ToastContainer position="bottom-right" />
   <Routes>
   {
   AllRoutes.map(({ link, element: Element, isProtected }, index) => {


  if (isProtected) {
    return (
      <Route key={index} path={link} element={
        <ProtectedRoute>
         <Element />
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
