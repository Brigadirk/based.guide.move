"use client"

import { ReactNode } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { useEffect, useRef } from "react"

interface SlideInProps {
  children: ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right"
}

export function SlideIn({ children, delay = 0, direction = "up" }: SlideInProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })
  const controls = useAnimation()

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [inView, controls])

  let x = 0, y = 0
  if (direction === "up") y = 40
  if (direction === "down") y = -40
  if (direction === "left") x = 40
  if (direction === "right") x = -40

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, x, y },
        visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.7, delay } },
      }}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  )
} 