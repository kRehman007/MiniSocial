export const conf = {
  appwrite: {
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '',
    bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID || '',
    usersCollectionId: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || '',
    postCollectionId: import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID || '',
    commentsCollectionId: import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID || '',
  },
};