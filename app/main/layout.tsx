import EventList from "@/components/event/EventList";
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

    return (
        <div className="h-screen bg-gray-50">
            {/* Header */}
            <Header />

            <div className="flex">
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1">
                    {/* <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 "> */}
                    {children}
                </main>

                {/* Right Sidebar - Hidden on mobile and tablet */}
                <EventList />

            </div>


        </div>
    )
}
