export default function Navbar() {
  return (
    <div className="px-6 md:px-12 lg:px-16 pt-6">
      <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
        <span className="text-2xl font-semibold tracking-tight text-white">
          Bridge<span className="text-[#4A9EF5]">.</span>
        </span>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          {['For workers', 'For employers', 'How it works', 'About'].map(link => (
            <a
              key={link}
              href="#"
              className="hover:text-gray-300 transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>

        <button className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
          Post a job
        </button>
      </nav>
    </div>
  )
}
