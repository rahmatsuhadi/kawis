
import FormCreatePost from "@/components/post/FormCreatePost"
import type React from "react"
import { getEventDetail } from "../page"
import { Button } from "@/components/ui/button";

// Mock data for available events
// const availableEvents = [
//   { id: 1, name: "Pasar Seni Gabusan Berbagi", date: "23 Feb 2025" },
//   { id: 2, name: "Festival Budaya Yogyakarta", date: "25 Feb 2025" },
//   { id: 3, name: "Pasar Malam Paseban", date: "28 Feb 2025" },
//   { id: 4, name: "Konser Musik Tradisional", date: "2 Mar 2025" },
// ]

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}


export default async function CreatePost({
  params
}: EventDetailPageProps) {

  const id = (await params).id

  const event = await getEventDetail(id);

   if (!event) {
        return (
            <main className="flex-1 overflow-y-auto p-4">
                <div className="max-w-md mx-auto text-center p-8 bg-white shadow-lg rounded-lg my-8">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Event Tidak Ditemukan</h1>
                    <p className="text-gray-700">Maaf, event dengan ID ini tidak ditemukan atau belum disetujui oleh admin.</p>
                    <Button
                        // onClick={() => redirect('/main')}
                        className="mt-4 bg-orange-500 hover:bg-orange-600">
                        Kembali ke Halaman Utama
                    </Button>
                </div>
            </main>
        );
    }

  return (
    <main className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-left">Buat Post</h1>
        <FormCreatePost event={event}/>
      </div>
    </main>
  )
}