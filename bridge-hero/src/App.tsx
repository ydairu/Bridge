import Navbar from './components/Navbar'
import HeroContent from './components/HeroContent'

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4'

export default function App() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-black">

      {/* Raw video background — no overlay */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* All content sits above video */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <HeroContent />
      </div>

    </div>
  )
}
