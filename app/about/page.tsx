"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Calendar,
  Users,
  Heart,
  Target,
  Lightbulb,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AboutPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/main/explore")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/brand.svg" alt="Kawis Kita" width={40} height={40} />
              <span className="font-bold text-xl text-gray-800">Kawis Kita</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-orange-500 transition-colors">
                Beranda
              </Link>
              <Link href="/#features" className="text-gray-600 hover:text-orange-500 transition-colors">
                Fitur
              </Link>
              <Link href="/about" className="text-orange-500 font-medium">
                Tentang
              </Link>
              <Button onClick={handleGetStarted} className="bg-orange-500 hover:bg-orange-600">
                Mulai Sekarang
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button onClick={handleGetStarted} size="sm" className="bg-orange-500 hover:bg-orange-600">
                Mulai
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 px-4 py-2 mb-6">
              🚀 Tentang Kawis Kita
            </Badge>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Menghubungkan Komunitas
              <span className="text-orange-500"> Melalui Event</span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Kawis Kita adalah platform inovatif yang menggabungkan teknologi canggih dengan pengalaman pengguna yang
              luar biasa untuk menciptakan ekosistem event terdepan di Indonesia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Mulai Jelajahi
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-4 text-lg bg-transparent"
              >
                <Mail className="w-5 h-5 mr-2" />
                Hubungi Kami
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Mission */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-orange-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Misi Kami</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Memudahkan setiap orang untuk menemukan, menghadiri, dan menciptakan event yang bermakna. Kami percaya
                bahwa setiap event memiliki kekuatan untuk menghubungkan orang, membangun komunitas, dan menciptakan
                kenangan yang tak terlupakan.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Aksesibilitas event untuk semua kalangan</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Teknologi yang mudah digunakan</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Membangun komunitas yang kuat</span>
                </li>
              </ul>
            </div>

            {/* Vision */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Lightbulb className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Visi Kami</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Menjadi platform event terdepan di Asia Tenggara yang menginspirasi jutaan orang untuk terhubung,
                belajar, dan berkembang melalui pengalaman event yang luar biasa.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="text-gray-700">Ekspansi ke seluruh Asia Tenggara</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="text-gray-700">Inovasi teknologi berkelanjutan</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="text-gray-700">Dampak positif bagi masyarakat</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-6">📖 Cerita Kami</Badge>

            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-8">Perjalanan Menciptakan Kawis Kita</h2>

            <div className="text-left space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                Kawis Kita lahir dari pengalaman pribadi para founder yang sering kesulitan menemukan event menarik di
                sekitar mereka. Seringkali, event-event berkualitas tersembunyi dan sulit dijangkau oleh audiens yang
                tepat.
              </p>

              <p>
                Pada tahun 2024, tim kami yang terdiri dari teknolog, desainer, dan event enthusiast berkumpul dengan
                satu tujuan: menciptakan solusi yang menghubungkan penyelenggara event dengan audiens mereka melalui
                teknologi yang inovatif dan mudah digunakan.
              </p>

              <p>
                Fitur radar interaktif menjadi inovasi utama kami, memungkinkan pengguna untuk "melihat" event di
                sekitar mereka dengan cara yang visual dan intuitif. Kami percaya bahwa teknologi harus mempermudah
                hidup, bukan memperumitnya.
              </p>

              <p>
                Hari ini, Kawis Kita telah melayani ribuan pengguna dan ratusan event organizer di seluruh Indonesia.
                Namun, ini baru permulaan dari visi besar kami untuk menghubungkan komunitas melalui pengalaman event
                yang bermakna.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">💎 Nilai-Nilai Kami</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Prinsip yang Memandu Kami</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nilai-nilai fundamental yang menjadi fondasi dalam setiap keputusan dan inovasi yang kami buat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Value 1 */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Passion</h3>
                <p className="text-gray-600 leading-relaxed">
                  Kami memiliki passion yang mendalam untuk menghubungkan orang melalui pengalaman event yang bermakna.
                </p>
              </CardContent>
            </Card>

            {/* Value 2 */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Selalu mencari cara baru dan kreatif untuk meningkatkan pengalaman pengguna melalui teknologi
                  terdepan.
                </p>
              </CardContent>
            </Card>

            {/* Value 3 */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Trust</h3>
                <p className="text-gray-600 leading-relaxed">
                  Membangun kepercayaan melalui transparansi, keamanan data, dan komitmen terhadap kualitas layanan.
                </p>
              </CardContent>
            </Card>

            {/* Value 4 */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Community</h3>
                <p className="text-gray-600 leading-relaxed">
                  Mengutamakan kepentingan komunitas dan menciptakan nilai bersama untuk semua stakeholder.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">👥 Tim Kami</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Orang-Orang di Balik Kawis Kita</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tim yang berdedikasi dengan keahlian beragam, bersatu dalam satu visi untuk menciptakan platform event
              terbaik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Team Member 1 */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">ZF</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Zidan Farras</h3>
                <p className="text-orange-500 font-medium mb-4">CEO</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Visioner dengan pengalaman 10+ tahun di industri teknologi. Passionate dalam membangun produk yang
                  memberikan dampak positif bagi masyarakat.
                </p>
              </CardContent>
            </Card>

            {/* Team Member 2 */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">MW</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Muhanaa Wahyu</h3>
                <p className="text-blue-500 font-medium mb-4">Co-Founder</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Expert dalam pengembangan aplikasi mobile dan web. Memimpin tim engineering untuk menciptakan solusi
                  teknologi yang scalable dan reliable.
                </p>
              </CardContent>
            </Card>

            {/* Team Member 3 */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">IA</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ilham Abi</h3>
                <p className="text-green-500 font-medium mb-4">Head of Design</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  UI/UX Designer berpengalaman yang fokus pada user-centered design. Bertanggung jawab menciptakan
                  pengalaman pengguna yang intuitif dan menyenangkan.
                </p>
              </CardContent>
            </Card>
            {/* Team Member 3 */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">RS</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Rahmat Suhadi</h3>
                <p className="text-green-500 font-medium mb-4">Head of IT Support</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  IT Support yang menjaga agar aplikasi tetap berjalan semestinya tanpa hambatan dan terjaga kerahasiaannya.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 mb-4">📊 Pencapaian Kami</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Dampak yang Telah Kami Ciptakan</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Angka-angka yang menunjukkan komitmen kami dalam melayani komunitas event di Indonesia
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-orange-500 mb-2">10K+</div>
              <div className="text-gray-600 font-medium">Event Terdaftar</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-blue-500 mb-2">50K+</div>
              <div className="text-gray-600 font-medium">Pengguna Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-green-500 mb-2">100+</div>
              <div className="text-gray-600 font-medium">Kota Terjangkau</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-purple-500 mb-2">98%</div>
              <div className="text-gray-600 font-medium">Kepuasan User</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-blue-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Mari Berkolaborasi Bersama Kami</h2>
            <p className="text-xl text-orange-100 mb-8 leading-relaxed">
              Punya ide untuk event yang luar biasa? Ingin bermitra dengan kami? Atau sekadar ingin berbagi feedback?
              Kami selalu terbuka untuk mendengar dari Anda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
                <p className="text-orange-100">hello@kawiskita.com</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Telepon</h3>
                <p className="text-orange-100">+62 812-3456-7890</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Alamat</h3>
                <p className="text-orange-100">Yogyakarta, Indonesia</p>
              </div>
            </div>

            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-orange-500 hover:bg-gray-100 px-12 py-4 text-lg font-semibold shadow-lg"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Mulai Perjalanan Anda
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Image src="/brand.svg" alt="Kawis Kita" width={32} height={32} />
                <span className="font-bold text-xl">Kawis Kita</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Platform terdepan untuk menemukan dan membuat event di Indonesia. Menghubungkan komunitas melalui
                pengalaman yang tak terlupakan.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Produk</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/main/explore" className="hover:text-white transition-colors">
                    Jelajahi Event
                  </Link>
                </li>
                <li>
                  <Link href="/main/create-event" className="hover:text-white transition-colors">
                    Buat Event
                  </Link>
                </li>
                <li>
                  <Link href="/main/feed" className="hover:text-white transition-colors">
                    Feed Komunitas
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Perusahaan</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Karir
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Dukungan</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Kontak
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Kawis Kita. All rights reserved. Yogyakarta.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
