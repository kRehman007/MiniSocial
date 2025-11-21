import { account, databases, ID } from "@/appwrite/appwriteConfig";
import { conf } from "@/lib/conf";
import type { User, UserRole } from "@/lib/interface";

export const authService = {
  async signUp(
  email: string,
  password: string,
  fullname: string,
  username: string,
  role: UserRole
): Promise<User> {
  try {
    // 1. Create user
    const user = await account.create(
      ID.unique(),
      email,
      password,
      fullname
    );

    // 2. Immediately create session (VERY IMPORTANT)
    await account.createEmailPasswordSession(email, password);

    // 3. Create user document
    await databases.createDocument(
      conf.appwrite.databaseId,
      conf.appwrite.usersCollectionId,
      user.$id,
      {
        email,
        fullname,
        username,
        role,
      }
    );

    return {
      $id: user.$id,
      email,
      fullname,
      username,
      role,
    };
  } catch (error) {
    console.log("Signup Error:", error);
    throw error;
  }
},

  async signIn(email: string, password: string) {
    try {
      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      throw error;
    }
  },

  async signOut() {
    try {
       if(account){
        account.deleteSession("current")
      }
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Signout error:", error);
      throw error;
    }
  },
};
