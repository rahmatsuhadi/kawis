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

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsSubmitting(false);

    if (result?.error) {
      // Menggunakan Sonner.toast.error untuk menampilkan pesan error
      toast.error("Login Gagal", {
        description: "Email atau password yang Anda masukkan salah. Silakan coba lagi.",
      });
      console.error("Login Error:", result.error);
    } else {
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
          <Link href="/register" className="text-gray-600 hover:text-gray-800 text-sm">
            Daftar Sekarang?
          </Link>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full h-10 lg:h-12 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm lg:text-base"
          >
            <svg className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Login with Google
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 lg:h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm lg:text-base"
          >
            {isSubmitting ? "Memproses..." : "Masuk"}
          </Button>
        </div>
      </form>
    </div>
  );
}