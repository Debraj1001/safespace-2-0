"use client"

import { useEffect, useState } from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Only render the toggle after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="w-9 h-9 rounded-full">
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative w-9 h-9 overflow-hidden rounded-full bg-background border-primary/20 hover:border-primary/50"
          aria-label="Toggle theme"
        >
          <span className="sr-only">Toggle theme</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme === "dark" ? "dark" : theme === "light" ? "light" : "system"}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center theme-toggle-icon"
            >
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-blue-300" />
              ) : theme === "light" ? (
                <Sun className="h-5 w-5 text-blue-600" />
              ) : (
                <Laptop className="h-5 w-5 text-blue-500" />
              )}
            </motion.div>
          </AnimatePresence>
          <span className="absolute inset-0 rounded-full bg-blue-500/10 dark:bg-blue-400/10 opacity-0 hover:opacity-100 transition-opacity duration-200"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem] overflow-hidden">
        <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2 cursor-pointer">
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === "light" && (
            <motion.div
              layoutId="theme-check"
              className="ml-auto h-4 w-4 rounded-full bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2 cursor-pointer">
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && (
            <motion.div
              layoutId="theme-check"
              className="ml-auto h-4 w-4 rounded-full bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2 cursor-pointer">
          <Laptop className="h-4 w-4" />
          <span>System</span>
          {(theme === "system" || !theme) && (
            <motion.div
              layoutId="theme-check"
              className="ml-auto h-4 w-4 rounded-full bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
