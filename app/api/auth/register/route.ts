// app/api/register/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const usernameRegex = /^[a-zA-Z0-9._]+$/;
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { fullName, email, password, username } = await req.json(); // Ambil fullName juga

    if (!fullName || !email || !password || !username) { // Validasi fullName
      return NextResponse.json(
        { message: "Semua kolom harus diisi" },
        { status: 400 }
      );
    }
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { message: "Username hanya boleh mengandung huruf, angka, titik (.) dan underscore (_), tanpa spasi." },
        { status: 400 }
      );
    }
    // Periksa apakah email sudah terdaftar
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { message: "Email sudah terdaftar. Gunakan email lain atau login." },
        { status: 409 }
      );
    }

    // Periksa apakah username sudah dipakai
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        { message: "Username sudah digunakan. Coba yang lain." },
        { status: 409 }
      );
    }



    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru dengan fullName
    const newUser = await prisma.user.create({
      data: {
        fullName, // Simpan fullName
        email,
        username,
        password: hashedPassword,
        // role akan default ke USER sesuai schema.prisma
        // username bisa dikosongkan atau diisi dengan fullName jika diperlukan
      },
    });

    // Jangan kirim password kembali!
    const { password: _, ...userWithoutPassword } = newUser;  // eslint-disable-line @typescript-eslint/no-unused-vars

    return NextResponse.json(
      { message: "Registrasi berhasil!", user: userWithoutPassword },
      { status: 201 } // Created
    );
  } catch (error) {
    console.error("Registrasi gagal:", error);
    return NextResponse.json(
      { message: "Registrasi gagal, terjadi kesalahan server." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}