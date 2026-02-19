// "use client"

// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import type React from "react"
// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { loginUser } from "@/lib/api"
// import { saveToken } from "@/lib/auth"
// import { AlertCircle, CheckCircle2, Shield, Zap, Globe, Eye, EyeOff } from "lucide-react"

// export default function Home() {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   })
//   const [error, setError] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [showPassword, setShowPassword] = useState(false)
//   const router = useRouter()

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError("")

//     if (!formData.email || !formData.password) {
//       setError("Email and password required")
//       return
//     }

//     setIsLoading(true)

//     try {
//       const response = await loginUser(formData)

//       if (response.success && response.token) {
//         saveToken(response.token)

//         // Decode JWT to get email
//         const payload = JSON.parse(atob(response.token.split('.')[1]))
//         const userEmail = payload.sub

//         localStorage.setItem("userEmail", userEmail)
//         localStorage.setItem("isLoggedIn", "true")

//         // Redirect to dashboard
//         router.push("/dashboard/client")
//       } else {
//         setError(response.message || "Invalid credentials")
//       }
//     } catch (err: any) {
//       console.error("Login error:", err)
//       setError(err.response?.data?.message || "Invalid credentials")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">

//       {/* Background decorative blobs */}
//       <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
//       <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

//       {/* ─── DESKTOP: full viewport, no scroll ─── */}
//       <div className="hidden lg:flex h-screen items-center relative z-10 max-w-7xl mx-auto px-8 xl:px-12">
//         <div className="flex w-full items-center gap-16 xl:gap-24">

//           {/* Left Side */}
//           <div className="flex-1 space-y-7">
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
//               <Zap className="w-4 h-4" />
//               <span className="text-sm font-semibold tracking-widest">PAYVORA</span>
//             </div>

//             <h1 className="text-5xl xl:text-6xl font-bold leading-tight tracking-tight">
//               <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
//                 Payments Made Simple With One Link
//               </span>
//             </h1>

//             <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg">
//               Secure payment platform for Nigerian freelancers and clients.
//               Receive money from over 20 Countries With a single Link.
//             </p>

//             {/* Feature cards */}
//             <div className="grid grid-cols-3 gap-4">
//               <div className="group space-y-2 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
//                 <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
//                   <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                 </div>
//                 <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Instant</h3>
//                 <p className="text-xs text-slate-500 dark:text-slate-400">Real-time transfers</p>
//               </div>

//               <div className="group space-y-2 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
//                 <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
//                   <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
//                 </div>
//                 <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Secure</h3>
//                 <p className="text-xs text-slate-500 dark:text-slate-400">Bank-grade encryption</p>
//               </div>

//               <div className="group space-y-2 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
//                 <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
//                   <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//                 </div>
//                 <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Global</h3>
//                 <p className="text-xs text-slate-500 dark:text-slate-400">USD to NGN instantly</p>
//               </div>
//             </div>

//             {/* Trust indicators */}
//             <div className="flex items-center gap-6">
//               <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
//                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
//                 <span>KYC Verified</span>
//               </div>
//               <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
//                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
//                 <span>No Hidden Fees</span>
//               </div>
//             </div>
//           </div>

//           {/* Right Side - Login Card */}
//           <div className="w-full max-w-md flex-shrink-0">
//             <Card className="border-slate-200/80 dark:border-slate-700/50 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden">
//               <CardHeader className="space-y-1 pb-4 pt-7 px-7">
//                 <div className="flex items-center gap-2 mb-1">
//                   <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
//                     <Zap className="w-4 h-4 text-primary-foreground" />
//                   </div>
//                   <span className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Payvora</span>
//                 </div>
//                 <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
//                   Welcome back
//                 </CardTitle>
//                 <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
//                   Sign in to your account to continue
//                 </CardDescription>
//               </CardHeader>

//               <CardContent className="pb-7 px-7">
//                 {error && (
//                   <Alert className="mb-4 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 rounded-xl">
//                     <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
//                     <AlertDescription className="text-sm text-red-700 dark:text-red-300 ml-2">
//                       {error}
//                     </AlertDescription>
//                   </Alert>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div className="space-y-1.5">
//                     <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                       Email address
//                     </label>
//                     <Input
//                       id="email"
//                       name="email"
//                       type="email"
//                       placeholder="you@example.com"
//                       value={formData.email}
//                       onChange={handleChange}
//                       disabled={isLoading}
//                       className="h-11 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 transition-all"
//                       required
//                     />
//                   </div>

//                   <div className="space-y-1.5">
//                     <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                       Password
//                     </label>
//                     <div className="relative">
//                       <Input
//                         id="password"
//                         name="password"
//                         type={showPassword ? "text" : "password"}
//                         placeholder="••••••••"
//                         value={formData.password}
//                         onChange={handleChange}
//                         disabled={isLoading}
//                         className="h-11 pr-11 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 transition-all"
//                         required
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
//                         tabIndex={-1}
//                       >
//                         {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                       </button>
//                     </div>
//                   </div>

