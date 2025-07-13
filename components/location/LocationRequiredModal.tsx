// // components/location/LocationRequiredModal.tsx
// "use client";

// import React from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { Loader2, MapPin, LocateFixed, XCircle } from 'lucide-react';
// import { Button } from '../ui/button';

// // Props for the modal (simplified)
// interface LocationRequiredModalProps {
//   isOpen: boolean; // Controls if the modal is open
//   onPress: () =>void
//   // No onClose prop, as it's not manually dismissible from inside
// }

// export function LocationRequiredModal({ isOpen,onPress }: LocationRequiredModalProps) {
//   // No need for useGeolocation hook inside here, as it's just a static warning
//   // All logic for getting location and setting it happens outside this modal.

//   return (
//     // Dialog will be open={true} and cannot be closed by user (no onOpenChange on DialogContent)
//     <Dialog open={isOpen}>
//       <DialogContent className="sm:max-w-md p-6 text-center z-50"> {/* Higher z-index to ensure it's on top */}
//         <DialogHeader className="flex flex-col items-center mb-4">
//           <div className="mb-4">
//             <MapPin className="h-16 w-16 text-red-500 animate-bounce" /> {/* Added bounce animation */}
//           </div>
//           <DialogTitle className="text-2xl font-bold">Lokasi Diperlukan!</DialogTitle>
//           <DialogDescription className="text-gray-600 mt-2">
//             Aplikasi ini membutuhkan lokasi Anda untuk berfungsi. <br />
//             Mohon **atur lokasi Anda sekarang** untuk melihat event terdekat.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="mt-6 text-sm text-gray-500">
//           Cari tombol **"Posisikan Lokasi Saya"** atau **"Atur Lokasi"** di halaman ini.
//           Klik tombol tersebut untuk melanjutkan.
//         </div>

//         <Button onClick={onPress} className='hover:cursor-pointer hover:bg-primary/80 hover:scale-105'>
//           Posisikan Lokasi
//         </Button>
        
//         {/* No buttons here, user is forced to interact with main page buttons */}
//       </DialogContent>
//     </Dialog>
//   );
// }