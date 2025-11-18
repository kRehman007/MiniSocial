import LoginForm from "../components/LoginForm"

const LoginPage = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden md:flex-row">
      <div className="flex md:w-1/2 h-screen overflow-hidden items-center justify-center">
        <img
          src="/LoginImg.jpeg"
          alt="Login Illustration"
          className="object-cover bg-center h-full w-full"
        />
      </div>

      <div className="flex flex-1 items-center md:px-5 justify-center -mt-36 md:mt-0 rounded-tl-3xl  bg-white rounded-tr-3xl md:rounded-none">
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage