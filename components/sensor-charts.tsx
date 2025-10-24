"use client"

import { useEffect, useRef } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"
import type { SensorData } from "@/lib/types"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface SensorChartsProps {
  data: SensorData[]
  currentFrame: number
  onFrameClick: (frame: number) => void
}

export default function SensorCharts({ data, currentFrame, onFrameClick }: SensorChartsProps) {
  const chartRefs = [
    useRef<ChartJS<"line">>(null),
    useRef<ChartJS<"line">>(null),
    useRef<ChartJS<"line">>(null),
  ]

  // Update vertical line position
  useEffect(() => {
    chartRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.update("none")
      }
    })
  }, [currentFrame])

  const days = data.map((d) => d.day.toFixed(1))

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    onClick: (_: any, elements: any[]) => {
      if (elements.length > 0) {
        onFrameClick(elements[0].index)
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#2a2a2a",
        titleColor: "#d9d9d9",
        bodyColor: "#d9d9d9",
        borderColor: "#404040",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: "#404040",
        },
        ticks: {
          color: "#d9d9d9",
        },
      },
      y: {
        grid: {
          color: "#404040",
        },
        ticks: {
          color: "#d9d9d9",
        },
      },
    },
  }

  // Vibration Chart
  const vibrationData = {
    labels: days,
    datasets: [
      {
        label: "Vibración (mm/s)",
        data: data.map((d) => d.vibration),
        borderColor: "#70b068",
        backgroundColor: "rgba(112, 176, 104, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
      },
      // Current position marker
      {
        label: "Actual",
        data: data.map((_, i) => (i === currentFrame ? data[currentFrame].vibration : null)),
        borderColor: "#9aff8d",
        backgroundColor: "#9aff8d",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }

  // Pressure Chart
  const pressureData = {
    labels: days,
    datasets: [
      {
        label: "Presión de Succión (bar)",
        data: data.map((d) => d.pressure),
        borderColor: "#7bbff7",
        backgroundColor: "rgba(123, 191, 247, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
      },
      {
        label: "Actual",
        data: data.map((_, i) => (i === currentFrame ? data[currentFrame].pressure : null)),
        borderColor: "#9aff8d",
        backgroundColor: "#9aff8d",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }

  // Motor Current Chart
  const motorCurrentData = {
    labels: days,
    datasets: [
      {
        label: "Corriente del Motor (A)",
        data: data.map((d) => d.motorCurrent),
        borderColor: "#ffe678",
        backgroundColor: "rgba(255, 230, 120, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
      },
      {
        label: "Actual",
        data: data.map((_, i) => (i === currentFrame ? data[currentFrame].motorCurrent : null)),
        borderColor: "#9aff8d",
        backgroundColor: "#9aff8d",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex-1 bg-card rounded-lg p-4 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-2">Vibración (mm/s)</h3>
        <div className="h-[calc(100%-2rem)]">
          <Line ref={chartRefs[0]} data={vibrationData} options={commonOptions} />
        </div>
      </div>

      <div className="flex-1 bg-card rounded-lg p-4 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-2">Presión de Succión (bar)</h3>
        <div className="h-[calc(100%-2rem)]">
          <Line ref={chartRefs[1]} data={pressureData} options={commonOptions} />
        </div>
      </div>

      <div className="flex-1 bg-card rounded-lg p-4 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-2">Corriente del Motor (A)</h3>
        <div className="h-[calc(100%-2rem)]">
          <Line ref={chartRefs[2]} data={motorCurrentData} options={commonOptions} />
        </div>
      </div>
    </div>
  )
}
