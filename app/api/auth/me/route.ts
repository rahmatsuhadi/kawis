// app/api/users/me/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";
import bcrypt from "bcryptjs";
import { deleteImage, SUPABASE_BUCKET_NAME, uploadImage } from "@/lib/image-service";

const PROFILE_FOLDER_NAME_API = "profile"


const prisma = new PrismaClient();

export async function GET({}: Request) {
  try {
    // 1. Verifikasi Sesi User
    const session = await getServerSession(authOptions);
    // Hanya user yang login yang bisa mengakses profilnya sendiri
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized. Please log in to view your profile." }, { status: 401 });
    }

    const userId = session.user.id; // Ambil ID user dari sesi

    // 2. Cari User di Database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { // Pilih field yang ingin dikembalikan ke frontend
        id: true,
        username: true,
        name: true,
        email: true,
        image: true, // URL gambar profil
        role: true,
        createdAt: true,
        updatedAt: true,
        // Jangan sertakan password atau hashed_password
      },
    });

    // 3. Tangani Jika User Tidak Ditemukan (seharusnya tidak terjadi jika sudah login)
    if (!user) {
      // Ini bisa terjadi jika data sesi sudah tidak sinkron dengan DB, atau user dihapus
      return NextResponse.json({ message: "User profile not found." }, { status: 404 });
    }

    // 4. Kirim Respons Sukses
    return NextResponse.json(user);

  } catch (error) {
    console.error("Error fetching user profile:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: "Failed to fetch user profile", error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Failed to fetch user profile" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized or Forbidden1." }, { status: 401 });
    }

    const userIdToUpdate = session.user.id

    const formData = await req.formData();
    const fullName = formData.get("fullName") as string | null;
    const username = formData.get("username") as string | null;
    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;
    const profileImageFile = formData.get("profileImage") as File | null;
    const oldImageUrlFromFrontend = formData.get("oldImageUrl") as string | null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: { [key: string]: any } = {};
    const currentUser = await prisma.user.findUnique({ where: { id: userIdToUpdate } });
    if (!currentUser) { return NextResponse.json({ message: "User tidak ditemukan." }, { status: 404 }); }

    // (Logika update data teks seperti fullName, username, email, password tetap sama)
    if (fullName !== null && fullName.trim() !== '' && fullName.trim() !== currentUser.name) { updateData.fullName = fullName.trim(); }
    if (username !== null && username.trim() !== '' && username.trim() !== currentUser.username) {
        if (username.trim() !== currentUser.username) {
            const existingUsername = await prisma.user.findUnique({ where: { username: username.trim() } });
            if (existingUsername) { return NextResponse.json({ message: "Username sudah digunakan." }, { status: 409 }); }
        }
        updateData.username = username.trim();
    }
    if (email !== null && email.trim() !== '' && email.trim() !== currentUser.email) {
        if (email.trim() !== currentUser.email) {
            const existingEmail = await prisma.user.findUnique({ where: { email: email.trim() } });
            if (existingEmail) { return NextResponse.json({ message: "Email sudah digunakan." }, { status: 409 }); }
        }
        updateData.email = email.trim();
        updateData.emailVerified = null;
    }
    if (password !== null && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password.trim(), 10);
        updateData.password = hashedPassword;
    }

    // 4. Proses Upload/Hapus Gambar Profil (menggunakan image-service)
    let newProfileImageUrl: string | null = currentUser.image;

    if (profileImageFile && profileImageFile.size > 0) {
        // Validasi tipe & ukuran file
        if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(profileImageFile.type)) {
            return NextResponse.json({ message: "Gambar tidak support/diizinkan. Hanya JPEG, PNG, GIF, WebP yang diizinkan." }, { status: 400 });
        }
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (profileImageFile.size > MAX_FILE_SIZE) {
            return NextResponse.json({ message: `Gambar Terlalu Besar. File terlalu besar. Maksimum ukuran gambar adalah (max ${MAX_FILE_SIZE / (1024 * 1024)}MB).` }, { status: 400 });
        }

        // Hapus gambar lama dari Supabase jika ada
        if (currentUser.image) { // Hanya coba hapus jika memang ada gambar lama
            try {
                // Pastikan URL gambar lama berasal dari bucket dan folder yang kita kelola
                if (currentUser.image.includes(`/storage/v1/object/public/${SUPABASE_BUCKET_NAME}/${PROFILE_FOLDER_NAME_API}/`)) {
                    await deleteImage(currentUser.image); // Panggil fungsi delete dari service
                }
            } catch (deleteError) {
                console.error('[API] Failed to delete old profile image from Supabase:', deleteError);
            }
        }

        // Unggah gambar baru ke Supabase
        newProfileImageUrl = await uploadImage(profileImageFile, PROFILE_FOLDER_NAME_API); // <-- Panggil fungsi upload dari service dengan folder
        
    } else if (oldImageUrlFromFrontend === '' && currentUser.image) {
        // Kondisi jika user menghapus gambar profil secara eksplisit
        if (currentUser.image.includes(`/storage/v1/object/public/${SUPABASE_BUCKET_NAME}/${PROFILE_FOLDER_NAME_API}/`)) {
            try {
                await deleteImage(currentUser.image); // Panggil fungsi delete dari service
            } catch (deleteError) {
                console.error('[API] Failed to delete old profile image (explicit removal) from Supabase:', deleteError);
            }
        }
        newProfileImageUrl = null; // Set gambar menjadi null di DB
    }

    updateData.image = newProfileImageUrl;

    // 5. Update User di Database
    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: "Tidak ada perubahan yang diberikan." }, { status: 200 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userIdToUpdate },
      data: updateData,
      select: {
        id: true, username: true, name: true, email: true, image: true, role: true, createdAt: true, updatedAt: true,
      },
    });

    return NextResponse.json({ message: "Profile berhasil diperbarui!", user: updatedUser });

  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint failed")) {
          return NextResponse.json({ message: "usrname dan email sudah digunakan." }, { status: 409 });
      }
      return NextResponse.json({ message: `Gagal update profile: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: "Gagal update profile" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}