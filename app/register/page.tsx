import Image from "next/image";
import RegisterForm from "@/components/register/RegisterForm";

export default function Register() {


  return(
    <div className="min-h-screen flex flex-col lg:flex-row">
          {/* Left Section - Orange Brand Area */}
          <div className="flex-1   order-2 lg:order-1 relative">
            <div className="p-6 lg:p-12 bg-orange-500  text-white relative  h-1/2">
              <div className="mt-20">
                <h1 className="text-2xl lg:text-4xl font-bold mb-4 lg:mb-6">KAWIS KITA</h1>
                <p className="text-base lg:text-lg leading-relaxed max-w-xl">
                  Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical
                  Latin literature from 45 BC, making it over 2000 years old.
                </p>
              </div>
              <div className="flex justify-center  mt-10 ">
                {/* Illustration - Hidden on mobile */}
                <div className="hidden lg:block">
                  <div className="bg-white rounded-lg p-6 shadow-lg min-w-md">
                    <Image
                      src="/images/dashboard-ill.png"
                      alt="Kawis Kita Dashboard"
                      width={400}
                      height={300}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
    
    
    
            {/* Logo at bottom - Responsive positioning */}
            <div className="absolute bottom-10 ml-auto w-full flex justify-center">
              <div className="flex items-center space-x-2">
                <Image src="/brand.svg" width={50} height={50} alt="kawis-kita-logo" />
                <span className="font-semibold text-gray-800 text-sm lg:text-base">Kawis Kita</span>
              </div>
            </div>
    
    
          </div>
    
          {/* Right Section - Login Form */}
          <div className="flex-1 bg-gray-100 relative flex items-center justify-center p-4 lg:p-8 order-1 lg:order-2">
            <RegisterForm />
    
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none hidden lg:block">
    
              <svg viewBox="0 0 984 263" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_101_727)">
                  <path d="M0 0L13.6667 42.7C27.3333 85 54.6667 171 82 176C109.333 181 136.667 107 164 106.7C191.333 107 218.667 181 246 192C273.333 203 300.667 149 328 138.7C355.333 128 382.667 160 410 160C437.333 160 464.667 128 492 144C519.333 160 546.667 224 574 229.3C601.333 235 628.667 181 656 149.3C683.333 117 710.667 107 738 138.7C765.333 171 792.667 245 820 266.7C847.333 288 874.667 256 902 240C929.333 224 956.667 224 970.333 224H984V320H970.333C956.667 320 929.333 320 902 320C874.667 320 847.333 320 820 320C792.667 320 765.333 320 738 320C710.667 320 683.333 320 656 320C628.667 320 601.333 320 574 320C546.667 320 519.333 320 492 320C464.667 320 437.333 320 410 320C382.667 320 355.333 320 328 320C300.667 320 273.333 320 246 320C218.667 320 191.333 320 164 320C136.667 320 109.333 320 82 320C54.6667 320 27.3333 320 13.6667 320H0V0Z" fill="#FF6200" />
                </g>
                <defs>
                  <clipPath id="clip0_101_727">
                    <rect width="984" height="320" fill="white" />
                  </clipPath>
                </defs>
              </svg>
    
            </div>
          </div>
    
        </div>
  )
  
}
