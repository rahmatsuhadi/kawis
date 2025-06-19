import FormCreateEvent from "@/components/event/FormCreateEvent"
import type React from "react"



export default function PostEvent() {
    return (
        <main className="flex-1 overflow-y-auto p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-center">Membuat Event Baru</h1>
                <FormCreateEvent/>
            </div>
        </main>

    )
}