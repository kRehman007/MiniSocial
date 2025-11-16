import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { z } from 'zod';
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import CustomLoader from "@/lib/loader";
import { URL } from "@/lib/URL";
import { Link } from "react-router-dom";

const signupSchema = z.object({
      fullname:z.string().min(1,"Full name is required"),
      username:z.string().min(1,"Username is required"),
      email: z.string().min(1,"Email is required").email({ message: 'Invalid email address' }),
      password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    });

    type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm = () => {
    const [showPassword,setShowPassword]=useState<boolean>(false);

     const {
        register,
        handleSubmit,
        watch,
        formState: { isSubmitting,errors },
      } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
      });

      const onSubmit = (data: SignupFormData) => {
        toast.success("Thank you for signing up!");
        console.log(data);
      };
  return (
    <div className="w-full max-w-md mx-auto md:bg-white md:shadow-xl md:rounded-2xl p-4 md:p-8 md:border md:border-gray-200">
      <h2 className="text-3xl font-bold mb-2 text-center text-gray-900">Create Account</h2>
      <p className="text-sm text-gray-500 mb-8 text-center">Sign up to continue to your account</p>

        <ScrollArea className="h-[340px] md:h-auto pr-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Fullname */}
            <div className="space-y-2">
              <Label className="pl-1">Fullname</Label>
              <Input placeholder="Enter your fullname" {...register("fullname")} />
              {errors.fullname && <p className="text-sm text-red-500 mt-0 pl-1">{errors.fullname.message}</p>}
            </div>
            {/* Email */}
            <div className="space-y-2">
              <Label className="pl-1">Username</Label>
              <Input placeholder="Enter your username" {...register("username")} />
              {errors.username && <p className="text-sm text-red-500 mt-0 pl-1">{errors.username.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="pl-1">Email</Label>
              <Input placeholder="Enter your email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500 mt-0 pl-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2 relative">
              <Label className="pl-1">Password</Label>
              <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...register("password")} />
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

        

            <Button disabled={isSubmitting} type="submit" className="w-full cursor-pointer bg-green-600 hover:bg-green-700">
              {isSubmitting ? <CustomLoader /> : "Signup"}
            </Button>

            <div className="flex gap-1 items-center justify-center -mt-2"> 
            Already have an account?  
            <Link to={URL.LOGIN} className="hover:underline text-red-600">
            Login
            </Link>
            </div>
          </form>
        </ScrollArea>
      
    </div>
  )
}

export default SignupForm