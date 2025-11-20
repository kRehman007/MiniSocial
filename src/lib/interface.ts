export interface RouteLayout{
    link:string,
    element:React.ComponentType,
    isProtected:boolean,
}

export type UserRole = 'creator' | 'consumer';

export interface User {
  $id: string;
  email: string;
  username?: string;
  fullname?: string;
  role?: UserRole;
}

export interface Post {
    id:string;
  $id: string;
  userId: string;
  title: string;
  description: string;
  mediaURL: string;
  mediaType:string;
  mediaId: string;
  likes: string[];
  commentsCount: number;
  comments: Comment[];
}


export interface Comment {
  username?:string
  $id: string;
  postId: string;
  parentCommentId: string | null;
  userId: string;
  text: string;
  likes: string[];
  $createdAt: string;
  replies?: Comment[];
  userName?: string;
}