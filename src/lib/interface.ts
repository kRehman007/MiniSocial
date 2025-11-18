export interface RouteLayout{
    link:string,
    element:React.ComponentType,
    isProtected:boolean,
}

export type UserRole = 'creator' | 'consumer';
export interface User {
  uid: string;
  email: string;
  username?: string;
  fullname?: string;
  role?: UserRole;
}