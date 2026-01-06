"use client"

import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import { useRef, useEffect, useState } from "react"

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden"
    >
      {/* Background Glows with enhanced movement */}
      <motion.div
        animate={{
          x: mousePosition.x * 2,
          y: mousePosition.y * 2,
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-accent-blue/10 blur-[120px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          x: mousePosition.x * 2,
          y: mousePosition.y * 2,
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-accent-purple/10 blur-[120px] rounded-full pointer-events-none"
      />

      <motion.div style={{ y, opacity, scale }} className="container relative z-10 px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
          v2.0 is now live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-8 max-w-6xl mx-auto leading-[0.85] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40"
        >
          Management <br />
          <span className="text-zinc-600">reimagined.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-2xl text-zinc-500 max-w-2xl mx-auto mb-12 text-pretty leading-relaxed"
        >
          Haus is the operating system for modern real estate. Automated billing, tenant intelligence, and portfolio
          scaling—all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="h-12 px-8 rounded-full bg-white text-black hover:bg-zinc-200 text-base font-medium group"
          >
            Start building
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 rounded-full border-white/10 hover:bg-white/5 text-base font-medium bg-transparent"
          >
            <Play className="mr-2 w-4 h-4 fill-current" />
            Watch Demo
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 100, rotateX: 15 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        style={{
          rotateX: useTransform(scrollYProgress, [0, 0.5], [15, 0]),
          translateZ: useTransform(scrollYProgress, [0, 0.5], [-100, 0]),
        }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative mt-20 w-full max-w-7xl px-4 md:px-6 perspective-2000"
      >
        <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-3xl overflow-hidden group shadow-[0_0_100px_-20px_rgba(255,255,255,0.1)] transition-shadow duration-700 hover:shadow-[0_0_120px_-15px_rgba(255,255,255,0.15)]">
          <div className="absolute inset-0 bg-gradient-to-tr from-accent-blue/5 via-transparent to-accent-purple/5 opacity-50" />

          {/* Mock Dashboard UI */}
          <div className="absolute inset-0 p-4 md:p-12 flex flex-col">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent-blue/20 border border-accent-blue/50 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-accent-blue" />
                </div>
                <div className="space-y-1">
                  <div className="w-24 h-3 rounded-full bg-white/20" />
                  <div className="w-16 h-2 rounded-full bg-white/10" />
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="w-20 h-2 rounded-full bg-accent-blue/30" />
                </div>
                <div className="h-full flex flex-col justify-end gap-4">
                  <div className="w-1/3 h-8 rounded-lg bg-white/10" />
                  <div className="w-full h-32 rounded-xl bg-gradient-to-t from-accent-blue/20 to-transparent border-t border-accent-blue/30" />
                </div>
              </div>
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 h-1/2">
                    <div className="w-12 h-12 rounded-full bg-white/10 mb-4" />
                    <div className="space-y-2">
                      <div className="w-full h-2 rounded-full bg-white/10" />
                      <div className="w-2/3 h-2 rounded-full bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Glass Overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        </div>
      </motion.div>
    </section>
  )
}
