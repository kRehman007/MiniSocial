import type { Post } from "@/lib/interface";
import { create } from "zustand";

interface PostStore {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: string, updatedPost: Partial<Post>) => void;
  deletePost: (postId: string) => void;
  toggleLikePost: (postId: string, userId: string) => void;
}

export const usePostStore = create<PostStore>((set) => ({
  posts: [],

  setPosts: (posts) => set({ posts }),

  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),

  updatePost: (postId, updatedPost) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.$id === postId ? { ...p, ...updatedPost } : p
      ),
    })),

  

  deletePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.$id !== postId),
    })),

  toggleLikePost: (postId, userId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.$id === postId
          ? {
              ...p,
              likes: p.likes.includes(userId)
                ? p.likes.filter((id) => id !== userId)
                : [...p.likes, userId],
            }
          : p
      ),
    })),
  

}));
