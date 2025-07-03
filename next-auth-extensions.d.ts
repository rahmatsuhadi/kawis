// // next-auth.d.ts (atau next-auth-extensions.d.ts)
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

// Pastikan untuk mengimpor AdapterUser dari kedua lokasi
// Ini untuk mengatasi potensi perbedaan resolusi modul atau caching
// import { AdapterUser as CoreAdapterUser } from "@auth/core/adapters";
// import { AdapterUser as NextAuthAdapterUser } from "next-auth/adapters"; // Ini juga penting!

declare module "next-auth" {
  /**
   * Perluas objek Session
//    */
  interface Session {
    user: {
      id: string;
      role?: string;
      fullName?: string;
      image?:string
    } & DefaultSession["user"];
  }

  /**
   * Perluas objek User yang diterima dari `authorize` callback atau adapter
   */
  interface User extends DefaultUser {
    id: string;
    role?: string;
    fullName?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Perluas objek JWT
   */
  interface JWT extends NextAuthJWT {
    id: string;
    role?: string;
    fullName?: string;
    image?: string
  }
}
