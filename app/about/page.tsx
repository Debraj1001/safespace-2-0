"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { InteractiveLogo } from "@/components/interactive-logo"
import {
  ChevronLeft,
  Shield,
  Lightbulb,
  Code,
  Search,
  Palette,
  Layout,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Globe,
  ExternalLink,
} from "lucide-react"

export default function AboutPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const teamMembers = [
    {
      name: "Soumen Pore",
      role: "Team Leader [Backend]",
      bio: "I'm Soumen Pore, a first-year Electronics and Communication Engineering student with a keen interest in full-stack development. I have basic coding knowledge in HTML, CSS, JavaScript, and Python. As a team leader, I enjoy collaborating, guiding peers, and learning through projects to strengthen both my technical and leadership skills.",
      icon: <Code className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
      name: "Arpita Halder",
      role: "UI/UX Designer",
      bio: "I'm Arpita Halder, a first-year Computer Science and Business Systems student with a strong interest in UI design. I have basic knowledge of design tools and concepts, and I enjoy assisting in team projects by supporting the team leader and contributing to smooth collaboration. I'm eager to learn and grow both creatively and as a team member.",
      icon: <Palette className="h-10 w-10 text-purple-600 dark:text-purple-400" />,
      iconBg: "bg-purple-100 dark:bg-purple-900/50",
    },
    {
      name: "Debraj Pradhan",
      role: "Frontend Developer",
      bio: "Hi, I'm Debraj Pradhan, a first-year B.Tech in Computer Science and Business Systems (CSBS). I'm passionate about technology and exploring how code can solve real-world problems. Currently focused on web development, I'm building responsive and user-friendly projects to grow as a full-stack developer. I enjoy coding, designing with tools like Figma and Canva, and continuously learning new skills. In my free time, I enjoy web development and gaming.",
      icon: <Layout className="h-10 w-10 text-green-600 dark:text-green-400" />,
      iconBg: "bg-green-100 dark:bg-green-900/50",
    },
    {
      name: "Sayan Paul",
      role: "Researcher",
      bio: "Hi, I'm Sayan, a B.Tech student in Electronics and Communication Engineering from Kolkata with a strong interest in technology that solves real-world problems. I enjoy diving into logical thinking, writing clean and efficient code, and learning how AI can be used to make life simpler and safer. My strengths lie in analytical problem-solving, teamwork, and building systems that are both smart and practical.",
      icon: <Search className="h-10 w-10 text-amber-600 dark:text-amber-400" />,
      iconBg: "bg-amber-100 dark:bg-amber-900/50",
    },
  ]

  const socialLinks = [
    { icon: <Twitter className="h-5 w-5" />, label: "Twitter", href: "#" },
    { icon: <Instagram className="h-5 w-5" />, label: "Instagram", href: "#" },
    { icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn", href: "#" },
    { icon: <Github className="h-5 w-5" />, label: "GitHub", href: "#" },
    { icon: <Globe className="h-5 w-5" />, label: "Portfolio", href: "#" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur theme-transition">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <InteractiveLogo size="sm" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
              SafeSpace
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

      <main className="container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="flex justify-center mb-6">
            <InteractiveLogo size="lg" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200">
            About SafeSpace
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Protecting students, women, the elderly, and travelers with advanced AI technology that works silently in
            the background.
          </p>
        </motion.div>

        <div className="grid gap-12 mb-16">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200">
                  Our Mission
                </h2>
                <p className="text-muted-foreground mb-4">
                  SafeSpace was created with a simple yet powerful mission: to provide an extra layer of security for
                  vulnerable individuals in our society. We believe that everyone deserves to feel safe, whether they're
                  walking home at night, traveling in unfamiliar areas, or simply going about their daily lives.
                </p>
                <p className="text-muted-foreground">
                  By leveraging the power of artificial intelligence, we've developed a personal safety assistant that
                  works silently in the background, ready to detect potential threats and provide assistance when
                  needed.
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <Shield className="h-16 w-16 text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Safety Through Innovation</h3>
                  <p className="text-muted-foreground">
                    Using advanced AI to detect threats and provide real-time safety solutions
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200">
              Key Features
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Text Analysis",
                  description: "AI-powered analysis of messages to detect potential threats and concerning language",
                  icon: <Code className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
                },
                {
                  title: "Audio Monitoring",
                  description: "Detects sounds of distress and automatically alerts your emergency contacts",
                  icon: <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
                },
                {
                  title: "Safe Zones",
                  description: "Set up safe areas and get alerts when you leave them for added peace of mind",
                  icon: <Lightbulb className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
                },
                {
                  title: "Emergency Alerts",
                  description: "One-tap emergency alerts with location sharing to your trusted contacts",
                  icon: <Search className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
                },
              ].map((feature, i) => (
                <Card
                  key={i}
                  className="border border-blue-100 dark:border-blue-900/50 hover:shadow-md transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex justify-center mb-2">{feature.icon}</div>
                    <CardTitle className="text-center">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200">
              How It Works
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8">
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Set Up Your Profile</h3>
                    <p className="text-muted-foreground">
                      Create your account and add emergency contacts who will be notified in case of an alert.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Enable Safety Features</h3>
                    <p className="text-muted-foreground">
                      Choose which safety features you want to activate, such as text analysis, audio monitoring, or
                      safe zones.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">AI Monitors Your Safety</h3>
                    <p className="text-muted-foreground">
                      Our AI technology works in the background, analyzing potential threats and safety concerns.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Instant Alerts When Needed</h3>
                    <p className="text-muted-foreground">
                      If a threat is detected, SafeSpace can automatically alert your emergency contacts with your
                      location and situation details.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            id="team"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200">
                Meet Our Team
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                SafeSpace was created by a passionate team of first-year engineering students dedicated to making the
                world a safer place through technology.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, i) => (
                <Card key={i} className="overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-center mb-4">
                      <div className={`h-24 w-24 rounded-full ${member.iconBg} flex items-center justify-center`}>
                        {member.icon}
                      </div>
                    </div>
                    <CardTitle className="text-center">{member.name}</CardTitle>
                    <CardDescription className="text-center font-medium text-blue-600 dark:text-blue-400">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground mb-4">{member.bio}</p>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-center">
                    <div className="flex space-x-4">
                      {socialLinks.map((link, j) => (
                        <a
                          key={j}
                          href={link.href}
                          className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 transform hover:scale-110"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={link.label}
                        >
                          {link.icon}
                          <span className="sr-only">{link.label}</span>
                        </a>
                      ))}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200">
              Our Vision
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-8">
              We envision a world where technology serves as a guardian, providing peace of mind and protection for
              everyone. SafeSpace is just the beginning of our journey to create innovative solutions that make personal
              safety accessible to all.
            </p>
            <Link href="/login?tab=signup">
              <Button size="lg" className="relative overflow-hidden group">
                <span className="relative z-10">Join SafeSpace Today</span>
                <span className="absolute inset-0 bg-primary-foreground opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              </Button>
            </Link>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Connect With Us</h2>
              <div className="flex justify-center space-x-8">
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 transform hover:scale-110"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="h-12 w-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md">
                      {link.icon}
                    </div>
                    <span className="text-sm font-medium">{link.label}</span>
                  </a>
                ))}
              </div>
              <div className="mt-8 text-center">
                <p className="text-muted-foreground mb-4">Have questions or feedback? We'd love to hear from you!</p>
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>Contact Us</span>
                </Button>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      <footer className="border-t py-8 bg-background">
        <div className="container flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <InteractiveLogo size="sm" />
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
              SafeSpace
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 SafeSpace. Created by Soumen Pore, Arpita Halder, Debraj Pradhan, and Sayan Paul.
          </p>
          <div className="flex gap-4 mt-2">
            <Link href="/" className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400">
              Home
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400">
              About
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
