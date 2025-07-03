
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"; // Import Google Provider

import { PrismaAdapter } from "@auth/prisma-adapter"; // Import PrismaAdapter
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";


// Inisialisasi Prisma Client
const prisma = new PrismaClient();

// Opsi autentikasi NextAuth.js
export const authOptions: NextAuthOptions = {
  // 1. Adapter Database
  // Menggunakan PrismaAdapter untuk menyimpan data sesi, akun, dan user ke database Anda.
  // Ini penting untuk integrasi OAuth seperti Google.
  adapter: PrismaAdapter(prisma),

  // 2. Providers Autentikasi
  providers: [
    // Provider untuk Email/Password (Login Kredensial)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validasi input
        if (!credentials?.email || !credentials?.password) {
          return null; // Autentikasi gagal jika input kosong
        }

        // Cari user di database berdasarkan email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Verifikasi user dan password
        // Jika user tidak ditemukan ATAU password tidak cocok, kembalikan null
        if (!user || !(await bcrypt.compare(credentials.password, user.password || ''))) {
          return null; // Autentikasi gagal
        }

        // Jika autentikasi berhasil, kembalikan objek user.
        // Properti ini akan dimasukkan ke dalam JWT dan objek sesi.
        // Jangan sertakan password di sini untuk alasan keamanan!
        return {
          id: user.id,
          name: user.fullName, // Gunakan username sebagai 'name' di session
          email: user.email,
          role: user.role, // Penting: sertakan role user
          image: user.image,
        };
      },
    }),
    // Provider untuk Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Pastikan clientId dan clientSecret tersedia di .env.local
      // Jika kosong, NextAuth.js akan throw error.
    }),
  ],

  // 3. Konfigurasi Sesi
  // Gunakan strategi JWT untuk sesi. Ini mengirimkan JWT ke browser klien.
  // Meskipun ada adapter, JWT akan berisi ID sesi yang merujuk ke DB atau data user.
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // Sesi berlaku selama 30 hari
  },

  // 4. Callbacks (untuk memodifikasi JWT dan Objek Sesi)
  callbacks: {
    // Callback 'jwt' akan dijalankan saat JWT dibuat/diperbarui.
    // Ini adalah tempat terbaik untuk menambahkan data kustom ke token (misalnya, role, ID user).
    async jwt({ token, user, session, trigger }) {
      // 'user' objek hanya ada saat user pertama kali login atau saat JWT diperbarui
      if (trigger === "update") {
        // Note, that `session` can be any arbitrary object, remember to validate it!
        token.name = session.fullName
        token.image = session.image
      }
      if (user) {
        token.id = user.id;
        token.role = user.role || "USER"; // Tambahkan role dari user ke JWT
        token.name = user.fullName
        if (user.image) {
          token.image = user.image
        }
      }
      // Jika Anda ingin menyimpan info provider (e.g. access_token dari OAuth), bisa di sini:
      // if (account) {
      //   token.accessToken = account.access_token;
      // }
      return token;
    },
    // Callback 'session' akan dijalankan setiap kali sesi diminta oleh klien.
    // Ini memastikan objek 'session.user' di klien memiliki data kustom yang Anda inginkan.
    async session({ session, token, newSession, trigger }) {
      // console.log(session, "session", token)
      if (session.user) {
        // Casting token.id dan token.role ke string karena mereka bisa jadi 'any' tanpa type augmentation
        session.user.id = token.id
        session.user.role = token.role // Tambahkan role dari JWT ke objek sesi user
        session.user.name = token.name
        session.user.image = token.image
      }

      // if (trigger === "update" && newSession?.name) {
      //   // You can update the session in the database if it's not already updated.
      //   // await adapter.updateUser(session.user.id, { name: newSession.name })

      //   // Make sure the updated value is reflected on the client
      //   session.user.name = newSession.name
      // }
      return session;
    },
    async signIn({ account, user }) {
      if (account?.provider && user?.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email as string },
          include: { accounts: true }, // IMPORTANT: include accounts to check linking
        });

        if (existingUser) {
          const linkedAccount = existingUser.accounts.find(
            (acc) => acc.provider === account.provider && acc.providerAccountId === account.providerAccountId
          );

          if (!linkedAccount) {
            try {
              // This part is crucial for auto-linking when an existing user is found
              // and the OAuth account is NOT already linked to them.

              // 1. Delete any unlinked temporary accounts that NextAuth.js might have created.
              // This often happens if the user tried to sign in with this OAuth provider before
              // but the linking failed or was interrupted.
              await prisma.account.deleteMany({
                where: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  userId: { not: existingUser.id } // Make sure we don't delete an account that's already correctly linked
                }
              });

              // 2. Create the new account link.
              await prisma.account.create({
                data: {
                  userId: existingUser.id, // Link to the existing user's ID
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              });

              // 3. Optionally update the existing user's profile with info from OAuth.
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  username: String(user.email).split("@")[0],
                  fullName: user.name || existingUser.fullName, // Update name/fullName
                  image: user.image || existingUser.image, // Update image
                  emailVerified: existingUser.emailVerified || new Date(), // Set email as verified if not already
                },
              });

              console.log(`[NextAuth.js] Successfully linked existing user ${existingUser.email} to ${account.provider} account.`);
              return true; // Allow sign in
            } catch (e: any) {
              console.error("[NextAuth.js] Error during auto-linking process:", e);
              // If it's a unique constraint violation (e.g., account already exists for another user unexpectedly)
              // or other database errors, deny the sign-in.
              if (e.code === 'P2002' && e.meta?.target === 'Account_provider_providerAccountId_key') {
                console.error("[NextAuth.js] Duplicate account entry found during auto-linking.");
                return "/login?error=OAuthAccountAlreadyLinkedToAnotherUser"; // Specific error for this case
              }
              return false; // Deny sign in on general errors
            }
          }
        }
        else {
          const googleuser = await prisma.user.create({
            data: {
              email: user.email as string,
              username: String(user.email).split("@")[0],
              fullName: user.name, // Update name/fullName
              image: user.image,
              emailVerified: new Date(), // Set email as verified if not already
            },
          });

          // 2. Create the new account link.
          await prisma.account.create({
            data: {
              userId: googleuser.id, // Link to the existing user's ID
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state,
            },
          });

          return true

          // 3. Optionally update the existing user's profile with info from OAuth.

        }
      }
      // For new users, already linked users, or credentials login, proceed normally.
      return true;
    }
  },

  // 5. Halaman Kustom
  // Arahkan NextAuth.js ke halaman login kustom Anda.
  pages: {
    signIn: "/login",
    // error: '/auth/error', // Halaman error kustom (opsional)
  },

  // 6. Secret
  // Kunci rahasia untuk menandatangani dan mengenkripsi JWT.
  secret: process.env.NEXTAUTH_SECRET,
};
