import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { z } from 'zod';
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import CustomLoader from "@/lib/loader";
import { URL } from "@/lib/URL";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/zustand/useAuthStore";
import { authService } from "@/appwrite/auth-service";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "@/firebase/firebaseConfig";
import toast from "react-hot-toast";
import { account, databases } from "@/appwrite/appwriteConfig";
import { conf } from "@/lib/conf";


const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
  try {
    await authService.signIn(data.email, data.password);
    const authUser = await account.get(); 
    const userDoc = await databases.getDocument(
      conf.appwrite.databaseId,
      conf.appwrite.usersCollectionId,
      authUser.$id
    );
    setUser({
      $id: authUser.$id,
      email: authUser.email!,
      username: userDoc.username,
      fullname: userDoc.fullname,
      role: userDoc.role,
    });

    toast.success("Login successful!");
    navigate(URL.HOME);
  } 
  catch (error: any) {
    console.error("Login error:", error);

    let errorMessage = "Failed to login.";

    if (error.type === "user_invalid_credentials") {
      errorMessage = "Invalid email or password.";
    }

    toast.error(errorMessage);
  }
};

  return (
    <div className="w-full max-w-md mx-auto md:bg-white md:shadow-xl md:rounded-2xl p-4 md:p-8 md:border md:border-gray-200">
      <h2 className="text-3xl font-bold mb-2 text-center text-gray-900 mt-3">Welcome Back here</h2>
      <p className="text-sm text-gray-500 mb-8 text-center">Sign in to continue to your account</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Label className="pl-1">Email</Label>
          <Input 
            type="email" 
            placeholder="Enter your email" 
            {...register("email")} 
          />
          {errors.email && <p className="text-sm text-red-500 mt-0 pl-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2 relative">
          <Label className="pl-1">Password</Label>
          <Input 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••" 
            {...register("password")} 
          />
          {watch("password") && (
            <div className="absolute top-7 right-2">
              {showPassword ? (
                <Eye size={20} className="cursor-pointer" onClick={() => setShowPassword(false)} />
              ) : (
                <EyeOff size={20} className="cursor-pointer" onClick={() => setShowPassword(true)} />
              )}
            </div>
          )}
          {errors.password && <p className="text-sm text-red-500 mt-0 pl-1">{errors.password.message}</p>}
        </div>

        <Button 
          disabled={isSubmitting} 
          type="submit" 
          className="w-full cursor-pointer bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? <CustomLoader /> : "Login"}
        </Button>

        <div className="flex gap-1 items-center justify-center -mt-2"> 
          Don't have an account?  
          <Link to={URL.SIGNUP} className="hover:underline text-red-600">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;