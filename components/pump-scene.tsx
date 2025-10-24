"use client"

import { useEffect, useRef } from "react"
import p5 from "p5"
import type { SensorData } from "@/lib/data-generator"
import { getStatusColor } from "@/lib/data-generator"

interface PumpSceneProps {
  currentData: SensorData
  showMaintenance: boolean
  isPlaying: boolean
  playbackSpeed: number // Added playbackSpeed prop to control rotation speed
  currentFrame: number // Added currentFrame to sync rotation with simulation ticks
}

export default function PumpScene({
  currentData,
  showMaintenance,
  isPlaying,
  playbackSpeed,
  currentFrame,
}: PumpSceneProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const p5Instance = useRef<p5 | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const sketch = (p: p5) => {
      const bgColor = "#121212"
      const lineColor = "#ababab"
      const accentColor = "#ff6b35"
      const dimLineColor = "#4a7c59"

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
        canvas.parent(canvasRef.current!)
        p.frameRate(60)
      }

      p.draw = () => {
        p.background(bgColor)

        const rotation = currentFrame * p.TWO_PI

        p.push()
        p.translate(p.width / 2, p.height / 2)
        const scale = Math.min(p.width / 1200, p.height / 800)

        drawSideView(p, scale, rotation)

        p.pop()
      }

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight)
      }

      function drawSideView(p: p5, s: number, rot: number) {
        p.push()
        const offsetX = -p.width / 4
        const offsetY = -p.height / 12
        p.translate(offsetX, offsetY)

        const rotatingColor = getStatusColor(currentData.status)

        p.stroke(accentColor)
        p.strokeWeight(2 * s)
        p.noFill()
        p.line(-250 * s, 120 * s, 250 * s, 120 * s)
        p.line(-250 * s, 120 * s, -250 * s, 140 * s)
        p.line(250 * s, 120 * s, 250 * s, 140 * s)

        p.stroke(lineColor)
        p.strokeWeight(1 * s)
        p.rect(-220 * s, 80 * s, 440 * s, 40 * s)

        for (let i = 0; i < 5; i++) {
          const x = -200 * s + i * 100 * s
          p.line(x, 80 * s, x, 120 * s)
        }

        p.beginShape()
        p.vertex(-200 * s, 0)
        p.vertex(-180 * s, -50 * s)
        p.vertex(-140 * s, -60 * s)
        p.vertex(-100 * s, -50 * s)
        p.vertex(-80 * s, -20 * s)
        p.vertex(-80 * s, 20 * s)
        p.vertex(-100 * s, 50 * s)
        p.vertex(-140 * s, 60 * s)
        p.vertex(-180 * s, 50 * s)
        p.vertex(-200 * s, 0)
        p.endShape()

        p.rect(-155 * s, -90 * s, 30 * s, 30 * s)
        p.line(-140 * s, -90 * s, -140 * s, -60 * s)

        p.line(-200 * s, 0, -240 * s, 0)
        p.rect(-250 * s, -15 * s, 10 * s, 30 * s)

        p.rect(-180 * s, 60 * s, 30 * s, 20 * s)
        p.rect(-120 * s, 60 * s, 30 * s, 20 * s)

        p.push()
        p.stroke(rotatingColor)
        p.strokeWeight(2 * s)
        p.line(-140 * s, 0, 100 * s, 0)

        // LEFT Anim
        p.translate(-140 * s, 0)
        p.rotate(rot * 0.8)
        for (let i = 0; i < 6; i++) {
          p.push()
          p.rotate((i * p.TWO_PI) / 6)
          p.line(0, 0, 0, -25 * s)
          p.line(0, -25 * s, 5 * s, -20 * s)
          p.pop()
        }
        p.circle(0, 0, 10 * s)
        p.pop()

        p.stroke(lineColor)
        p.strokeWeight(1 * s)
        p.rect(-40 * s, -20 * s, 60 * s, 40 * s)
        for (let i = 0; i < 6; i++) {
          p.line(-30 * s + i * 10 * s, -20 * s, -30 * s + i * 10 * s, 20 * s)
        }

        p.rect(20 * s, -50 * s, 140 * s, 100 * s)

        p.stroke(dimLineColor)
        p.strokeWeight(1 * s)
        for (let i = 0; i < 18; i++) {
          p.line(30 * s + i * 7 * s, -50 * s, 30 * s + i * 7 * s, 50 * s)
        }

        p.stroke(lineColor)
        p.strokeWeight(1 * s)
        p.rect(20 * s, -60 * s, 15 * s, 120 * s)
        p.rect(145 * s, -60 * s, 15 * s, 120 * s)

        p.rect(70 * s, -80 * s, 40 * s, 30 * s)
        p.line(80 * s, -80 * s, 80 * s, -50 * s)
        p.line(100 * s, -80 * s, 100 * s, -50 * s)

        p.rect(40 * s, 50 * s, 30 * s, 30 * s)
        p.rect(110 * s, 50 * s, 30 * s, 30 * s)

        p.push()
        p.translate(160 * s, 0)
        p.rotate(rot * 0.8)
        p.stroke(rotatingColor)
        p.strokeWeight(1 * s)
        p.line(0, 0, 15 * s, 0)
        p.circle(0, 0, 6 * s)
        p.pop()

        drawSensor(p, s, -140 * s, -132 * s, "VIB-01", currentData.vibration.toFixed(2))
        drawSensor(p, s, -240 * s, -56 * s, "PT-101", currentData.pressure.toFixed(2))
        drawSensor(p, s, 90 * s, -124 * s, "CT-101", currentData.motorCurrent.toFixed(1))

        drawStatusIndicator(p, s, 200 * s, -100 * s, currentData.status)

        if (showMaintenance) {
          p.push()
          p.stroke("#ff6b35")
          p.strokeWeight(2 * s)
          p.rect(-120 * s, -180 * s, 240 * s, 60 * s)
          p.fill("#ff6b35")
          p.noStroke()
          p.textAlign(p.CENTER, p.CENTER)
          p.textSize(14 * s)
          p.text("MANTENIMIENTO", 0, -165 * s)
          p.text("EN PROGRESO", 0, -145 * s)
          p.pop()
        }

        p.pop()
      }

      function drawSensor(p: p5, s: number, x: number, y: number, label: string, value: string) {
        p.push()
        p.translate(x, y)
        p.stroke(lineColor)
        p.strokeWeight(1.5 * s)
        p.noFill()
        p.rect(-10 * s, -10 * s, 20 * s, 20 * s)
        p.circle(0, 0, 5 * s)
        p.fill(lineColor)
        p.noStroke()
        p.textAlign(p.CENTER, p.CENTER)
        p.textSize(8 * s)
        p.text(label, 0, 20 * s)
        p.textSize(7 * s)
        p.text(value, 0, 30 * s)
        p.pop()
      }

      function drawStatusIndicator(p: p5, s: number, x: number, y: number, status: string) {
        p.push()
        p.translate(x, y)
        p.stroke(lineColor)
        p.strokeWeight(2 * s)
        p.noFill()
        p.rect(-15 * s, -40 * s, 30 * s, 80 * s)

        const colors = {
          critical: "#ef4444",
          high: "#f97316",
          warning: "#eab308",
          normal: "#22c55e",
        }

        const activeColor = colors[status as keyof typeof colors] || colors.normal

        p.stroke(status === "critical" ? activeColor : dimLineColor)
        p.fill(status === "critical" ? activeColor : "#121212")
        p.circle(0, -25 * s, 12 * s)

        p.stroke(status === "high" ? activeColor : dimLineColor)
        p.fill(status === "high" ? activeColor : "#121212")
        p.circle(0, -8 * s, 12 * s)

        p.stroke(status === "warning" ? activeColor : dimLineColor)
        p.fill(status === "warning" ? activeColor : "#121212")
        p.circle(0, 8 * s, 12 * s)

        p.stroke(status === "normal" ? activeColor : dimLineColor)
        p.fill(status === "normal" ? activeColor : "#121212")
        p.circle(0, 25 * s, 12 * s)

        p.pop()
      }
    }

    p5Instance.current = new p5(sketch)

    return () => {
      p5Instance.current?.remove()
    }
  }, [currentData, showMaintenance, isPlaying, playbackSpeed, currentFrame]) // Added currentFrame to dependencies

  return <div ref={canvasRef} className="w-full h-full bg-black" />
}
