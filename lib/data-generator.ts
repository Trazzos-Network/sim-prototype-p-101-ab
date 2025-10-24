import type { SensorData } from "./types"

const TOTAL_FRAMES = 336 // 14 days * 24 hours
const MAINTENANCE_FRAME = 84 // Day 3.5

// Vibration thresholds (mm/s)
const VIBRATION_NORMAL = 3.5
const VIBRATION_WARNING = 4.0
const VIBRATION_HIGH = 4.5

export function generateSensorData(): SensorData[] {
  const data: SensorData[] = []

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const day = frame / 24

    // Generate vibration with degradation pattern
    const vibration = generateVibration(frame)

    // Generate pressure (inverse correlation with vibration)
    const pressure = generatePressure(vibration, frame)

    // Generate motor current (slight positive correlation)
    const motorCurrent = generateMotorCurrent(vibration, frame)

    // Determine status based on vibration
    const status = getStatus(vibration)

    data.push({
      frame,
      day,
      vibration,
      pressure,
      motorCurrent,
      status,
    })
  }

  return data
}

function generateVibration(frame: number): number {
  // Before maintenance (frames 0-83): degradation from 3.0 to 4.8
  if (frame < MAINTENANCE_FRAME) {
    const progress = frame / MAINTENANCE_FRAME
    const baseValue = 3.0 + 1.8 * progress // Linear degradation
    const noise = (Math.random() - 0.5) * 0.15 // ±0.075 noise
    return Math.max(2.8, baseValue + noise)
  }

  // After maintenance (frames 84-335): recovery and slow degradation
  const framesSinceMaintenance = frame - MAINTENANCE_FRAME
  const totalPostMaintenanceFrames = TOTAL_FRAMES - MAINTENANCE_FRAME
  const progress = framesSinceMaintenance / totalPostMaintenanceFrames

  // Start at 3.0, slowly degrade to 3.6 by end
  const baseValue = 3.0 + 0.6 * progress
  const noise = (Math.random() - 0.5) * 0.12

  return Math.max(2.8, baseValue + noise)
}

function generatePressure(vibration: number, frame: number): number {
  // Inverse correlation: higher vibration = lower pressure
  // Normal pressure ~0.9 bar, degraded ~0.68 bar

  if (frame < MAINTENANCE_FRAME) {
    // Before maintenance: pressure decreases as vibration increases
    const basePressure = 1.05 - (vibration - 3.0) * 0.2
    const noise = (Math.random() - 0.5) * 0.03
    return Math.max(0.65, Math.min(1.0, basePressure + noise))
  }

  // After maintenance: improved pressure
  const basePressure = 1.05 - (vibration - 3.0) * 0.15
  const noise = (Math.random() - 0.5) * 0.025
  return Math.max(0.85, Math.min(1.0, basePressure + noise))
}

function generateMotorCurrent(vibration: number, frame: number): number {
  // Slight positive correlation with vibration
  // Normal ~45A, degraded ~48A

  const baseCurrent = 44.0 + (vibration - 3.0) * 1.5
  const noise = (Math.random() - 0.5) * 0.8

  return Math.max(43.0, Math.min(50.0, baseCurrent + noise))
}

function getStatus(vibration: number): "normal" | "warning" | "high" | "critical" {
  if (vibration < VIBRATION_NORMAL) {
    return "normal"
  } else if (vibration < VIBRATION_WARNING) {
    return "warning"
  } else if (vibration < VIBRATION_HIGH) {
    return "high"
  } else {
    return "critical"
  }
}

export function getStatusColor(status: "normal" | "warning" | "high" | "critical"): string {
  switch (status) {
    case "normal":
      return "#22c55e" // green
    case "warning":
      return "#eab308" // yellow
    case "high":
      return "#f97316" // orange
    case "critical":
      return "#ef4444" // red
  }
}
