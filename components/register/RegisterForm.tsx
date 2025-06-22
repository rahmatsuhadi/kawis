// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner"; // Import toast dari sonner

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterForm() {
  const [fullName, setFullName] = useState(""); // State untuk Full Name
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, password, username }), // Kirim fullName juga
      });

      const data = await response.json();

      if (!response.ok) {
        // Jika respons bukan OK (misal: 400, 409, 500)
        toast.error("Registrasi Gagal", {
          description: data.message || "Terjadi kesalahan saat registrasi. Silakan coba lagi.",
        });
        return;
      }

      // Registrasi berhasil
      toast.success("Registrasi Berhasil!", {
        description: "Akun Anda telah dibuat. Silakan login.",
      });
      router.push("/login"); // Redirect ke halaman login
    } catch (err) {
      console.error("Registrasi Error:", err);
      toast.error("Terjadi Kesalahan Jaringan", {
        description: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      });
    } finally {
      setIsSubmitting(false); // Selesai loading
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl lg:text-3xl font-bold text-center mb-6 lg:mb-8 text-gray-900">REGISTER PAGE</h2>

      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        <div>
          <Label htmlFor="fullName" className="sr-only">
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full h-10 lg:h-12 px-4 border border-gray-300 rounded-md bg-white"
          />
        </div>
        <div>
          <Label htmlFor="username" className="sr-only">
            Username
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full h-10 lg:h-12 px-4 border border-gray-300 rounded-md bg-white"
          />
        </div>

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
          <Link href="/login" className="text-gray-600 hover:text-gray-800 text-sm">
            Sudah punya akun? Login di sini
          </Link>
        </div>

        <div className="space-y-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 lg:h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm lg:text-base"
          >
            {isSubmitting ? "Mendaftar..." : "Daftar"}
          </Button>
        </div>
      </form>
    </div>
  );
}