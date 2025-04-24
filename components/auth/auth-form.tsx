"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { signInWithGoogle } from "@/lib/auth-helpers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { FaGoogle } from "react-icons/fa"
import { motion } from "framer-motion"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Info } from "lucide-react"
import { ForgotPasswordDialog } from "@/components/auth/forgot-password-dialog"

export function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [userType, setUserType] = useState("")
  const [emergencyContact, setEmergencyContact] = useState("")
  const [emergencyContactError, setEmergencyContactError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("signin")
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Set active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "signup") {
      setActiveTab("signup")
    }
  }, [searchParams])

  // Update the emergency contact field to use email instead of phone number
  // Find the validatePhoneNumber function and replace it with validateEmail
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setEmergencyContactError(null)

    // Validate emergency contact
    if (!emergencyContact) {
      setEmergencyContactError("Emergency contact email is required")
      setLoading(false)
      return
    }

    // Validate email format
    if (!validateEmail(emergencyContact)) {
      setEmergencyContactError("Please enter a valid email address")
      setLoading(false)
      return
    }

    try {
      // Sign up with email and password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType,
            emergency_contact: emergencyContact,
          },
        },
      })

      if (signUpError) throw signUpError

      // Insert user profile data
      if (data.user) {
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email,
          full_name: fullName,
          user_type: userType,
          emergency_contact: emergencyContact,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) throw profileError

        toast({
          title: "Account created successfully!",
          description: "Please sign in with your new credentials.",
        })

        // Automatically switch to sign in tab after successful signup
        setActiveTab("signin")
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign up")
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: "Signed in successfully!",
        description: "Redirecting to dashboard...",
      })

      // Short delay before redirect for better UX
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 1000)
    } catch (error: any) {
      setError(error.message || "An error occurred during sign in")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
      // The redirect happens automatically in the signInWithGoogle function
    } catch (error: any) {
      setError(error.message || "An error occurred during Google sign in")
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
    >
      <Card className="w-full max-w-md mx-auto shadow-lg backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <CardTitle className="text-2xl font-bold">SafeSpace</CardTitle>
              </motion.div>
              <TabsList className="grid grid-cols-2 w-[200px]">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </div>
            <CardDescription className="mt-2">AI-powered safety assistant for your peace of mind</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <TabsContent value="signin">
              <motion.form
                onSubmit={handleSignIn}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button type="submit" className="w-full relative overflow-hidden group" disabled={loading}>
                  <span className="relative z-10">{loading ? "Signing in..." : "Sign In"}</span>
                  <span className="absolute inset-0 bg-primary-foreground opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                </Button>
              </motion.form>
            </TabsContent>

            <TabsContent value="signup">
              <motion.form
                onSubmit={handleSignUp}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userType">I am a</Label>
                  <select
                    id="userType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select user type
                    </option>
                    <option value="student">Student</option>
                    <option value="woman">Woman</option>
                    <option value="elderly">Elderly</option>
                    <option value="traveler">Traveler</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="flex items-center">
                    Emergency Contact (Email)
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="emergencyContact"
                    type="email"
                    placeholder="emergency@example.com"
                    value={emergencyContact}
                    onChange={(e) => {
                      setEmergencyContact(e.target.value)
                      setEmergencyContactError(null)
                    }}
                    required
                    className={`transition-all duration-200 focus:ring-2 focus:ring-primary ${
                      emergencyContactError ? "border-destructive" : ""
                    }`}
                  />
                  {emergencyContactError && <p className="text-sm text-destructive">{emergencyContactError}</p>}
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      This email address will receive emergency alerts. Please ensure it's correct and belongs to
                      someone who can help in an emergency.
                    </AlertDescription>
                  </Alert>
                </div>
                <Button type="submit" className="w-full relative overflow-hidden group" disabled={loading}>
                  <span className="relative z-10">{loading ? "Creating Account..." : "Create Account"}</span>
                  <span className="absolute inset-0 bg-primary-foreground opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                </Button>
              </motion.form>
            </TabsContent>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.5,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full relative overflow-hidden group transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <FaGoogle className="mr-2 text-red-500" />
                  <span>Google</span>
                  <span className="absolute inset-0 bg-primary-foreground opacity-0 group-hover:opacity-5 transition-opacity duration-300"></span>
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Tabs>
      </Card>
      <ForgotPasswordDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
      <Toaster />
    </motion.div>
  )
}
