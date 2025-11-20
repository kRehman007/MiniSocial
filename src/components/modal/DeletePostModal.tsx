import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PostService } from "@/appwrite/post-service";
import { usePostStore } from "@/zustand/usePostStore";
import type { Post } from "@/lib/interface";
import { useState } from "react";
import CustomLoader from "@/lib/loader";
import { AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface DeletePostModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  post: Post;
}

const DeletePostModal: React.FC<DeletePostModalProps> = ({
  isOpen,
  setIsOpen,
  post,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deletePost: removePost } = usePostStore();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await PostService.deletePost(post.$id || post.id, post.mediaId);
      removePost(post.$id);
      toast.success("Post deleted successfully!");

      setIsOpen(false);
    } catch (error: any) {
      toast.error(error?.message || error || "Failed to delete post.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md w-full rounded-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold text-red-600 flex justify-center items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            Delete Post
          </DialogTitle>

          <DialogDescription className="text-gray-600 mt-2 text-sm">
            This action is irreversible. Once deleted, this post cannot be recovered.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mt-3">
          Are you sure you want to permanently delete this post?
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <Button
            variant="outline"
            disabled={isDeleting}
            className="w-full sm:w-28"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
            className="w-full sm:w-28 "
          >
            {isDeleting ? <CustomLoader /> : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePostModal;
