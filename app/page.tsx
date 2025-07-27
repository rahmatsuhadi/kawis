"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Calendar,
  Users,
  Zap,
  ArrowRight,
  Star,
  Smartphone,
  Globe,
  Heart,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Animated counter component
function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      setCount(Math.floor(progress * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return <span>{count.toLocaleString()}</span>
}

export default function LandingPage() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleGetStarted = () => {
    router.push("/main/explore")
  }

  const handleCreateEvent = () => {
    router.push("/main/create-event")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Image src="/brand.svg" alt="Kawis Kita" width={40} height={40} />
              <span className="font-bold text-xl text-gray-800">Kawis Kita</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-orange-500 transition-colors">
                Fitur
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-orange-500 transition-colors">
                Cara Kerja
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-orange-500 transition-colors">
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
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className={`space-y-8 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
              <div className="space-y-4">
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 px-4 py-2">
                  🎉 Platform Event Terdepan di Indonesia
                </Badge>

                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Temukan Event
                  <span className="text-orange-500"> Menarik</span>
                  <br />
                  di Sekitar Anda
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed">
                  Jelajahi ribuan event seru dengan teknologi radar interaktif. Dari konser musik hingga workshop
                  teknologi, semua ada di ujung jari Anda.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Jelajahi Event
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  onClick={handleCreateEvent}
                  variant="outline"
                  size="lg"
                  className="border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-4 text-lg bg-transparent"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Buat Event
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500">
                    <AnimatedCounter end={10000} />+
                  </div>
                  <div className="text-sm text-gray-600">Event Aktif</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">
                    <AnimatedCounter end={50000} />+
                  </div>
                  <div className="text-sm text-gray-600">Pengguna</div>
                </div>
                <div className="text-3xl font-bold text-green-500 text-center">
                  <div className="text-3xl font-bold text-green-500">
                    <AnimatedCounter end={100} />+
                  </div>
                  <div className="text-sm text-gray-600">Kota</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Animation */}
            <div className={`relative ${isVisible ? "animate-fade-in-right" : "opacity-0"}`}>
              <div className="relative w-full h-96 lg:h-[500px]">
                {/* Main Phone Mockup */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl shadow-2xl transform rotate-6 hover:rotate-3 transition-transform duration-500">
                  <div className="absolute inset-4 bg-white rounded-2xl overflow-hidden">
                    <div className="h-full bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-orange-500 rounded-full mx-auto flex items-center justify-center animate-pulse">
                          <MapPin className="w-10 h-10 text-white" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                          <div className="h-3 bg-gray-100 rounded w-24 mx-auto"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Calendar className="w-8 h-8 text-white" />
                </div>

                <div
                  className="absolute -bottom-4 -right-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce"
                  style={{ animationDelay: "0.5s" }}
                >
                  <Users className="w-8 h-8 text-white" />
                </div>

                <div
                  className="absolute top-1/2 -right-8 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce"
                  style={{ animationDelay: "1s" }}
                >
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full opacity-20 animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-48 h-48 bg-blue-200 rounded-full opacity-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">✨ Fitur Unggulan</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Mengapa Memilih Kawis Kita?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Platform terdepan dengan teknologi canggih untuk pengalaman event yang tak terlupakan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-500 transition-colors">
                  <MapPin className="w-8 h-8 text-orange-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Radar Event Interaktif</h3>
                <p className="text-gray-600 leading-relaxed">
                  Temukan event di sekitar Anda dengan teknologi radar visual yang memudahkan eksplorasi berdasarkan
                  lokasi dan jarak.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500 transition-colors">
                  <Smartphone className="w-8 h-8 text-blue-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Mobile First Design</h3>
                <p className="text-gray-600 leading-relaxed">
                  Interface yang responsif dan dioptimalkan untuk penggunaan mobile, memberikan pengalaman terbaik di
                  semua perangkat.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500 transition-colors">
                  <Clock className="w-8 h-8 text-green-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Real-time Updates</h3>
                <p className="text-gray-600 leading-relaxed">
                  Dapatkan notifikasi dan update real-time tentang event favorit Anda, perubahan jadwal, dan informasi
                  penting lainnya.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500 transition-colors">
                  <Calendar className="w-8 h-8 text-purple-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Buat Event Mudah</h3>
                <p className="text-gray-600 leading-relaxed">
                  Platform yang user-friendly untuk membuat dan mempromosikan event Anda dengan tools lengkap dan proses
                  yang sederhana.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-500 transition-colors">
                  <Heart className="w-8 h-8 text-red-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Komunitas Aktif</h3>
                <p className="text-gray-600 leading-relaxed">
                  Bergabung dengan komunitas event enthusiast, berbagi pengalaman, dan temukan teman baru dengan minat
                  yang sama.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-500 transition-colors">
                  <Shield className="w-8 h-8 text-yellow-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Keamanan Terjamin</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sistem keamanan berlapis dan verifikasi event untuk memastikan pengalaman yang aman dan terpercaya
                  bagi semua pengguna.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">🚀 Cara Kerja</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Mulai dalam 3 Langkah Mudah</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proses yang sederhana dan intuitif untuk menemukan event impian Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Set Lokasi Anda</h3>
              <p className="text-gray-600 leading-relaxed">
                Aktifkan GPS atau pilih lokasi manual untuk menemukan event di sekitar Anda dengan radius yang dapat
                disesuaikan.
              </p>

              {/* Connector Line */}
              <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-orange-500 to-blue-500 transform -translate-x-1/2"></div>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Jelajahi dengan Radar</h3>
              <p className="text-gray-600 leading-relaxed">
                Gunakan fitur radar interaktif untuk melihat event di sekitar Anda dalam tampilan visual yang menarik
                dan mudah dipahami.
              </p>

              {/* Connector Line */}
              <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-green-500 transform -translate-x-1/2"></div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Daftar & Nikmati</h3>
              <p className="text-gray-600 leading-relaxed">
                Pilih event yang menarik, daftar dengan mudah, dan nikmati pengalaman event yang tak terlupakan bersama
                komunitas.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white px-12 py-4 text-lg shadow-lg"
            >
              Coba Sekarang Gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-4">💬 Testimoni</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Apa Kata Pengguna Kami?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ribuan pengguna telah merasakan pengalaman luar biasa dengan Kawis Kita
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  {`"Aplikasi yang luar biasa! Saya bisa menemukan event musik jazz di Jakarta dengan mudah. Fitur
                  radar-nya sangat membantu untuk melihat event terdekat."`}
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">SA</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Amelia</div>
                    <div className="text-sm text-gray-500">Music Enthusiast</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  {`"Sebagai event organizer, platform ini sangat membantu untuk mempromosikan acara saya. Interface-nya
                  user-friendly dan reach-nya luas."`}
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">RH</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Rizki Hakim</div>
                    <div className="text-sm text-gray-500">Event Organizer</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  {`"Fitur komunitas dan feed-nya membuat saya bisa terhubung dengan orang-orang yang punya minat sama.
                  Recommended banget!"`}
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">DN</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Dina Novita</div>
                    <div className="text-sm text-gray-500">Community Manager</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-blue-500">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Siap Menemukan Event Impian Anda?</h2>
            <p className="text-xl text-orange-100 mb-8 leading-relaxed">
              Bergabunglah dengan ribuan pengguna yang telah merasakan pengalaman luar biasa dalam menemukan dan
              menghadiri event-event menarik di seluruh Indonesia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-white text-orange-500 hover:bg-gray-100 px-12 py-4 text-lg font-semibold shadow-lg"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Mulai Jelajahi Sekarang
              </Button>

              <Button
                onClick={handleCreateEvent}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-orange-500 px-12 py-4 text-lg font-semibold bg-transparent"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Buat Event Pertama
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-2">100% Gratis</div>
                <div className="text-orange-100">Tanpa biaya tersembunyi</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">24/7 Support</div>
                <div className="text-orange-100">Dukungan kapan saja</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">Aman & Terpercaya</div>
                <div className="text-orange-100">Data Anda terlindungi</div>
              </div>
            </div>
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
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
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
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Mobile App
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
                    Press Kit
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
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms of Service
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

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out 0.3s both;
        }
      `}</style>
    </div>
  )
}
