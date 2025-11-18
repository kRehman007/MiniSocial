import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { URL } from "@/lib/URL";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { LogOut, Plus, Menu, X, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/zustand/useAuthStore";
import { authService } from "@/firebase/auth-service";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Navbar = () => {
  const { clearUser, user } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      clearUser();
      toast.success("Logged out successfully");
      navigate(URL.LOGIN);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      await authService.deleteAccount()
      clearUser();
      toast.success("Account deleted successfully");
      navigate(URL.LOGIN);
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.fullname) {
      return user.fullname
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.username?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-white shadow-sm h-[65px] text-black z-50 p-4 flex justify-between items-center">
        {/* Left side - Logo and mobile menu */}
        <div className="flex flex-row-reverse md:flex-row justify-between w-screen md:w-auto md:justify-start items-center gap-4">
          <button 
            className="lg:hidden" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div
            className="text-sm text-green-600 flex gap-2 items-center font-bold cursor-pointer"
            onClick={() => navigate(URL.HOME)}
          >
            <img src="/Logo.png" className="w-6 h-auto object-contain bg-transparent" />
            <h2 className="mt-0 text-lg font-semibold">Be Social</h2>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex flex-1 justify-end items-center gap-6">
          {/* Create Post Button */}
          {user && (
            <Button
              className="bg-green-600 cursor-pointer hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Create Post</span>
            </Button>
          )}

          {/* User Dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative cursor-pointer h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage
                      src={"https://github.com/shadcn.png"}
                      alt={user.fullname || user.username}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                {/* User Info Section */}
                <DropdownMenuLabel className="p-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={"https://github.com/shadcn.png"}
                          alt={user.fullname || user.username}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.fullname || "Dummy User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          @{user.username || "dummyuser"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex gap-2 items-center">
                        <span className="text-gray-500">Email:</span>
                        <span className="text-gray-900 truncate ">{user.email}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-gray-500">Role:</span>
                        <span className="text-gray-900 capitalize">{user.role || "creator"}</span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>


                <DropdownMenuSeparator />

                {/* Delete Account Button */}
                <DropdownMenuItem 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50 flex items-center gap-2 px-4 py-2"
                >
                  <Trash2 size={16} />
                  <span>Delete Account</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout Button */}
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer  text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50 flex items-center gap-2 px-4 py-2"
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Login/Signup buttons for unauthenticated users
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm">
                <Link to={URL.LOGIN}>Login</Link>
              </Button>
              <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                <Link to={URL.SIGNUP}>Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200 p-4">
            {user ? (
              <div className="space-y-4">
                {/* User Info Mobile */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={"https://github.com/shadcn.png"}
                      alt={user.fullname || user.username}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.fullname || "Dummy User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      @{user.username || "dummyuser"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Mobile Menu Items */}
                <Button
                  className="w-full justify-center bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus size={18} className="mr-2" />
                  Create Post
                </Button>

                {/* Delete Account Mobile */}
                <Button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={18} className="mr-2" />
                  Delete Account
                </Button>

                <div className="pt-2 border-t border-gray-200">
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Button asChild variant="ghost" className="w-full justify-center">
                  <Link to={URL.LOGIN} onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild className="w-full justify-center bg-green-600 hover:bg-green-700">
                  <Link to={URL.SIGNUP} onClick={() => setIsMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account 
              and remove all your data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 cursor-pointer hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Navbar;