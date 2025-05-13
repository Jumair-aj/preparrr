import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useTheme } from "../context/theme-context"
import { Button } from "../components/ui/button"
import { Sun, Moon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  velocity: {
    x: number
    y: number
  }
  opacity: number
  rotation: number
  rotationSpeed: number
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  const handleToggle = () => {
    if (isAnimating) return

    // Get button position for animation origin
    const buttonRect = buttonRef.current?.getBoundingClientRect()
    if (!buttonRect) return

    // Create explosion particles
    const centerX = buttonRect.left + buttonRect.width / 2
    const centerY = buttonRect.top + buttonRect.height / 2

    const newParticles: Particle[] = []
    const particleCount = 100

    // Generate particles
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 5
      const distance = 5 + Math.random() * 15

      newParticles.push({
        id: i,
        x: centerX,
        y: centerY,
        size: 3 + Math.random() * 8,
        color:
          theme === "dark"
            ? `hsl(${40 + Math.random() * 60}, ${80 + Math.random() * 20}%, ${70 + Math.random() * 30}%)`
            : `hsl(${210 + Math.random() * 30}, ${80 + Math.random() * 20}%, ${40 + Math.random() * 30}%)`,
        velocity: {
          x: Math.cos(angle) * speed * distance,
          y: Math.sin(angle) * speed * distance,
        },
        opacity: 1,
        rotation: Math.random() * 360,
        rotationSpeed: -5 + Math.random() * 10,
      })
    }

    setParticles(newParticles)
    setIsAnimating(true)

    // Toggle theme after a short delay
    setTimeout(() => {
      toggleTheme()
      setTimeout(() => {
        setIsAnimating(false)
        setParticles([])
      }, 1000)
    }, 300)
  }

  // Animation loop for particles
  useEffect(() => {
    if (!isAnimating || particles.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    // Set canvas to full screen
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const updatedParticles = particles
        .map((particle) => {
          // Update position
          const x = particle.x + particle.velocity.x
          const y = particle.y + particle.velocity.y

          // Update velocity (add some gravity and friction)
          const velocity = {
            x: particle.velocity.x * 0.98,
            y: particle.velocity.y * 0.98 + 0.1,
          }

          // Update opacity (fade out)
          const opacity = particle.opacity - 0.01

          // Update rotation
          const rotation = particle.rotation + particle.rotationSpeed

          // Draw particle
          ctx.save()
          ctx.globalAlpha = opacity
          ctx.translate(x, y)
          ctx.rotate((rotation * Math.PI) / 180)

          // Draw different shapes for variety
          if (particle.id % 3 === 0) {
            // Star
            ctx.fillStyle = particle.color
            ctx.beginPath()
            for (let i = 0; i < 5; i++) {
              const starAngle = (i * Math.PI * 2) / 5 - Math.PI / 2
              const x = Math.cos(starAngle) * particle.size
              const y = Math.sin(starAngle) * particle.size
              if (i === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)

              const innerAngle = starAngle + Math.PI / 5
              const innerX = Math.cos(innerAngle) * (particle.size / 2)
              const innerY = Math.sin(innerAngle) * (particle.size / 2)
              ctx.lineTo(innerX, innerY)
            }
            ctx.closePath()
            ctx.fill()
          } else if (particle.id % 3 === 1) {
            // Circle
            ctx.fillStyle = particle.color
            ctx.beginPath()
            ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
            ctx.fill()
          } else {
            // Square
            ctx.fillStyle = particle.color
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
          }

          ctx.restore()

          return {
            ...particle,
            x,
            y,
            velocity,
            opacity,
            rotation,
          }
        })
        .filter((particle) => particle.opacity > 0)

      setParticles(updatedParticles)

      if (updatedParticles.length > 0) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, particles])

  return (
    <>
      <Button
        ref={buttonRef}
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className="relative overflow-hidden transition-all duration-300 hover:scale-110"
        disabled={isAnimating}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 2, opacity: 0, rotate: 180 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
            className="relative z-10"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-yellow-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Glow effect */}
        <motion.div
          animate={{
            boxShadow: isAnimating
              ? theme === "dark"
                ? "0 0 40px 20px rgba(250, 204, 21, 0.7)"
                : "0 0 40px 20px rgba(79, 70, 229, 0.7)"
              : "0 0 0px 0px rgba(0, 0, 0, 0)",
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-md z-0"
        />
      </Button>

      {/* Full screen canvas for particles */}
      {isAnimating && (
        <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ mixBlendMode: "screen" }} />
      )}

      {/* Full screen flash effect */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 pointer-events-none z-40 ${theme === "dark" ? "bg-yellow-400" : "bg-indigo-600"}`}
          />
        )}
      </AnimatePresence>
    </>
  )
}
