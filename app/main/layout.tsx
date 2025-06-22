
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Navigation from "@/components/mobile/navigation/Navigation";
import { GeolocationProvider } from "@/context/geolocation-context";
import type { Metadata } from "next";
// import { Geist, Poppins } from "next/font/google";

export const metadata: Metadata = {
    title: "Kawis Kita",
    description: "",
};

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {


    return (
        <GeolocationProvider>

            <div className="h-screen flex flex-col">
                {/* Header: Tetap di atas */}
                <header className="sticky top-0 z-10">
                    <Header />
                </header>

                {/* Konten utama: Flex secara horizontal */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Sidebar: Tetap kiri */}
                    {/* <aside className=" shrink-0 overflow-y-auto border-r sticky top-16 h-[calc(100vh-64px)]"> */}
                    <Sidebar />
                    {/* </aside> */}

                    {/* Main Content: Scrollable */}
                    {children}

                </div>
            </div>
            <Navigation/>
        </GeolocationProvider>

    )

    
}
