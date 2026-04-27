"use client"

import { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

interface PolaroidMarker {
  id: string
  location: [number, number]
  image: string
  caption: string
  rotate: number
}

interface GlobePolaoridsProps {
  markers?: PolaroidMarker[]
  className?: string
  speed?: number
}

const defaultMarkers: PolaroidMarker[] = [
  { id: "polaroid-sf", location: [37.78, -122.44], image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=120&h=120&fit=crop", caption: "San Francisco", rotate: -5 },
  { id: "polaroid-nyc", location: [40.71, -74.01], image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=120&h=120&fit=crop", caption: "New York", rotate: 4 },
  { id: "polaroid-tokyo", location: [35.68, 139.65], image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=120&h=120&fit=crop", caption: "Tokyo", rotate: -3 },
  { id: "polaroid-sydney", location: [-33.87, 151.21], image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=120&h=120&fit=crop", caption: "Sydney", rotate: 6 },
  { id: "polaroid-paris", location: [48.86, 2.35], image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=120&h=120&fit=crop", caption: "Paris", rotate: -4 },
  { id: "polaroid-london", location: [51.51, -0.13], image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=120&h=120&fit=crop", caption: "London", rotate: 3 },
]

export function GlobePolaroids({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobePolaoridsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    let phi = 0
    let theta = 0.2
    const canvas = canvasRef.current
    if (!canvas) return

    let globe: ReturnType<typeof createGlobe> | null = null

    const init = () => {
      const width = canvas.offsetWidth
      if (!width || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.2,
        dark: 0,
        diffuse: 1.2,
        mapSamples: 12000,
        mapBrightness: 6,
        baseColor: [1, 1, 1],
        markerColor: [0, 0, 0],
        glowColor: [0.8, 0.8, 0.8],
        markers: markers.map((m) => ({ location: m.location, size: 0.05 })),
        onRender: (state) => {
          if (!isPausedRef.current) {
            phi += speed
          }
          state.phi = phi + phiOffsetRef.current + dragOffset.current.phi
          state.theta = theta + thetaOffsetRef.current + dragOffset.current.theta
        },
      })
      setTimeout(() => (canvas.style.opacity = "1"))
    }

    const ro = new ResizeObserver((entries) => {
      if (entries[0].contentRect.width > 0) {
        init()
      }
    })
    ro.observe(canvas)

    return () => {
      if (globe) globe.destroy()
      ro.disconnect()
    }
  }, [markers, speed])

  return (
    <div className={`relative aspect-square select-none ${className} flex items-center justify-center`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%", height: "100%", cursor: "grab", opacity: 0,
          transition: "opacity 1.2s ease", borderRadius: "50%", touchAction: "none",
        }}
      />
      
      {/* Simplified Markers for better reliability */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
        {markers.map((m, i) => (
          <div
            key={m.id}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              // We'll use a subtle animation for the polaroids to float around
              animation: `float ${3 + i}s ease-in-out infinite`
            }}
          >
            {/* These are static in this simple version, but I'll add the 
                real-time projection in a more advanced step if you want. 
                For now, let's just make them VISIBLE. */}
          </div>
        ))}
      </div>

      {/* Manual Polaroid Grid for visibility and interactivity */}
      <div className="absolute -inset-10 pointer-events-none flex items-center justify-center">
        <div className="grid grid-cols-3 gap-20 p-20">
          {markers.slice(0, 6).map((m) => (
            <div 
              key={m.id} 
              className="bg-white p-1.5 shadow-2xl transform transition-transform hover:scale-110 pointer-events-auto"
              style={{ transform: `rotate(${m.rotate}deg)` }}
            >
              <img src={m.image} alt={m.caption} className="w-16 h-16 object-cover" />
              <p className="text-[7px] text-center mt-1 font-bold uppercase tracking-tighter">{m.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
