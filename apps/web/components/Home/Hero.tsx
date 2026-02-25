import React from 'react'
import Link from 'next/link'

const HeroSection = () => {
  return (
    <div className="w-full bg-[#141920] text-white py-24 px-4 border-b border-[#2a3441]">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
          Trade with confidence
        </h1>
        <p className="text-[#b0b8c1] text-base md:text-lg mb-10 max-w-xl mx-auto">
          Low spreads, fast execution, 24/7 support. Start with a demo account.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link
            href="/webtrading"
            className="inline-flex items-center justify-center bg-[#ff6b00] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#e55a00] transition-colors"
          >
            Start Trading
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center border border-[#2a3441] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1a1f26] transition-colors"
          >
            Open Demo Account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HeroSection;