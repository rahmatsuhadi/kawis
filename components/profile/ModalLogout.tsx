"use client"
import { signOut } from 'next-auth/react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useRouter } from 'next/navigation';


const LogoutModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Fungsi untuk menutup modal
  const closeModal = () => setIsOpen(false);

  const router = useRouter()


  // Fungsi untuk menangani aksi logout
  const handleLogout = () => {
    // Lakukan proses logout (misalnya menghapus token atau data pengguna)
    signOut()
    router.replace("/")
    closeModal(); // Tutup modal setelah logout
  };

  return (
    <div>
      {/* Modal Logout */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsOpen(true)} className="bg-red-500 w-full mt-5 hover:bg-red-600 mx-auto">Keluar <LogOut /></Button>

        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Logout</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin keluar? Semua data Anda akan hilang.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Batal</Button>
            <Button className="bg-red-500 hover:bg-red-600" onClick={handleLogout}>Ya, Keluar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LogoutModal;