//                   <Button
//                     type="submit"
//                     size="lg"
//                     className="w-full h-11 text-sm font-semibold rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 mt-1"
//                     disabled={isLoading}
//                   >
//                     {isLoading ? (
//                       <span className="flex items-center gap-2">
//                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                         Signing in...
//                       </span>
//                     ) : (
//                       "Sign In"
//                     )}
//                   </Button>
//                 </form>

//                 <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
//                   <p className="text-center text-sm text-slate-500 dark:text-slate-400">
//                     Don't have an account?{" "}
//                     <Link
//                       href="/auth/signup-client"
//                       className="font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
//                     >
//                       Sign up
//                     </Link>
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>

//       {/* ─── MOBILE: scrollable ─── */}
//       <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 py-4 relative z-10 space-y-6">

//         {/* Brand + headline */}
//         <div className="space-y-3">
//           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
//             <Zap className="w-3.5 h-3.5" />
//             <span className="text-xs font-semibold tracking-widest">PAYVORA</span>
//           </div>

//           <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-center">
//             <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
//               Payments Made Simple With One Link
//             </span>
//           </h1>

//           <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto text-center">
//             Secure payment platform for Nigerian freelancers and clients.
//             Receive money from over 20 Countries With a single Link.
//           </p>
//         </div>

//         {/* Login Card */}
//         <Card className="w-full border-slate-200/80 dark:border-slate-700/50 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden">
//           <CardHeader className="space-y-1 pb-3 pt-6 px-6">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
//                 <Zap className="w-4 h-4 text-primary-foreground" />
//               </div>
//               <span className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Payvora</span>
//             </div>
//             <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
//               Welcome back
//             </CardTitle>
//             <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
//               Sign in to your account to continue
//             </CardDescription>
//           </CardHeader>

//           <CardContent className="pb-6 px-6">
//             {error && (
//               <Alert className="mb-5 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 rounded-xl">
//                 <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
//                 <AlertDescription className="text-sm text-red-700 dark:text-red-300 ml-2">
//                   {error}
//                 </AlertDescription>
//               </Alert>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="space-y-1.5">
//                 <label htmlFor="email-mobile" className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                   Email address
//                 </label>
//                 <Input
//                   id="email-mobile"
//                   name="email"
//                   type="email"
//                   placeholder="you@example.com"
//                   value={formData.email}
//                   onChange={handleChange}
//                   disabled={isLoading}
//                   className="h-11 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 transition-all"
//                   required
//                 />
//               </div>

//               <div className="space-y-1.5">
//                 <label htmlFor="password-mobile" className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Input
//                     id="password-mobile"
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="••••••••"
//                     value={formData.password}
//                     onChange={handleChange}
//                     disabled={isLoading}
//                     className="h-11 pr-11 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 transition-all"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
//                     tabIndex={-1}
//                   >
//                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 </div>
//               </div>

//               <Button
//                 type="submit"
//                 size="lg"
//                 className="w-full h-11 text-sm font-semibold rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 mt-1"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <span className="flex items-center gap-2">
//                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                     Signing in...
//                   </span>
//                 ) : (
//                   "Sign In"
//                 )}
//               </Button>
//             </form>

//             <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
//               <p className="text-center text-sm text-slate-500 dark:text-slate-400">
//                 Don't have an account?{" "}
//                 <Link
//                   href="/auth/signup-client"
//                   className="font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
//                 >
//                   Sign up
//                 </Link>
//               </p>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Mobile Features */}
//         <div className="grid grid-cols-3 gap-3">
//           <div className="flex flex-col items-center text-center space-y-1.5 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
//             <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
//               <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//             </div>
//             <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Instant</h3>
//             <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">Real-time transfers</p>
//           </div>

//           <div className="flex flex-col items-center text-center space-y-1.5 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
//             <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
//               <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
//             </div>
//             <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Secure</h3>
//             <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">Bank-grade encryption</p>
//           </div>

//           <div className="flex flex-col items-center text-center space-y-1.5 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
//             <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
//               <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//             </div>
//             <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Global</h3>
//             <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">USD to NGN instantly</p>
//           </div>
//         </div>

//         {/* Mobile Trust */}
//         <div className="flex items-center justify-center gap-5 pt-2 pb-6 border-t border-slate-200 dark:border-slate-800">
//           <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
//             <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
//             <span>KYC Verified</span>
//           </div>
//           <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
//             <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
//             <span>No Hidden Fees</span>
//           </div>
//         </div>

//       </div>
//     </div>
//   )
// }

/////////////////////////////////////////////////////////////////////////////////////

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
          <span className="text-3xl">🚧</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Deployment in Progress</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm">
          We are currently making a deployment. Please try again in 5 minutes.
        </p>
      </div>
    </div>
  )
}