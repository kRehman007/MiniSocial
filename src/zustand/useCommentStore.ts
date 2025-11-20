import { create } from "zustand";

interface CommentType {
  $id: string;
  postId: string;
  parentCommentId: string | null;
  userId: string;
  text: string;
  likes: string[];
  replies?: CommentType[];
}

interface CommentStore {
  comments: Record<string, CommentType[]>; // postId => comments[]

  setComments: (postId: string, comments: CommentType[]) => void;

  addComment: (postId: string, comment: CommentType) => void;

  addReply: (postId: string, parentId: string, reply: CommentType) => void;

  toggleLike: (postId: string, commentId: string, userId: string) => void;
}

export const useCommentStore = create<CommentStore>((set) => ({
  comments: {},

  setComments: (postId, comments) =>
    set((state) => ({
      comments: { ...state.comments, [postId]: comments },
    })),

  addComment: (postId, comment) =>
    set((state) => ({
      comments: {
        ...state.comments,
        [postId]: [comment, ...(state.comments[postId] || [])],
      },
    })),

  addReply: (postId, parentId, reply) =>
    set((state) => ({
      comments: {
        ...state.comments,
        [postId]: state.comments[postId].map((c) =>
          c.$id === parentId
            ? { ...c, replies: [...(c.replies || []), reply] }
            : c
        ),
      },
    })),

  toggleLike: (postId, commentId, userId) =>
    set((state) => ({
      comments: {
        ...state.comments,
        [postId]: state.comments[postId].map((c) => {
          if (c.$id === commentId) {
            const already = c.likes.includes(userId);
            return {
              ...c,
              likes: already
                ? c.likes.filter((l) => l !== userId)
                : [...c.likes, userId],
            };
          }

          // check replies
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.$id === commentId
                  ? {
                      ...r,
                      likes: r.likes.includes(userId)
                        ? r.likes.filter((l) => l !== userId)
                        : [...r.likes, userId],
                    }
                  : r
              ),
            };
          }

          return c;
        }),
      },
    })),
}));
