

import EventList from "@/components/event/EventList"
import Post from "@/components/post/Post"



export default function Dashboard() {




    return (
        <>
            <main className="flex-1 overflow-y-auto p-4">
                <Post />
            </main>

            {/* EventList: Tetap kanan */}
            <aside className=" shrink-0 overflow-y-auto border-l sticky h-[calc(100vh-64px)]">
                <EventList />
            </aside>
        </>
    )
}
