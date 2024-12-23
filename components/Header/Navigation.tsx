"use client"
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Navigation: React.FC = () => {
  return (
    <nav className="bg-[#0A192F] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[70px]">
          <div className="flex items-center">
            <Image
              src="/brainwave-symbol.svg"
              alt="Brainwave Symbol"
              width={180}
              height={180}
              className="h-10 w-10 filter invert" // Invert the color of the SVG if it's originally dark
            />
          </div>
          <div className="flex items-center">
            <Link href="/" passHref>
              <Image
                src="/logo.svg"
                alt="ISCS Logo"
                width={100}
                height={45}
                className="h-[102px] w-50 filter invert" // Invert the color of the SVG if it's originally dark
              />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation

