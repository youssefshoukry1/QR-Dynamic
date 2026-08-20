"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
export default function Navbar() {
  const pathname = usePathname();
  console.log(pathname)
  return (
    <nav className=' h-10 bg-gray-500'>

    </nav>
  )
}
