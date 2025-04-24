"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, Mic, MapPin, User, ChevronRight, ArrowRight } from "lucide-react"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { InteractiveLogo } from "@/components/interactive-logo"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])
  const heroRef = useRef<HTMLDivElement>(null)

  // Mouse position for interactive background
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 50, stiffness: 100 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  // Handle mouse move for the entire hero section
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      mouseX.set((e.clientX - rect.left - centerX) / 10)
      mouseY.set((e.clientY - rect.top - centerY) / 10)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden theme-transition">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur theme-transition">
        <div className="container flex h-16 items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InteractiveLogo size="sm" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
              SafeSpace
            </span>
          </motion.div>
          <motion.nav
            className="hidden gap-6 md:flex"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              How It Works
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              About
            </Link>
          </motion.nav>
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="relative overflow-hidden group">
                <span className="relative z-10">Log In</span>
                <span className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              </Button>
            </Link>
            <Link href="/login?tab=signup">
              <Button
                size="sm"
                className="relative overflow-hidden group bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <span className="relative z-10">Sign Up</span>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>
      <main className="flex-1">
        <section
          ref={heroRef}
          className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden hero-gradient"
          onMouseMove={handleMouseMove}
        >
          {/* Interactive background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-blue-500 dark:bg-blue-600"
                style={{
                  width: Math.random() * 300 + 50,
                  height: Math.random() * 300 + 50,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  x: i % 2 === 0 ? springX : springY.get() * -1,
                  y: i % 2 === 0 ? springY : springX.get() * -1,
                  opacity: 0.05,
                }}
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 1.2, 1],
                }}
                transition={{
                  duration: Math.random() * 5 + 10,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>

          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <motion.div
                className="flex flex-col justify-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <div className="space-y-2">
                  <motion.h1
                    className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                  >
                    Your Personal Safety Assistant
                  </motion.h1>
                  <motion.p
                    className="max-w-[600px] text-muted-foreground md:text-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                  >
                    Protecting students, women, the elderly, and travelers with advanced AI technology that works
                    silently in the background.
                  </motion.p>
                </div>
                <motion.div
                  className="flex flex-col gap-2 min-[400px]:flex-row"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                >
                  <Link href="/login?tab=signup">
                    <Button
                      size="lg"
                      className="w-full relative overflow-hidden group bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      <span className="relative z-10">Get Started</span>
                      <motion.span
                        className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "0%" }}
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div
                        className="absolute right-4 opacity-0 group-hover:opacity-100"
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full relative overflow-hidden group border-blue-500 dark:border-blue-400"
                    >
                      <span className="relative z-10">Learn More</span>
                      <motion.span
                        className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "0%" }}
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div
                        className="absolute right-4 opacity-0 group-hover:opacity-100"
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.div>
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div
                className="flex items-center justify-center"
                style={{ opacity, scale }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <InteractiveLogo size="xl" className="animate-float" />
              </motion.div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full bg-muted py-12 md:py-24 lg:py-32 relative overflow-hidden">
          <motion.div
            className="container px-4 md:px-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200">
                Key Features
              </h2>
              <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                SafeSpace uses Groq AI to keep you safe in various situations
              </p>
            </motion.div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
                  title: "Text Analysis",
                  description: "Analyzes messages for potential threats and concerning language",
                },
                {
                  icon: <Mic className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
                  title: "Audio Monitoring",
                  description: "Detects sounds of distress and alerts your emergency contacts",
                },
                {
                  icon: <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
                  title: "Safe Zones",
                  description: "Set up safe areas and get alerts when you leave them",
                },
                {
                  icon: <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
                  title: "Emergency Alerts",
                  description: "One-tap emergency alerts with location sharing",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col items-center justify-center space-y-4 rounded-lg border bg-background p-4 transition-all duration-200 hover:shadow-md hover:shadow-blue-100 dark:hover:shadow-blue-900/20"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-4"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-center text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 overflow-hidden">
          <motion.div
            className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200">
                Powered by Groq AI
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                SafeSpace uses Groq AI to analyze text, audio, and location data in real-time, providing intelligent
                safety recommendations.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col gap-2 min-[400px]:flex-row lg:justify-end"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Link href="/login?tab=signup">
                <Button
                  size="lg"
                  className="relative overflow-hidden group bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <span className="relative z-10">Get Started</span>
                  <motion.span
                    className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="relative overflow-hidden group border-blue-500 dark:border-blue-400"
                >
                  <span className="relative z-10">Log In</span>
                  <motion.span
                    className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>
      <motion.footer
        className="w-full border-t bg-background py-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <InteractiveLogo size="sm" />
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
              SafeSpace
            </span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © 2025 SafeSpace. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/about"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-blue-600 dark:hover:text-blue-400"
            >
              About
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-blue-600 dark:hover:text-blue-400"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-blue-600 dark:hover:text-blue-400"
            >
              Privacy
            </Link>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
