"use client"

import type React from "react"

import { motion, useInView } from "framer-motion"
import { Shield, Zap, Search, Users, Layout, Cpu, Globe, BarChart3 } from "lucide-react"
import { useRef } from "react"

const features = [
  {
    title: "Faster iteration. More innovation.",
    description:
      "The platform for rapid progress. Let your team focus on managing properties instead of infrastructure with automated workflows.",
    icon: Zap,
    stat: "20 days",
    subtext: "saved on monthly reports",
    grid: "col-span-12 md:col-span-7",
  },
  {
    title: "Make teamwork seamless.",
    description: "Tools for your team and stakeholders to share feedback and iterate faster.",
    icon: Users,
    stat: "300%",
    subtext: "increase in tenant satisfaction",
    grid: "col-span-12 md:col-span-5",
  },
  {
    title: "Secure by default.",
    description:
      "Enterprise-grade security with end-to-end encryption for all your sensitive data and financial transactions.",
    icon: Shield,
    stat: "99.9%",
    subtext: "platform uptime",
    grid: "col-span-12 md:col-span-5",
  },
  {
    title: "Powerful search & analytics.",
    description:
      "Gain deep insights into your portfolio performance with real-time data and advanced filtering capabilities.",
    icon: Search,
    stat: "6x faster",
    subtext: "to close monthly records",
    grid: "col-span-12 md:col-span-7",
  },
  {
    title: "Global Scale",
    description:
      "Deploy and manage your real estate assets across borders with localized compliance and multi-currency support.",
    icon: Globe,
    stat: "42 countries",
    subtext: "supported globally",
    grid: "col-span-12 md:col-span-4",
  },
  {
    title: "AI-Powered Intelligence",
    description:
      "Predictive maintenance and tenant behavior analysis that helps you stay ahead of potential issues before they arise.",
    icon: Cpu,
    stat: "85%",
    subtext: "accuracy in churn prediction",
    grid: "col-span-12 md:col-span-8",
  },
  {
    title: "Advanced Analytics",
    description:
      "Deep-dive into your financial performance with granular reports and real-time portfolio health monitoring.",
    icon: BarChart3,
    stat: "$2.4B",
    subtext: "assets under management",
    grid: "col-span-12 md:col-span-8",
  },
  {
    title: "Infinite Design",
    description: "Customize every aspect of your tenant portal to match your brand identity perfectly.",
    icon: Layout,
    stat: "100%",
    subtext: "brand customizable",
    grid: "col-span-12 md:col-span-4",
  },
]

export function FeatureGrid() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`)
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`)
  }

  return (
    <section id="features" className="py-32 border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-6"
          >
            Engineering for <br />
            <span className="text-muted-foreground">modern operations.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground text-pretty leading-relaxed"
          >
            We&apos;ve built the infrastructure so you don&apos;t have to. Focus on your business while Haus handles the
            complexity of property management.
          </motion.p>
        </div>

        {/* Implemented a true bento-style hover effect with localized spotlights */}
        <div ref={containerRef} onMouseMove={handleMouseMove} className="grid grid-cols-12 gap-3 sm:gap-4 md:gap-6 group/grid">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`${feature.grid} group relative p-5 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] border border-border bg-card/50 hover:bg-card hover:border-border transition-all duration-500 overflow-hidden`}
            >
              {/* Localized hover spotlight */}
              <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(var(--foreground-rgb,255,255,255),0.06),transparent_40%)] md:bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(var(--foreground-rgb,255,255,255),0.06),transparent_40%)]" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 sm:mb-8 md:mb-12">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium mb-3 sm:mb-4 md:mb-6">
                    <feature.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {feature.title.split(" ")[0]}
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 tracking-tight leading-[1.1]">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl text-pretty leading-relaxed">{feature.description}</p>
                </div>

                <div className="mt-auto pt-4 sm:pt-6 md:pt-8 border-t border-border flex items-baseline gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-foreground">{feature.stat}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground font-medium">{feature.subtext}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
