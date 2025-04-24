"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { InteractiveLogo } from "@/components/interactive-logo"
import { ChevronLeft, Code, Palette, Shield, Settings } from "lucide-react"

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur theme-transition">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <InteractiveLogo size="sm" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
              SafeSpace Guide
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200">
            SafeSpace Implementation Guide
          </h1>
          <p className="text-muted-foreground text-lg">
            A comprehensive guide to the enhanced UI with interactive elements and theme toggle
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 md:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="theme">Theme Toggle</TabsTrigger>
            <TabsTrigger value="logo">Interactive Logo</TabsTrigger>
            <TabsTrigger value="animations">Animations</TabsTrigger>
            <TabsTrigger value="auth">Google Auth</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Overview of Enhancements</CardTitle>
                <CardDescription>Key improvements made to the SafeSpace UI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Blue/Sky Color Scheme</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Updated color palette with blue and sky tones for a fresh, trustworthy appearance in both light
                      and dark modes.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Interactive Logo</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enhanced logo with mouse tracking, particle effects, and dynamic animations for an engaging user
                      experience.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Smooth Animations</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Added subtle animations throughout the UI for a more polished and professional feel.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Theme Toggle</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Fixed theme toggle functionality with smooth transitions between light and dark modes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme Toggle Implementation</CardTitle>
                <CardDescription>How the theme toggle works and troubleshooting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-medium">Key Components</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>
                    <code>ThemeProvider</code> from next-themes in app/layout.tsx
                  </li>
                  <li>
                    <code>ThemeToggle</code> component with client-side hydration handling
                  </li>
                  <li>CSS variables in globals.css for theme colors</li>
                </ul>

                <h3 className="font-medium mt-4">Common Issues Fixed</h3>
                <div className="space-y-2">
                  <div className="rounded-md bg-muted p-3">
                    <p className="font-medium">Hydration Mismatch</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Fixed by using the mounted state pattern to ensure the toggle only renders after client-side
                      hydration.
                    </p>
                  </div>

                  <div className="rounded-md bg-muted p-3">
                    <p className="font-medium">Theme Persistence</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ensured theme persists across page refreshes by properly configuring ThemeProvider.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Logo Implementation</CardTitle>
                <CardDescription>How the animated logo works and customization options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center mb-6">
                  <InteractiveLogo size="lg" />
                </div>

                <h3 className="font-medium">Animation Features</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>3D rotation that follows mouse movement</li>
                  <li>Particle effects that emanate on hover</li>
                  <li>Pulsing glow effects with color transitions</li>
                  <li>Rotating rings with varying speeds</li>
                  <li>Responsive sizing options (sm, md, lg, xl)</li>
                </ul>

                <h3 className="font-medium mt-4">Customization Options</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-md bg-muted p-3">
                    <p className="font-medium">Size Variants</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose from sm (48px), md (64px), lg (96px), or xl (128px) sizes to fit different UI contexts.
                    </p>
                  </div>

                  <div className="rounded-md bg-muted p-3">
                    <p className="font-medium">Interactive Mode</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Toggle interactive={"{true|false}"} to enable or disable mouse interaction effects.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="animations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Animation Enhancements</CardTitle>
                <CardDescription>Smooth animations and transitions throughout the UI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-medium">Animation Libraries</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-md bg-muted p-3">
                    <p className="font-medium">Framer Motion</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Used for complex animations, transitions, and gesture interactions throughout the UI.
                    </p>
                  </div>

                  <div className="rounded-md bg-muted p-3">
                    <p className="font-medium">Tailwind Animations</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Utilized for simpler animations like float, pulse-soft, and rotate-slow via custom classes.
                    </p>
                  </div>
                </div>

                <h3 className="font-medium mt-4">Key Animation Features</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>Staggered entrance animations for UI elements</li>
                  <li>Smooth page transitions with opacity and movement</li>
                  <li>Interactive hover effects with spring physics</li>
                  <li>Particle animations in the hero section background</li>
                  <li>Theme transition effects for color changes</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Google Authentication Guide</CardTitle>
                <CardDescription>Step-by-step implementation of Google Auth with Supabase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4 mb-4">
                  <p className="font-medium text-blue-700 dark:text-blue-300">
                    Your SafeSpace application is already connected to Supabase. Follow these steps to implement Google
                    Authentication.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted p-3 border-b flex items-center justify-between">
                      <h3 className="font-medium">Step 1: Create a Google Cloud Project</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                        Required
                      </span>
                    </div>
                    <div className="p-4 space-y-2 text-sm">
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Go to the Google Cloud Console</li>
                        <li>Click on the project dropdown at the top of the page and select "New Project"</li>
                        <li>Name your project "SafeSpace" and click "Create"</li>
                        <li>Once created, select your new project from the dropdown</li>
                      </ol>
                    </div>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted p-3 border-b flex items-center justify-between">
                      <h3 className="font-medium">Step 2: Configure OAuth Consent Screen</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                        Required
                      </span>
                    </div>
                    <div className="p-4 space-y-2 text-sm">
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>In the left sidebar, navigate to "APIs & Services" &gt; "OAuth consent screen"</li>
                        <li>Select "External" user type (unless you have a Google Workspace)</li>
                        <li>Fill in the required information</li>
                        <li>Add the scopes: email, profile, and openid</li>
                      </ol>
                    </div>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted p-3 border-b flex items-center justify-between">
                      <h3 className="font-medium">Step 3: Create OAuth Client ID</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                        Required
                      </span>
                    </div>
                    <div className="p-4 space-y-2 text-sm">
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>In the left sidebar, navigate to "APIs & Services" > "Credentials"</li>
                        <li>Click "Create Credentials" > "OAuth client ID"</li>
                        <li>Select "Web application" as the application type</li>
                        <li>Add authorized origins and redirect URIs</li>
                        <li>Save your Client ID and Client Secret</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
