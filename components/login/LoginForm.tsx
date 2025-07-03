"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner"; // Import toast dari sonner

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Tidak perlu lagi state 'error' untuk menampilkan pesan di UI, Sonner yang akan menanganinya
  // const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError(null); // Tidak perlu reset state error lagi
    setIsSubmitting(true);

    const loginToastId = toast.loading("Memproses login...");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsSubmitting(false);

    if (result?.error) {
      toast.dismiss(loginToastId);
      // Menggunakan Sonner.toast.error untuk menampilkan pesan error
      toast.error("Login Gagal", {
        description: "Email atau password yang Anda masukkan salah. Silakan coba lagi.",
      });
    } else {
      toast.dismiss(loginToastId);
      // Menggunakan Sonner.toast.success untuk notifikasi sukses
      toast.success("Login Berhasil!", {
        description: "Anda akan diarahkan ke halaman utama.",
      });
      router.push("/");
    }
  };

  const handleGoogleSignIn = () => {
    // Menggunakan Sonner.toast.loading saat proses sign-in dimulai
    const googleLoginToastId = toast.loading("Mengarahkan ke Google untuk login...");
    signIn("google", { callbackUrl: "/" }).then(() => {
      // Ini mungkin tidak langsung terpanggil karena redirect
      // Namun, jika ada error di sisi klien sebelum redirect, bisa ditangani di sini
      toast.dismiss(googleLoginToastId); // Dismiss loading toast jika berhasil redirect
    }).catch(error => {
      toast.dismiss(googleLoginToastId);
      toast.error("Login Google Gagal", {
        description: "Terjadi kesalahan saat mencoba login dengan Google. Silakan coba lagi.",
      });
      console.error("Google Sign-In Error:", error);
    });
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl lg:text-3xl font-bold text-center mb-6 lg:mb-8 text-gray-900">LOGIN PAGE</h2>

      <form onSubmit={handleCredentialsSubmit} className="space-y-4 lg:space-y-6">
        {/* Hapus bagian ini karena Sonner akan menangani tampilan error */}
        {/* {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )} */}

        <div>
          <Label htmlFor="email" className="sr-only">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full h-10 lg:h-12 px-4 border border-gray-300 rounded-md bg-white"
          />
        </div>

        <div>
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full h-10 lg:h-12 px-4 border border-gray-300 rounded-md bg-white"
          />
        </div>

        <div className="text-right">
          <Link href="/register" className="text-gray-800 font-semibold hover:text-gray-800 text-sm">
            Daftar Sekarang?
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-20">
          <Button
            type="button"
            variant="ghost"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="h-10 lg:h-12 text-gray-800 text-sm lg:text-base hover:cursor-pointer"
          >
            <svg width="50" height="50" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M27.2569 12.5519H26.25V12.5H15V17.5H22.0644C21.0338 20.4106 18.2644 22.5 15 22.5C10.8581 22.5 7.5 19.1419 7.5 15C7.5 10.8581 10.8581 7.5 15 7.5C16.9119 7.5 18.6513 8.22125 19.9756 9.39937L23.5112 5.86375C21.2787 3.78312 18.2925 2.5 15 2.5C8.09688 2.5 2.5 8.09688 2.5 15C2.5 21.9031 8.09688 27.5 15 27.5C21.9031 27.5 27.5 21.9031 27.5 15C27.5 14.1619 27.4137 13.3438 27.2569 12.5519Z" fill="#FFC107" />
              <path d="M3.94141 9.18188L8.04828 12.1938C9.15953 9.4425 11.8508 7.5 15.0002 7.5C16.912 7.5 18.6514 8.22125 19.9758 9.39937L23.5114 5.86375C21.2789 3.78312 18.2927 2.5 15.0002 2.5C10.1989 2.5 6.03516 5.21062 3.94141 9.18188Z" fill="#FF3D00" />
              <path d="M15.0002 27.4999C18.2289 27.4999 21.1627 26.2643 23.3808 24.2549L19.5121 20.9812C18.2151 21.9681 16.6299 22.5017 15.0002 22.4999C11.7489 22.4999 8.98832 20.4268 7.94832 17.5337L3.87207 20.6743C5.94082 24.7224 10.1421 27.4999 15.0002 27.4999Z" fill="#4CAF50" />
              <path d="M27.2569 12.5519H26.25V12.5H15V17.5H22.0644C21.5714 18.8853 20.6833 20.0957 19.51 20.9819L19.5119 20.9806L23.3806 24.2544C23.1069 24.5031 27.5 21.25 27.5 15C27.5 14.1619 27.4137 13.3438 27.2569 12.5519Z" fill="#1976D2" />
            </svg>

            Login with Google
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 lg:h-12 bg-primary rounded-4xl  hover:bg-orange-600 text-white font-medium text-sm lg:text-base"
          >
            {isSubmitting ? "Memproses..." : "Masuk"}
          </Button>
        </div>
      </form>
    </div>
  );
}