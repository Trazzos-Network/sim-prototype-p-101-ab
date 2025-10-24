"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { generateSensorData } from "@/lib/data-generator"
import SensorCharts from "@/components/sensor-charts"
import ControlPanel from "@/components/control-panel"

const MAINTENANCE_FRAME = 84

const PumpScene = dynamic(() => import("@/components/pump-scene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
      <div className="text-white text-lg">Cargando Escena CAD...</div>
    </div>
  ),
})

export default function PumpSimulation() {
  const [data] = useState(() => generateSensorData())
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(0.5)

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= data.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 100 / playbackSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, data.length])

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const handleReset = useCallback(() => {
    setCurrentFrame(0)
    setIsPlaying(false)
  }, [])

  const handleFrameChange = useCallback((frame: number) => {
    setCurrentFrame(frame)
    setIsPlaying(false)
  }, [])

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed)
  }, [])

  const currentData = data[currentFrame]
  const showMaintenance = currentFrame >= MAINTENANCE_FRAME && currentFrame < MAINTENANCE_FRAME + 12

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-[1800px] mx-auto space-y-4">
        {/* Header */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h1 className="text-2xl font-bold text-foreground mb-1">Simulación de Bomba Industrial - P-101 A/B</h1>
          <p className="text-muted-foreground text-sm">
            Visualización interactiva de datos de sensores de 14 días demostrando el valor del mantenimiento predictivo
          </p>
        </div>

        {/* Control Panel */}
        <ControlPanel
          currentFrame={currentFrame}
          totalFrames={data.length}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          currentData={currentData}
          onFrameChange={handleFrameChange}
          onPlayPause={handlePlayPause}
          onSpeedChange={handleSpeedChange}
          onReset={handleReset}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* CAD Scene */}
          <div className="h-[500px] lg:h-[700px] rounded-lg overflow-hidden shadow-xl border border-border">
            <PumpScene
              currentData={currentData}
              showMaintenance={showMaintenance}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              currentFrame={currentFrame} // Pass currentFrame to sync rotation with simulation
            />
          </div>

          {/* Charts */}
          <div className="h-[500px] lg:h-[700px] rounded-lg overflow-hidden shadow-xl border border-border">
            <SensorCharts data={data} currentFrame={currentFrame} onFrameClick={handleFrameChange} />
          </div>
        </div>
      </div>
    </div>
  )
}
