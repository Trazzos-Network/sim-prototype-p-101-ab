"use client"

import { Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { SensorData } from "@/lib/types"

interface ControlPanelProps {
  currentFrame: number
  totalFrames: number
  isPlaying: boolean
  playbackSpeed: number
  currentData: SensorData
  onFrameChange: (frame: number) => void
  onPlayPause: () => void
  onSpeedChange: (speed: number) => void
  onReset: () => void
}

export default function ControlPanel({
  currentFrame,
  totalFrames,
  isPlaying,
  playbackSpeed,
  currentData,
  onFrameChange,
  onPlayPause,
  onSpeedChange,
  onReset,
}: ControlPanelProps) {
  const speedOptions = [0.05, 0.1, 0.5, 1, 2, 4]

  return (
    <div className="bg-card rounded-lg p-4 space-y-4 border border-border">
      {/* Timeline Scrubber */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-foreground">
          <span>Día {currentData.day.toFixed(2)}</span>
          <span>
            Cuadro {currentFrame} / {totalFrames - 1}
          </span>
        </div>
        <Slider
          value={[currentFrame]}
          min={0}
          max={totalFrames - 1}
          step={1}
          onValueChange={(value) => onFrameChange(value[0])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Día 0</span>
          <span className="text-[#ffe678]">Día 3.5 (Mantenimiento)</span>
          <span>Día 14</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <Button onClick={onPlayPause} variant="default" size="sm" className="flex items-center gap-2">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? "Pausar" : "Reproducir"}
        </Button>

        <Button onClick={onReset} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-foreground">Velocidad:</span>
          {speedOptions.map((speed) => (
            <Button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              variant={playbackSpeed === speed ? "default" : "outline"}
              size="sm"
              className="w-12"
            >
              {speed}x
            </Button>
          ))}
        </div>
      </div>

      {/* Statistics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Vibración</div>
          <div className="text-lg font-semibold text-[#70b068]">{currentData.vibration.toFixed(2)} mm/s</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Presión</div>
          <div className="text-lg font-semibold text-[#7bbff7]">{currentData.pressure.toFixed(2)} bar</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Corriente del Motor</div>
          <div className="text-lg font-semibold text-[#ffe678]">{currentData.motorCurrent.toFixed(1)} A</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Estado</div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                currentData.status === "normal"
                  ? "bg-[#9aff8d]"
                  : currentData.status === "warning"
                    ? "bg-[#ffe678]"
                    : "bg-[#fa7979]"
              }`}
            />
            <span className="text-sm font-semibold capitalize text-foreground">
              {currentData.status === "normal"
                ? "Normal"
                : currentData.status === "warning"
                  ? "Advertencia"
                  : currentData.status === "high"
                    ? "Alto"
                    : "Crítico"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
