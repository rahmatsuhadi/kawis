
import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/providers/react-query";
import { Toaster } from "@/components/ui/sonner"
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { SessionProvider } from "@/providers/next-auth";
import Head from "next/head";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Kawis-Kita",
  
  description: "Interaktif Maps Event management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/brand.svg" />
      </Head>
      <body
        className={`${poppins.className} antialiased`}
      >
        <SessionProvider session={session}>

          <ReactQueryProvider>
            {children}
            <Toaster richColors position="top-right" />
          </ReactQueryProvider>

        </SessionProvider>
      </body>
    </html>
  );
}
