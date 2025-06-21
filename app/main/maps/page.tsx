
import EventList from "@/components/event/EventList";
import LocationRadar from "@/components/interaktif-maps/Map";

export default function Maps() {
    return (

        <>
            <main className="flex-1 overflow-y-auto p-4">
                
                <LocationRadar />
            </main>

            {/* EventList: Tetap kanan */}
            <aside className=" shrink-0 overflow-y-auto border-l sticky h-[calc(100vh-64px)]">
                <EventList />
            </aside>

        </>
    )
}