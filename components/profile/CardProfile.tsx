"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
import {
    Edit,
    Camera,
    MapPinIcon,
    CalendarDays,
    X,
    Upload,
    Loader2,
} from "lucide-react"
import LogoutModal from "@/components/profile/ModalLogout"
import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import getInitialName from "@/lib/getInitialName"
import { User } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useGeolocation } from "@/context/geolocation-context"





export default function CardProfile() {
    const [isEditing, setIsEditing] = useState(false)
    const { address } = useGeolocation()

    const { data: session, status: sessionStatus, update } = useSession(); // Data sesi user
    const queryClient = useQueryClient(); // Client untuk invalidasi cache
    // State untuk data form
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); // Input password
    const [newProfileImageFile, setNewProfileImageFile] = useState<File | null>(null); // File gambar baru yang dipilih
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null); // URL gambar yang sedang ditampilkan (DB atau preview baru)
    const [oldImageUrlFromDb, setOldImageUrlFromDb] = useState<string | null>(null); // URL gambar di DB sebelum diedit
    const router = useRouter()
    const { data } = useSession()


    const {
        data: userProfile,
        isLoading: isLoadingProfile,
        isError: isErrorProfile,
        // refetch,
        error: profileError,
    } = useQuery<User, Error>({
        queryKey: ["userProfile", session?.user?.id], // Kunci unik untuk user profile
        queryFn: async () => {
            const response = await fetch("/api/auth/me"); // Memanggil API GET /api/users/me
            if (!response.ok) {
                if (response.status === 401) router.push("/login"); // Redirect jika unauthorized
                const errorData = await response.json();
                throw new Error(errorData.message || "Gagal memuat profil.");
            }
            return response.json();
        },
        enabled: sessionStatus === "authenticated", // Query hanya dijalankan jika user login
        staleTime: 1000 * 60 * 5, // Data dianggap "stale" setelah 5 menit

    });


    const updateProfileMutation = useMutation({
        mutationFn: async (formData: FormData) => { // Menerima FormData
            const response = await fetch(`/api/auth/me`, { // Kirim ke API PUT /api/users/[id]
                method: "PUT",
                body: formData, // Kirim FormData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Gagal mengupdate profil.");
            }
            return response.json();
        },
        onSuccess: async (data) => {
            toast.success("Profil Berhasil Diperbarui!", { description: "Informasi profil Anda telah disimpan." });
            queryClient.invalidateQueries({ queryKey: ["userProfile", session?.user?.id] }); // Invalidasi cache profil
            queryClient.invalidateQueries({ queryKey: ["posts"] }); // Invalidasi posts jika username/image berubah
            queryClient.invalidateQueries({ queryKey: ["postComments"] }); // Invalidasi comments
            update({
                name: data.user.fullName,
                image: data.user.image,
                username: data.user.username,
            })

        },
        onError: (error) => {
            toast.error("Gagal Memperbarui Profil", { description: error.message || "Terjadi kesalahan saat memperbarui profil." });
        },
    });


    const isFormDisabled = isLoadingProfile || updateProfileMutation.isPending || sessionStatus === "loading" || !isEditing;

    if (!data) redirect("/")

    useEffect(() => {
        if (userProfile) {
            setFullName(userProfile.fullName || "");
            setUsername(userProfile.username || "");
            setEmail(userProfile.email || "");
            setCurrentImageUrl(userProfile.image || null); // Tampilkan gambar dari DB
            setOldImageUrlFromDb(userProfile.image || null); // Simpan URL gambar lama dari DB
            setPassword(""); // Password tidak pernah di-populate dari DB untuk keamanan
        }
    }, [userProfile]); // Jalankan efek ini saat userProfile berubah

    const user = data.user

    const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNewProfileImageFile(file); // Simpan objek File yang baru dipilih
            setCurrentImageUrl(URL.createObjectURL(file)); // Tampilkan preview lokal
        }
    };

    const removeProfileImage = () => {
        setNewProfileImageFile(null); // Hapus file yang baru dipilih
        setCurrentImageUrl(null); // Kosongkan preview (akan menampilkan placeholder)
        // oldImageUrlFromDb akan dikirim sebagai kosong untuk menandakan penghapusan dari DB
    };

    // --- Fungsi untuk Mengirim Form ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (updateProfileMutation.isPending) return; // Mencegah double submit

        const formData = new FormData();
        // Tambahkan field teks hanya jika ada perubahan
        if (fullName !== userProfile?.fullName) formData.append("fullName", fullName);
        if (username !== userProfile?.username) formData.append("username", username);
        if (email !== userProfile?.email) formData.append("email", email);
        if (password.trim() !== '') formData.append("password", password); // Hanya kirim jika tidak kosong

        // Logika gambar profil untuk FormData:
        if (newProfileImageFile) { // Jika ada file baru yang dipilih
            formData.append("profileImage", newProfileImageFile);
            formData.append("oldImageUrl", oldImageUrlFromDb || ''); // Kirim URL lama untuk dihapus
        } else if (currentImageUrl === null && oldImageUrlFromDb !== null) {
            // Jika user menghapus gambar yang sebelumnya ada (currentImageUrl jadi null tapi oldImageUrlFromDb ada)
            formData.append("oldImageUrl", ""); // Kirim string kosong untuk menandakan penghapusan
        }
        // Jika currentImageUrl === oldImageUrlFromDb dan newProfileImageFile null, berarti tidak ada perubahan gambar,
        // jadi tidak perlu append apa-apa terkait gambar.

        // Cek apakah ada perubahan yang akan dikirim (minimal satu field di formData atau ada file baru)
        if (formData.entries().next().done && !newProfileImageFile && currentImageUrl === oldImageUrlFromDb) {
            toast.info("Tidak ada perubahan untuk disimpan.");
            return;
        }

        updateProfileMutation.mutate(formData); // Panggil mutasi
    };


    const handleSetIsEditing = () => {
        if (isEditing) {
            setFullName(userProfile?.fullName || "");
            setUsername(userProfile?.username || "");
            setEmail(userProfile?.email || "");
            setCurrentImageUrl(userProfile?.image || null);
            setOldImageUrlFromDb(userProfile?.image || null);
            setPassword("");
        }
        setIsEditing(!isEditing)
    }



    if (sessionStatus === "unauthenticated" || !session?.user?.id) {
        router.push("/login"); // Redirect jika tidak terautentikasi
        return null;
    }

    if (isLoadingProfile) {
        return <div className="text-center p-4 text-gray-600">Loading...</div>;
    }

    if (isErrorProfile || !userProfile) {
        return <div className="text-center p-4 text-red-600">Error memuat profil: {(profileError as Error)?.message || "Profil tidak ditemukan."}</div>;
    }



    return (
        <div>

            <form onSubmit={handleSubmit} className="">
                {/* Profile Header */}
                <Card className="mb-4 lg:mb-6">
                    <div className="relative">
                        {/* Cover Image */}
                        <div className="h-32 lg:h-48 bg-gradient-to-r from-orange-400 to-orange-600 rounded-t-lg relative overflow-hidden">
                            {/* <Image
                                src={user.image || "/placeholder.jpg"}
                                alt="Cover"
                                fill
                                className="object-cover opacity-50"
                            /> */}
                            {/* <Button
                                variant="secondary"
                                size="sm"
                                className="absolute top-2 lg:top-4 right-2 lg:right-4 bg-white/80 hover:bg-white text-xs lg:text-sm"
                            >
                                <Camera className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                                <span className="hidden sm:inline">Change Cover</span>
                            </Button> */}
                        </div>



                        {/* Profile Info */}
                        <CardContent className="pt-0 p-4 lg:p-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 lg:gap-6 -mt-12 lg:-mt-16 relative z-10">
                                <div className="relative"> {/* Tambahkan relative di sini */}
                                    <Avatar className="w-20 lg:w-32 h-20 lg:h-32 border-4 border-white bg-white shadow-2xl">
                                        <AvatarImage src={currentImageUrl || "/placeholder.jpg"} /> {/* Fallback placeholder */}
                                        <AvatarFallback className="text-lg lg:text-2xl">{getInitialName(userProfile?.fullName || userProfile?.username)}</AvatarFallback> {/* Gunakan userProfile */}
                                    </Avatar>

                                    {/* Input file tersembunyi yang dihubungkan dengan label */}
                                    <input
                                        id="profile-image-upload" // Beri ID unik
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageFileChange}
                                        className="hidden" // Sembunyikan input file bawaan
                                        disabled={isFormDisabled}
                                    />

                                    {/* Tombol Upload/Kamera - Akan berfungsi sebagai label untuk input file */}
                                    {/* Hanya tampilkan tombol upload jika belum ada gambar atau jika user ingin mengganti */}
                                    {isEditing && (
                                        <>
                                            {(!currentImageUrl || newProfileImageFile) ? ( // Jika belum ada gambar atau user baru pilih file
                                                <label
                                                    htmlFor="profile-image-upload" // Hubungkan ke ID input file
                                                    className="absolute bottom-0 right-0 rounded-full w-6 lg:w-8 h-6 lg:h-8 p-0 bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/80 flex items-center justify-center cursor-pointer"
                                                >
                                                    <Upload className="w-3 lg:w-4 h-3 lg:h-4" /> {/* Ubah icon dari Camera ke Upload */}
                                                </label>
                                            ) : ( // Jika sudah ada gambar, tombol ini bisa berfungsi untuk mengganti atau hanya sebagai dekorasi
                                                <label
                                                    htmlFor="profile-image-upload" // Tetap hubungkan ke ID input file
                                                    className="absolute bottom-0 right-0 rounded-full w-6 lg:w-8 h-6 lg:h-8 p-0 bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/80 flex items-center justify-center cursor-pointer"
                                                >
                                                    <Camera className="w-3 lg:w-4 h-3 lg:h-4" /> {/* Tetap Camera jika Anda suka */}
                                                </label>
                                            )}
                                        </>
                                    )}


                                    {/* Tombol Hapus Gambar - Hanya muncul jika ada gambar yang bisa dihapus */}
                                    {currentImageUrl && (
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-0 right-0 rounded-full w-6 lg:w-8 h-6 lg:h-8 p-0 shadow-md"
                                            onClick={removeProfileImage}
                                            disabled={isFormDisabled}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>


                                <div className="flex-1 text-center sm:text-left pb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                                        <div>
                                            <h1 className="text-xl lg:text-2xl font-bold">{user.name}</h1>
                                            <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-1 mt-1 text-sm lg:text-base">
                                                <MapPinIcon className="w-3 lg:w-4 h-3 lg:h-4" />
                                                {address || "Lokasi tidak diketahui"}
                                            </p>
                                            <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-1 mt-1 text-sm lg:text-base">
                                                <CalendarDays className="w-3 lg:w-4 h-3 lg:h-4" />
                                                Bergabung sejak{" "}
                                                {new Date(userProfile.createdAt).toLocaleDateString("ID-id", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleSetIsEditing}
                                            type="button"
                                            className="bg-orange-500 hover:bg-orange-600 mt-4 sm:mt-0 text-sm lg:text-base"
                                        >
                                            <Edit className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                                            {isEditing ? "Cancel" : "Edit Profile"}
                                        </Button>
                                    </div>

                                    {/* Stats */}
                                    {/* <div className="flex justify-center sm:justify-start gap-4 lg:gap-6">
                                        <div className="text-center">
                                            <p className="text-lg lg:text-xl font-bold text-orange-600">{userData.stats.eventsCreated}</p>
                                            <p className="text-xs lg:text-sm text-gray-600">Events</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg lg:text-xl font-bold text-blue-600">{userData.stats.postsCreated}</p>
                                            <p className="text-xs lg:text-sm text-gray-600">Posts</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg lg:text-xl font-bold text-green-600">{userData.stats.eventsAttended}</p>
                                            <p className="text-xs lg:text-sm text-gray-600">Attended</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg lg:text-xl font-bold text-purple-600">{userData.stats.followers}</p>
                                            <p className="text-xs lg:text-sm text-gray-600">Followers</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg lg:text-xl font-bold text-pink-600">{userData.stats.following}</p>
                                            <p className="text-xs lg:text-sm text-gray-600">Following</p>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </CardContent>
                    </div>
                </Card >



                <div className="space-y-6">


                    {/* Form Fields */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base lg:text-lg">Pengaturan Akun</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="fullName" className="text-sm lg:text-base">
                                    Nama Lengkap
                                </Label>
                                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" disabled={isFormDisabled} />
                            </div>
                            <div>
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isFormDisabled} />
                            </div>
                            <div>
                                <Label htmlFor="email-settings">Email</Label>
                                <Input id="email-settings" type="email" value={email} onChange={(e) => setEmail(e.target.value)} readOnly disabled={isFormDisabled} />
                            </div>
                            {/* <Separator /> Pemisah sebelum password */}
                            {/* <div>
                                <Label htmlFor="password">Password (Biarkan kosong jika tidak diubah)</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={isFormDisabled} />
                            </div> */}
                        </CardContent>
                    </Card>



                        {/* Submit Button */}
                        <Button type="submit" className=" bg-orange-500 w-full hover:bg-orange-600" disabled={isFormDisabled}>
                            {updateProfileMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                                </>
                            ) : (
                                "Simpan Perubahan"
                            )}
                        </Button>

                </div>
            </form >
                        <LogoutModal />


        </div>
    )
}