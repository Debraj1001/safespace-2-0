"use client"

import { motion } from "framer-motion"
import { InteractiveLogo } from "@/components/interactive-logo"

export function LoadingAnimation() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <InteractiveLogo size="lg" />
        <motion.div className="h-1 w-40 bg-blue-100 dark:bg-blue-900 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-600 dark:bg-blue-400"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </motion.div>
        <motion.p
          className="text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          Loading SafeSpace...
        </motion.p>
      </motion.div>
    </div>
  )
}
