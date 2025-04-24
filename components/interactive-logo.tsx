"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion"
import { Shield } from "lucide-react"

interface InteractiveLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  interactive?: boolean
}

export function InteractiveLogo({ size = "md", className = "", interactive = true }: InteractiveLogoProps) {
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Smooth spring physics for more natural movement
  const springConfig = { damping: 25, stiffness: 150 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  // Transform mouse position to rotation values with limits
  const rotateX = useTransform(y, [-100, 100], [10, -10])
  const rotateY = useTransform(x, [-100, 100], [-10, 10])

  // Particles state
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>(
    [],
  )

  // Generate particles on mount
  useEffect(() => {
    if (mounted) return

    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 2,
    }))
    setParticles(newParticles)
    setMounted(true)
  }, [mounted])

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  // Reset position when mouse leaves
  const handleMouseLeave = () => {
    if (!interactive) return
    mouseX.set(0)
    mouseY.set(0)
    setHovered(false)
  }

  // Size mappings
  const sizeMap = {
    sm: {
      container: "h-12 w-12",
      outerRing: "h-12 w-12",
      middleRing: "h-8 w-8",
      innerRing: "h-6 w-6",
      icon: "h-4 w-4",
      particleMax: 20,
    },
    md: {
      container: "h-16 w-16",
      outerRing: "h-16 w-16",
      middleRing: "h-12 w-12",
      innerRing: "h-8 w-8",
      icon: "h-5 w-5",
      particleMax: 30,
    },
    lg: {
      container: "h-24 w-24",
      outerRing: "h-24 w-24",
      middleRing: "h-16 w-16",
      innerRing: "h-12 w-12",
      icon: "h-7 w-7",
      particleMax: 40,
    },
    xl: {
      container: "h-32 w-32",
      outerRing: "h-32 w-32",
      middleRing: "h-24 w-24",
      innerRing: "h-16 w-16",
      icon: "h-10 w-10",
      particleMax: 50,
    },
  }

  const sizes = sizeMap[size]

  if (!mounted) {
    return null
  }

  return (
    <motion.div
      ref={containerRef}
      className={`relative flex items-center justify-center ${sizes.container} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={
        interactive
          ? {
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              perspective: 1000,
            }
          : undefined
      }
      whileHover={{ scale: interactive ? 1.05 : 1 }}
      whileTap={{ scale: interactive ? 0.95 : 1 }}
    >
      {/* Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-blue-400 dark:bg-blue-300"
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              x: hovered ? [0, particle.x / 2, particle.x] : 0,
              y: hovered ? [0, particle.y / 2, particle.y] : 0,
              opacity: hovered ? [0, 0.8, 0] : 0,
              scale: hovered ? [1, 1.5, 0.8] : 1,
            }}
            transition={{
              duration: hovered ? 2 : 0.5,
              delay: particle.delay,
              repeat: hovered ? Number.POSITIVE_INFINITY : 0,
              repeatType: "reverse",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Outer ring with glow effect */}
      <motion.div
        className={`absolute ${sizes.outerRing} rounded-full bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-600 dark:to-blue-500 opacity-80`}
        animate={{
          boxShadow: [
            "0 0 10px rgba(59, 130, 246, 0.5)",
            "0 0 20px rgba(59, 130, 246, 0.7)",
            "0 0 10px rgba(59, 130, 246, 0.5)",
          ],
          rotate: [0, 360],
        }}
        transition={{
          boxShadow: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          rotate: { duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
        }}
        style={{ z: -20 }}
      />

      {/* Middle ring with rotation */}
      <motion.div
        className={`absolute ${sizes.middleRing} rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center`}
        animate={{
          rotate: [0, -360],
          scale: hovered ? [1, 1.1, 1] : 1,
        }}
        transition={{
          rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
          scale: { duration: 2, repeat: hovered ? Number.POSITIVE_INFINITY : 0, ease: "easeInOut" },
        }}
        style={{ z: -10 }}
      >
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-200 to-transparent dark:via-blue-800 opacity-50"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        </div>
      </motion.div>

      {/* Inner circle with pulsing effect */}
      <motion.div
        className={`absolute ${sizes.innerRing} rounded-full bg-white dark:bg-blue-950 flex items-center justify-center`}
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: hovered
            ? ["0 0 0px rgba(59, 130, 246, 0)", "0 0 15px rgba(59, 130, 246, 0.7)", "0 0 0px rgba(59, 130, 246, 0)"]
            : ["0 0 0px rgba(59, 130, 246, 0)"],
        }}
        transition={{
          scale: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          boxShadow: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
        }}
        style={{ z: 0 }}
      />

      {/* Shield icon */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: [1, 1.1, 1],
          rotateZ: hovered ? [0, -5, 5, 0] : 0,
        }}
        transition={{
          scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          rotateZ: { duration: 2, repeat: hovered ? Number.POSITIVE_INFINITY : 0, ease: "easeInOut" },
        }}
      >
        <Shield className={`${sizes.icon} text-blue-600 dark:text-blue-400`} />
      </motion.div>

      {/* Glow overlay on hover */}
      <motion.div
        className="absolute inset-0 rounded-full bg-blue-500 dark:bg-blue-400 opacity-0"
        animate={{ opacity: hovered ? [0, 0.2, 0] : 0 }}
        transition={{ duration: 1.5, repeat: hovered ? Number.POSITIVE_INFINITY : 0, ease: "easeInOut" }}
      />
    </motion.div>
  )
}
