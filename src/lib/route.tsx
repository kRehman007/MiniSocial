import ProfilePage from "@/pages/ProfilePage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import type { RouteLayout } from "./interface";
import { URL } from "./URL";

export const AllRoutes:RouteLayout[]=[
    {
    link:URL.LOGIN,
    element:LoginPage,
    isProtected:false
    },
    {
    link:URL.SIGNUP,
    element:SignupPage,
    isProtected:false
    },
    {
    link:URL.HOME,
    element:HomePage,
    isProtected:true
    },
    {
    link:URL.PROFILE,
    element:ProfilePage,
    isProtected:true
    },
]