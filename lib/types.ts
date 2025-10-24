export interface SensorData {
  frame: number
  day: number
  vibration: number
  pressure: number
  motorCurrent: number
  status: "normal" | "warning" | "high" | "critical"
}

export interface SimulationState {
  currentFrame: number
  isPlaying: boolean
  playbackSpeed: number
  data: SensorData[]
}
