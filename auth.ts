
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"; // Import Google Provider

import { PrismaAdapter } from "@auth/prisma-adapter"; // Import PrismaAdapter
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";


// Inisialisasi Prisma Client
const prisma = new PrismaClient();

// Opsi autentikasi NextAuth.js
export const authOptions:NextAuthOptions = {
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
    async jwt({ token, user, account }) {
      // 'user' objek hanya ada saat user pertama kali login atau saat JWT diperbarui
      if (user) {
        token.id = user.id;
        token.role = user.role; // Tambahkan role dari user ke JWT
      }
      // Jika Anda ingin menyimpan info provider (e.g. access_token dari OAuth), bisa di sini:
      // if (account) {
      //   token.accessToken = account.access_token;
      // }
      return token;
    },
    // Callback 'session' akan dijalankan setiap kali sesi diminta oleh klien.
    // Ini memastikan objek 'session.user' di klien memiliki data kustom yang Anda inginkan.
    async session({ session, token }) {
      if (session.user) {
        // Casting token.id dan token.role ke string karena mereka bisa jadi 'any' tanpa type augmentation
        session.user.id = token.id
        session.user.role = token.role // Tambahkan role dari JWT ke objek sesi user
        session.user.name = token.name
      }
      return session;
    },
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
