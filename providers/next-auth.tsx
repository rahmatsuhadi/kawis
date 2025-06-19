// app/providers.tsx
"use client"; // Ini adalah Client Component

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { Session } from "next-auth"; // Import tipe Session

// Definisikan props untuk komponen Providers Anda
interface ProvidersProps {
  children: React.ReactNode;
  session: Session | null; // Menerima objek sesi
}

export function SessionProvider({ children, session }: ProvidersProps) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}