"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { ThemeToggle } from "../theme-toggle"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-4 md:p-6"
    >
      <nav className="relative flex items-center justify-between w-full max-w-5xl gap-4 sm:gap-8 px-4 sm:px-6 py-3 rounded-full bg-background/80 border border-border backdrop-blur-md">
        <Link href="/" className="text-foreground font-bold text-xl tracking-tighter shrink-0">
          HAUS
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#solutions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Solutions
          </Link>
          <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Log in
          </Link>
          <Button size="sm" className="rounded-full px-5">
            Get Started
          </Button>
        </div>

        {/* Mobile: Theme toggle + Menu button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button className="text-foreground p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-4 p-6 rounded-3xl bg-background border border-border backdrop-blur-xl md:hidden flex flex-col gap-6"
            >
              <Link href="#features" className="text-lg text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>
                Features
              </Link>
              <Link href="#solutions" className="text-lg text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>
                Solutions
              </Link>
              <Link href="#pricing" className="text-lg text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>
                Pricing
              </Link>
              <hr className="border-border" />
              <div className="flex flex-col gap-4">
                <Link href="/login" className="text-lg text-muted-foreground hover:text-foreground transition-colors">
                  Log in
                </Link>
                <Button className="w-full rounded-full">Get Started</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  )
}
