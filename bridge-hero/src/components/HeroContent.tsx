import AnimatedHeading from './AnimatedHeading'
import FadeIn from './FadeIn'

export default function HeroContent() {
  return (
    <div className="px-6 md:px-12 lg:px-16 flex-1 flex flex-col justify-end pb-12 lg:pb-16">
      <div className="lg:grid lg:grid-cols-2 lg:items-end">

        {/* Left column */}
        <div>
          <AnimatedHeading
            text={"Your skills deserve\na direct path forward."}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4 text-white leading-none"
            initialDelay={200}
            charDelay={30}
          />

          <FadeIn delay={800} duration={1000}>
            <p className="text-base md:text-lg text-gray-300 mb-5 max-w-lg">
              Bridge connects migrant workers in Singapore directly with employers — no agencies, no hidden fees, no empty promises.
            </p>
          </FadeIn>

          <FadeIn delay={1200} duration={1000}>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
                Find jobs now
              </button>
              <button className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-all duration-200">
                I'm an employer
              </button>
            </div>
          </FadeIn>
        </div>

        {/* Right column — tag */}
        <FadeIn delay={1400} duration={1000} className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
          <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
            <span className="text-lg md:text-xl lg:text-2xl font-light text-white">
              Matching workers. Building futures. Fairly.
            </span>
          </div>
        </FadeIn>

      </div>
    </div>
  )
}
