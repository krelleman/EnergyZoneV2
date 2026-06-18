// components/ColorTagDetector.tsx
'use client'

import { useState, useRef } from 'react'
import ColorThief from 'color-thief-browser'

interface ColorTagDetectorProps {
  onColorTagsDetected: (tags: string[]) => void
}

const colorNames: Record<string, [number, number, number]> = {
  rød: [255, 0, 0],
  grøn: [0, 128, 0],
  blå: [0, 0, 255],
  sort: [0, 0, 0],
  hvid: [255, 255, 255],
  gul: [255, 255, 0],
  orange: [255, 165, 0],
  lilla: [128, 0, 128],
  pink: [255, 192, 203],
  brun: [165, 42, 42],
  grå: [128, 128, 128],
  cyan: [0, 255, 255],
  magenta: [255, 0, 255],
  neon: [57, 255, 20],
  sølv: [192, 192, 192],
  guld: [255, 215, 0],
}

function rgbToColorName(r: number, g: number, b: number): string {
  let closest = 'ukendt'
  let minDist = Infinity

  for (const [name, rgb] of Object.entries(colorNames)) {
    const dist = Math.sqrt(
      Math.pow(r - rgb[0], 2) +
      Math.pow(g - rgb[1], 2) +
      Math.pow(b - rgb[2], 2)
    )
    if (dist < minDist) {
      minDist = dist
      closest = name
    }
  }

  return closest
}

export default function ColorTagDetector({ onColorTagsDetected }: ColorTagDetectorProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [detected, setDetected] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setPreview(imageUrl)
      analyzeColors(imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const analyzeColors = (imageUrl: string) => {
    setIsAnalyzing(true)

    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = imageUrl

    img.onload = () => {
      try {
        const colorThief = new ColorThief()
        const palette = colorThief.getPalette(img, 5)

        const colors = palette
          .map(([r, g, b]) => rgbToColorName(r, g, b))
          .filter((name) => name !== 'ukendt')
          .slice(0, 2)

        setDetected(colors)
        onColorTagsDetected(colors)
      } catch (error) {
        console.error('Farveanalyse fejlede:', error)
      } finally {
        setIsAnalyzing(false)
      }
    }

    img.onerror = () => {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-xl">
      <div className="text-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
        >
          📤 Vælg billede til farveanalyse
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {preview && (
        <div className="flex flex-col items-center gap-4">
          <img
            src={preview}
            alt="Preview"
            className="max-w-[200px] max-h-[200px] object-contain rounded-lg border"
          />

          {isAnalyzing ? (
            <p className="text-gray-400">Analyserer farver...</p>
          ) : detected.length > 0 ? (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium">🎨 Dominante farver:</span>
              {detected.map((color: string) => (
                <span
                  key={color}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 border"
                >
                  #{color}
                </span>
              ))}
              <button
                onClick={() => {
                  setDetected([])
                  onColorTagsDetected([])
                  setPreview(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Fjern
              </button>
            </div>
          ) : (
            <p className="text-red-500 text-sm">Kunne ikke detektere farver. Prøv et andet billede.</p>
          )}
        </div>
      )}
    </div>
  )
}