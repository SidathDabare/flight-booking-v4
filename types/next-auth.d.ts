import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: string;
    isApproved: boolean;
    profileImage?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      isApproved: boolean;
      profileImage?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    isApproved: boolean;
    profileImage?: string | null;
  }
}