import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Jika session tidak ada, redirect ke halaman login
  if (!session) {
    redirect("/login");
    return; // Pastikan tidak ada kode lainnya yang dijalankan setelah redirect
  }

  // Jika session ada, redirect ke halaman utama
  redirect("/main");

  // Kode ini tidak akan dijalankan karena redirect sudah memutus eksekusi
  return <></>;
}