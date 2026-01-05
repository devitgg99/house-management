"use client";
import { Navbar } from "./components/layout/navbar";
import { Hero } from "./components/layout/hero";
import { FeatureGrid } from "./components/layout/feature-grid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useScroll, useSpring,motion } from "framer-motion";


export default function Home() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent-blue selection:text-white">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-accent-blue z-[60] origin-left" style={{ scaleX }} />
      <Navbar />
      <Hero />
      <FeatureGrid />

      {/* Trusted By Section */}
      <section className="py-12 sm:py-16 md:py-24 border-t border-border">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-center text-xs sm:text-sm font-medium text-zinc-500 mb-6 sm:mb-8 md:mb-12 uppercase tracking-widest">
            Empowering the world&apos;s best property managers
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-12 lg:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-tighter">KLARNA</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-tighter">HARVEY</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-tighter">OSCAR</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-tighter hidden sm:block">SUPERHUMAN</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-tighter hidden sm:block">SALESFORCE</div>
          </div>
        </div>
      </section>

      {/* Interactive Stats Section */}
      <section className="py-16 sm:py-24 md:py-32 border-t border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 text-center">
            {[
              { label: "Assets Managed", value: "$4.2B+" },
              { label: "Daily Transactions", value: "850k" },
              { label: "Active Tenants", value: "1.2M" },
              { label: "Uptime SLA", value: "99.99%" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-1 sm:mb-2 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-zinc-500 uppercase tracking-wider sm:tracking-widest font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent-blue/5 blur-[80px] md:blur-[120px] rounded-full translate-y-1/2" />
        <div className="container mx-auto relative z-10 px-4 md:px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 sm:mb-8"
          >
            Ready to scale <br />
            <span className="text-zinc-500">your portfolio?</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full px-8 sm:px-12 h-12 sm:h-14 bg-white text-black hover:bg-zinc-200 text-base sm:text-lg font-medium"
            >
              Get Started Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-full px-8 sm:px-12 h-12 sm:h-14 border-border hover:bg-muted text-base sm:text-lg font-medium bg-transparent"
            >
              Contact Sales
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 md:py-20 border-t border-border bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16 md:mb-20">
            <div className="col-span-2 md:col-span-1 mb-4 md:mb-0">
              <div className="text-xl sm:text-2xl font-bold tracking-tighter mb-4 sm:mb-6">HAUS</div>
              <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed max-w-xs">
                The operating system for modern real estate management. Built for speed, security, and scale.
              </p>
            </div>
            <div>
              <h4 className="text-foreground font-medium mb-4 sm:mb-6 text-sm sm:text-base">Platform</h4>
              <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-zinc-500">
                <li>
                  <Link href="#" className="hover:text-white transition-colors py-1 inline-block">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors py-1 inline-block">
                    Infrastructure
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors py-1 inline-block">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-medium mb-4 sm:mb-6 text-sm sm:text-base">Company</h4>
              <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-zinc-500">
                <li>
                  <Link href="#" className="hover:text-white transition-colors py-1 inline-block">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors py-1 inline-block">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors py-1 inline-block">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-medium mb-4 sm:mb-6 text-sm sm:text-base">Social</h4>
              <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-zinc-500">
                <li>
                  <Link href="#" className="hover:text-white transition-colors py-1 inline-block">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors py-1 inline-block">
                    LinkedIn
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors py-1 inline-block">
                    GitHub
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-6 sm:pt-8 border-t border-border gap-3 sm:gap-4">
            <p className="text-[10px] sm:text-xs text-zinc-600 text-center md:text-left">© 2026 Haus Technologies Inc. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6 text-[10px] sm:text-xs text-zinc-600">
              <Link href="#" className="hover:text-zinc-400 py-1">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-zinc-400 py-1">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
