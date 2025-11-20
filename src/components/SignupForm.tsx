import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "./ui/select";
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
import type { UserRole } from "@/lib/interface";
import toast from "react-hot-toast";


const signupSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().min(1, "Email is required").email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  role: z.enum(['creator', 'consumer'], {
    message: "Please select a role",
  }),
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState('creator');
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'creator',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const user = await authService.signUp(
        data.email,
        data.password,
        data.fullname,
        data.username,
        data.role
      );

      setUser(user);
      toast.success("Account created successfully!");
      navigate(URL.HOME);
    } catch (error: any) {
      console.error("Signup error:", error);

let errorMessage = "Failed to create account. Please try again.";

if (error.type === "user_already_exists") {
  errorMessage = "This email is already registered. Please use a different email.";
} 
else if (error.type === "general_argument_invalid") {
  errorMessage = "Invalid input. Please check your email or password.";
}
else if (error.code === 500) {
  errorMessage = "Server error. Please try again later.";
}

toast.error(errorMessage);
    }
  };

  const handleRoleChange = (value:UserRole) => {
    setSelectedRole(value);
    setValue('role', value);
  };

  return (
    <div className="w-full max-w-md mx-auto md:bg-white md:shadow-xl md:rounded-2xl p-4 md:p-8 md:border md:border-gray-200">
      <h2 className="text-3xl font-bold mb-2 text-center text-gray-900">Create Your Account</h2>
      <p className="text-sm text-gray-500 mb-8 text-center">Sign up to continue to your account</p>

      <ScrollArea className="h-[380px] md:h-auto pr-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Fullname */}
          <div className="space-y-2">
            <Label className="pl-1">Fullname</Label>
            <Input placeholder="Enter your fullname" {...register("fullname")} />
            {errors.fullname && <p className="text-sm text-red-500 mt-0 pl-1">{errors.fullname.message}</p>}
          </div>

          {/* Username */}
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

           {/* Role Selection */}
          <div className="space-y-2">
            <Label className="pl-1">Role</Label>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="creator">Creator</SelectItem>
                <SelectItem value="consumer">Consumer</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-500 mt-0 pl-1">{errors.role.message}</p>}
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
  );
};

export default SignupForm;