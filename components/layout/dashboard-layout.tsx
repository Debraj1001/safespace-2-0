"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { signOut } from "@/lib/auth-helpers"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, MessageSquare, Mic, MapPin, Bell, Settings, LogOut, Menu, X, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { NamePromptDialog } from "@/components/auth/name-prompt-dialog"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [namePromptOpen, setNamePromptOpen] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()

      setUser(userData)

      // Check if the user has a name
      if (!userData?.full_name) {
        setNamePromptOpen(true)
      }

      setLoading(false)
    }

    checkUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    const result = await signOut()

    if (result.success) {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      })

      router.push("/login")
      router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/dashboard/text-analysis", label: "Text Analysis", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/dashboard/audio-monitoring", label: "Audio Monitoring", icon: <Mic className="h-5 w-5" /> },
    { href: "/dashboard/safe-zones", label: "Safe Zones", icon: <MapPin className="h-5 w-5" /> },
    { href: "/dashboard/alerts", label: "Alerts", icon: <Bell className="h-5 w-5" /> },
    { href: "/dashboard/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for desktop */}
      <motion.aside
        className="hidden w-64 flex-col bg-white dark:bg-gray-800 shadow-sm md:flex"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <motion.div
              className="h-8 w-8 rounded-full bg-primary flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield className="h-4 w-4 text-primary-foreground" />
            </motion.div>
            <span className="text-xl font-bold">SafeSpace</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 rounded-md px-3 py-2 text-gray-700 dark:text-gray-200 transition-colors duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.icon}
                </motion.div>
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute left-0 w-1 h-full bg-primary rounded-r-md"
                    layoutId="sidebar-highlight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={user?.avatar_url || undefined} />
                <AvatarFallback>{getInitials(user?.full_name || "User")}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start group relative overflow-hidden"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-5 w-5 group-hover:text-destructive transition-colors" />
            <span className="group-hover:text-destructive transition-colors">Sign Out</span>
            <span className="absolute inset-0 bg-destructive opacity-0 group-hover:opacity-5 transition-opacity duration-300"></span>
          </Button>
        </div>
      </motion.aside>

      {/* Mobile header */}
      <div className="flex w-full flex-col md:ml-64 md:w-[calc(100%-16rem)]">
        <header className="flex h-16 items-center justify-between border-b bg-white dark:bg-gray-800 px-4 md:hidden">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SafeSpace</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </header>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="fixed inset-0 z-50 bg-white dark:bg-gray-800 pt-16 md:hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <nav className="space-y-1 p-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 rounded-md px-3 py-3 text-gray-700 dark:text-gray-200 ${
                        isActive
                          ? "bg-primary/10 text-primary dark:bg-primary/20"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                <div className="pt-4 mt-4 border-t">
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar>
                      <AvatarImage src={user?.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(user?.full_name || "User")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.full_name || "User"}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-5 w-5" />
                    Sign Out
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <motion.main
          className="flex-1 p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </div>
      {user && (
        <NamePromptDialog
          open={namePromptOpen}
          onOpenChange={setNamePromptOpen}
          onComplete={() => {
            // Refresh user data after name is set
            supabase
              .from("users")
              .select("*")
              .eq("id", user.id)
              .single()
              .then(({ data }) => {
                if (data) setUser(data)
              })
          }}
          userId={user.id}
        />
      )}
      <Toaster />
    </div>
  )
}
