import Image from "next/image";
import RegisterForm from "@/components/register/RegisterForm";

export default function Register() {
  return (
     <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Orange Brand Area */}
      <div className="flex-1 bg-orange-500 relative overflow-hidden order-2 lg:order-1">
        <div className="p-6 lg:p-12 text-white relative z-10">
          <h1 className="text-2xl lg:text-4xl font-bold mb-4 lg:mb-6">KAWIS KITA</h1>
          <p className="text-base lg:text-lg leading-relaxed max-w-md">
            Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical
            Latin literature from 45 BC, making it over 2000 years old.
          </p>
        </div>

        {/* Illustration - Hidden on mobile */}
        <div className="absolute bottom-20 left-12 right-12 hidden lg:block">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md">
            <Image
              src="/images/dashboard-illustration.png"
              alt="Dashboard illustration showing two people working with interface elements"
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 lg:p-8 order-1 lg:order-2">
        <RegisterForm/>
      </div>

      {/* Bottom Orange Wave Decoration - Hidden on mobile */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none hidden lg:block">
        <svg viewBox="0 0 1440 120" className="w-full h-20 fill-orange-500" preserveAspectRatio="none">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
        </svg>
      </div>

      {/* Logo at bottom - Responsive positioning */}
      <div className="absolute bottom-4 left-4 lg:left-12 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-6 lg:w-8 h-6 lg:h-8 bg-black flex items-center justify-center">
            <span className="text-white font-bold text-xs">KK</span>
          </div>
          <span className="font-semibold text-gray-800 text-sm lg:text-base">Kawis Kita</span>
        </div>
      </div>
    </div>
  );
}
