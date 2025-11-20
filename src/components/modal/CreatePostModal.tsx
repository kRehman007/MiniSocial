import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { PostService } from "@/appwrite/post-service";
import { useAuthStore } from "@/zustand/useAuthStore";
import CustomLoader from "@/lib/loader";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { usePostStore } from "@/zustand/usePostStore";

interface CreatePostModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, setIsOpen }) => {
  const {addPost}=usePostStore()
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generate preview whenever mediaFile changes
  useEffect(() => {
    if (!mediaFile) {
      setMediaPreview("");
      return;
    }

    const fileURL = URL.createObjectURL(mediaFile);
    setMediaPreview(fileURL);

    return () => {
      URL.revokeObjectURL(fileURL);
    };
  }, [mediaFile]);

  const handlePost = async () => {
    if (!mediaFile) {
      toast.error("Please upload media.");
      return;
    }
   const mediaType = mediaFile.type.startsWith("image/") ? "image" : "video";
    try {
      setIsLoading(true);
      const data = {
        title,
        description,
        userId: user?.$id!,
        mediaFile,
        mediaType
      };
       
      const result=await PostService.addPost(data);
      console.log("res",result)
      addPost(result as any)
      toast.success("Post created successfully!");
      setTitle("");
      setDescription("");
      setMediaFile(null);
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error creating post:", error);
      if (error?.code === "auth/id-token-expired" || error?.code === "auth/user-token-expired") {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else if (error?.code === "permission-denied") {
        toast.error("You don't have permission to create a post.");
      } else if (error?.message?.includes("Network") || error?.code === "unavailable") {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(error.message || "Failed to create post. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        toast.error("Only images or videos are allowed.");
        return;
      }
      setMediaFile(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl w-full rounded-xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh] px-4 py-3">
          <DialogHeader>
            <DialogTitle className="text-center text-green-700">Create Post</DialogTitle>
          </DialogHeader>
          <hr className="my-4"/>

          <div className="flex gap-3 items-center mt-2">
            <Avatar className="h-14 w-14">
              <AvatarImage src={"https://github.com/shadcn.png"} loading="lazy" />
              <AvatarFallback>{user?.fullname?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.fullname}</p>
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Public</span>
              </div>
            </div>
          </div>

          {/* Media Upload Box */}
          <div
            className="mt-4 flex justify-center items-center border-2 border-dashed border-gray-300 rounded-md min-h-40 max-h-72 cursor-pointer hover:border-blue-500 transition w-full sm:w-auto overflow-hidden"
            onClick={handleFileClick}
          >
            {mediaPreview ? (
              mediaFile?.type.startsWith("image/") ? (
                <img src={mediaPreview} alt="preview" className="object-cover h-full w-full" />
              ) : (
                <video src={mediaPreview} autoPlay controls className="object-cover h-full w-full" />
              )
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Upload size={28} />
                <span className="mt-2 text-sm text-center">Click to upload media (image/video)</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,video/*"
            />
          </div>

          {/* Title Input */}
          <Input
            placeholder="Title"
            className="mt-3 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Description Input */}
          <Textarea
            placeholder="Add description here..."
            className="mt-2 w-full min-h-[100px] max-h-[150px] resize-none overflow-y-auto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex flex-col flex-row md:justify-end gap-2 mt-3">
            <Button
              disabled={!title.trim() || !mediaFile || isLoading}
              className="w-full md:w-28 bg-green-600 hover:bg-green-700 cursor-pointer"
              onClick={handlePost}
            >
              {isLoading ? <CustomLoader /> : "Create"}
            </Button>
             <Button
             variant={"outline"}
              disabled={isLoading}
              className="w-full md:w-28 cursor-pointer"
              onClick={()=>setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
