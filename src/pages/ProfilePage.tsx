import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash, Upload } from "lucide-react";
import { useAuthStore } from "@/zustand/useAuthStore";
import toast from "react-hot-toast";
import { ID, Permission, Role } from "appwrite";
import { storage, databases } from "@/appwrite/appwriteConfig";
import { conf } from "@/lib/conf";
import CustomLoader from "@/lib/loader";

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();

  const [fullname, setFullname] = useState(user?.fullname || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(user?.photoURL || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preview uploaded photo
  useEffect(() => {
    if (!photoFile) return;
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  // Upload profile photo separately
  const handleUploadPhoto = async () => {
    if (!photoFile) {
      toast.error("Please select a photo first.");
      return;
    }

    if (!user?.$id) {
      toast.error("User not found.");
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const fileId = ID.unique();

      // Upload new photo
      const response = await storage.createFile(
        conf.appwrite.bucketId as string,
        fileId,
        photoFile,
        [Permission.read(Role.any())] // public read
      );

      const newPhotoURL = storage.getFileView(conf.appwrite.bucketId, response.$id);

      // Delete previous photo from storage if exists
      if (user?.photoFileId) {
        try {
          await storage.deleteFile(conf.appwrite.bucketId as string, user?.photoFileId);
        } catch (err) {
          console.warn("Failed to delete previous photo:", err);
        }
      }

      // Update user document with new photoURL and fileId
      await databases.updateDocument(
        conf.appwrite.databaseId as string,
        conf.appwrite.usersCollectionId as string,
        user.$id,
        { photoURL: newPhotoURL, photoFileId: response.$id }
      );

      setPhotoPreview(newPhotoURL);
      setUser({ ...user, photoURL: newPhotoURL, photoFileId: response.$id });
      toast.success("Photo uploaded successfully!");
    } catch (err: any) {
      console.error("Photo upload error:", err);
      toast.error(err.message || err ||  "Failed to upload photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Save other profile fields
  const handleSaveProfile = async () => {
    if (!fullname.trim() || !username.trim()) {
      toast.error("Fullname and username are required.");
      return;
    }

    if (!user?.$id) {
      toast.error("User not found.");
      return;
    }

    try {
      setIsLoading(true);
      const updatedData = {
        fullname,
        username,
        bio,
      };

      await databases.updateDocument(
        conf.appwrite.databaseId as string,
        conf.appwrite.usersCollectionId as string,
        user.$id,
        updatedData
      );

      setUser({ ...user, ...updatedData });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error("Profile update error:", err);
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeletePhoto = async () => {
    if (!user?.$id || !user?.photoFileId) {
      toast.error("No photo to delete.");
      return;
    }
     try {
         setIsDeletingPhoto(true);
          await storage.deleteFile(conf.appwrite.bucketId as string, user?.photoFileId);
          await databases.updateDocument(
            conf.appwrite.databaseId as string,
            conf.appwrite.usersCollectionId as string,
            user.$id,
            { photoURL: "", photoFileId: "" }
          );
          setPhotoPreview("");
          setUser({ ...user, photoURL: "", photoFileId: "" });
          toast.success("Photo deleted successfully!");
        } catch (err) {
          console.warn("Failed to delete previous photo:", err);
        }
        finally{
          setIsDeletingPhoto(false);
        }
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-green-800">Edit Profile</h2>

      {/* Profile Photo */}
      <div className="flex flex-col justify-center items-center mb-6 relative">
        <Avatar
          className="w-20 h-20 md:h-28 md:w-28 cursor-pointer border-1 border-gray-200 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          {photoPreview ? (
            <AvatarImage src={photoPreview || "https://github.com/shadcn.png"} />
          ) : (
            <AvatarFallback className="flex justify-center items-center bg-gray-100 text-gray-400">
              <Upload />
            </AvatarFallback>
          )}
        </Avatar>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) setPhotoFile(e.target.files[0]);
          }}
        />
        <div className="flex mt-3  gap-2 items-center">
          <Button
          size="sm"
          variant="outline"
          className={`text-xs md:text-sm cursor-pointer min-w-28 ${isUploadingPhoto ? "bg-gray-300" : ""}`}
          disabled={isUploadingPhoto}
          onClick={handleUploadPhoto}
        >
          {isUploadingPhoto ? <CustomLoader /> : "Click to Upload Photo"}
        </Button>
        {
          user?.photoURL && (
            <Button size="sm" variant="ghost"
                    className="text-red-600 cursor-pointer hover:text-red-600"
                    onClick={handleDeletePhoto}>
                     {
                      isDeletingPhoto ? <CustomLoader /> : 
                       <Trash size={16} />
                     }
                    </Button>
          )
        }
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
          <Input
            placeholder="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Username</label>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
          <Input
            value={user?.email || ""}
            disabled
            className="bg-gray-100 border-gray-300 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Bio</label>
          <Textarea
            placeholder="Tell something about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="resize-none border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button
          className="bg-green-600 cursor-pointer min-w-28 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          disabled={isLoading}
          onClick={handleSaveProfile}
        >
          {isLoading ? <CustomLoader /> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
