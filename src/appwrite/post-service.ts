// post-service.ts
import { databases, ID, storage } from "@/appwrite/appwriteConfig";
import { conf } from "@/lib/conf";
import { Query, Permission, Role } from "appwrite";

const DATABASE_ID = conf.appwrite.databaseId as string;
const POSTS_COLLECTION_ID = conf.appwrite.postCollectionId as string;
const COMMENTS_COLLECTION_ID = conf.appwrite.commentsCollectionId as string;
const BUCKET_ID = conf.appwrite.bucketId as string;

export const PostService = {
  // ------------------- ADD POST -------------------
  async addPost(data: { userId: string; title: string; description: string; mediaFile: File,mediaType:string
   }) {
    if (!data.title || !data.description || !data.mediaFile) {
      throw new Error("All fields (title, description, mediaFile) are required.");
    }

    // Upload media to Appwrite bucket
    const file = await storage.createFile(
      BUCKET_ID,
      ID.unique(),
      data.mediaFile,
      [Permission.read(Role.any())], // public read
    );

    const mediaURL = storage.getFileView(BUCKET_ID, file.$id);

    const newPost = {
      userId: data.userId,
      title: data.title,
      description: data.description,
      mediaURL,
      mediaType:data.mediaType,
      mediaId: file.$id,
      likes: [] as string[],
      commentsCount: 0,
    };

    const doc = await databases.createDocument(
      DATABASE_ID,
      POSTS_COLLECTION_ID,
      ID.unique(),
      newPost
    );

    return { $id: doc.$id, ...newPost };
  },

  // ------------------- FETCH POSTS -------------------
  async fetchAllPosts() {
    const res = await databases.listDocuments(DATABASE_ID, POSTS_COLLECTION_ID, [
      Query.orderDesc("$createdAt"),
    ]);
    return res.documents.map((doc) => ({ id: doc.$id, ...doc }));
  },

  async fetchUserPosts(userId: string) {
    const res = await databases.listDocuments(DATABASE_ID, POSTS_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
    ]);
    return res.documents.map((doc) => ({ id: doc.$id, ...doc }));
  },

  // ------------------- TOGGLE LIKE -------------------
  async toggleLikeToPost(postId: string, userId: string) {
    const post = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId);
    const likes = (post.likes as string[]) || [];
    const updatedLikes = likes.includes(userId) ? likes.filter((id) => id !== userId) : [...likes, userId];

    const updated = await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId, {
      likes: updatedLikes,
    });

    return { id: updated.$id, ...updated };
  },

  // ------------------- COMMENTS & REPLIES -------------------
  async addCommentToPost(postId: string, username:string, comment: { userId: string; text: string }) {
    if (!comment.text) throw new Error("Comment text is required");

    const newComment = {
      userName:username,
      postId,
      parentCommentId: null,
      userId: comment.userId,
      text: comment.text,
      likes: [] as string[],
    };

    const doc = await databases.createDocument(DATABASE_ID, COMMENTS_COLLECTION_ID, ID.unique(), newComment);

    // Increment post commentsCount
    const post = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId);
    const commentsCount = (post.commentsCount as number) || 0;
    await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId, { commentsCount: commentsCount + 1 });

    return { id: doc.$id, ...newComment };
  },

  async addReplyToComment(postId: string, username:string, parentCommentId: string, reply: { userId: string; text: string }) {
    if (!reply.text) throw new Error("Reply text is required");

    const newReply = {
      userName:username,
      postId,
      parentCommentId,
      userId: reply.userId,
      text: reply.text,
      likes: [] as string[],
    };

    const doc = await databases.createDocument(DATABASE_ID, COMMENTS_COLLECTION_ID, ID.unique(), newReply);

    // Increment post commentsCount
    // const post = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId);
    // const commentsCount = (post.commentsCount as number) || 0;
    // await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId, { commentsCount: commentsCount + 1 });
    return { id: doc.$id, ...newReply };
  },

  async toggleLikeToComment(commentId: string, userId: string) {
    const comment = await databases.getDocument(DATABASE_ID, COMMENTS_COLLECTION_ID, commentId);
    const likes = (comment.likes as string[]) || [];
    const updatedLikes = likes.includes(userId) ? likes.filter((id) => id !== userId) : [...likes, userId];

    const updated = await databases.updateDocument(DATABASE_ID, COMMENTS_COLLECTION_ID, commentId, { likes: updatedLikes });
    return { id: updated.$id, ...updated };
  },

  async toggleLikeToReply(replyId: string, userId: string) {
    return this.toggleLikeToComment(replyId, userId);
  },

  // ------------------- FETCH COMMENTS -------------------
  async fetchCommentsForPost(postId: string) {
    const res = await databases.listDocuments(DATABASE_ID, COMMENTS_COLLECTION_ID, [
      Query.equal("postId", postId),
      Query.orderAsc("$createdAt"),
    ]);

    const comments = res.documents as any[];
    const mainComments = comments.filter((c) => !c.parentCommentId);
    const replies = comments.filter((c) => !!c.parentCommentId);

    // Nest replies
    const nested = mainComments.map((c) => ({
      ...c,
      replies: replies.filter((r) => r.parentCommentId === c.$id),
    }));

    return nested;
  },

  // ------------------- DELETE POST -------------------
  async deletePost(postId: string, mediaId: string) {
    if (mediaId) {
      await storage.deleteFile(BUCKET_ID, mediaId);
    }
    await databases.deleteDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId);

    // Delete related comments
    const comments = await databases.listDocuments(DATABASE_ID, COMMENTS_COLLECTION_ID, [
      Query.equal("postId", postId),
    ]);
    for (const c of comments.documents) {
      await databases.deleteDocument(DATABASE_ID, COMMENTS_COLLECTION_ID, c.$id);
    }

    return true;
  },

  // ------------------- UPDATE POST -------------------
  async updatePost(
    postId: string,
    updateData: { title?: string; description?: string },
    mediaFile?: File
  ) {
    const post = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId);

    let mediaURL = post.mediaURL;
    let mediaId = post.mediaId;

    if (mediaFile) {
      // Delete old media
      if (mediaId) await storage.deleteFile(BUCKET_ID, mediaId);

      const file = await storage.createFile(BUCKET_ID, ID.unique(), mediaFile, [Permission.read(Role.any())]);
      mediaURL = storage.getFilePreview(BUCKET_ID, file.$id);
      mediaId = file.$id;
    }

    const updated = await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId, {
      title: updateData.title || post.title,
      description: updateData.description || post.description,
      mediaURL,
      mediaId,
    });

    return { id: updated.$id, ...updated };
  },
};
