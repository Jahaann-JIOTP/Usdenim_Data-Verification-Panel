'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-6 pt-4 pb-0">

      {/* Left logo and slogan */}
      <div className="flex items-center space-x-2">
        {/* Brand Logo */}
        <Link href="/">
          <Image
            src="/assets/Jahann_logo.png"
            alt="JAHANN Logo"
            width={150}
            height={50}
            className="object-contain pt-[10px]"
          />
        </Link>
      </div>

      {/* Right Logo */}
      <div className="w-35 h-12 cursor-pointer">
        <Image
          src="/assets/us-denim-logo-mobile.png" 
          alt="US Denim logo"
          width={130}
          height={60}
          className="object-contain"
        />
      </div>
    </nav>
  );
}
