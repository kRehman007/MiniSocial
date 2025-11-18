import SignupForm from "../components/SignupForm"

const SignupPage = () => {
  return (
   <div className="h-[90vh] md:h-screen flex flex-col overflow-hidden md:flex-row">
      <div className="flex md:w-1/2 h-1/2 md:h-screen overflow-hidden items-center justify-center">
        <img
          src="/LoginImg.jpeg"
          alt="Login Illustration"
          className="object-cover bg-center h-full w-full"
        />
      </div>

      <div className="flex flex-1 items-center md:px-5 justify-center -mt-48 md:mt-0 rounded-tl-3xl  bg-white rounded-tr-3xl md:rounded-none">
        <SignupForm />
      </div>
    </div>
  )
}

export default SignupPage