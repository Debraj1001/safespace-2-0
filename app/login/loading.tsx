import { Loader } from "@/components/ui/loader"

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
      <div className="w-full max-w-md flex flex-col items-center justify-center">
        <div className="flex items-center justify-center h-[400px] w-full bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    </div>
  )
}
