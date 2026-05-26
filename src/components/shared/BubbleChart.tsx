import { clx } from '@govtechmy/myds-react/utils'
import { ResponsiveCirclePacking } from '@nivo/circle-packing'
import { useMemo } from 'react'

export interface BubbleChartData {
  id: string
  value: number
}

interface BubbleChartProps {
  className?: string
  data: BubbleChartData[]
}

const BubbleChart = ({ className, data }: BubbleChartProps) => {
  const _data = useMemo(() => {
    return {
      id: 'root',
      children: data,
    }
  }, [data])

  return (
    <div className={clx('min-h-[400px] w-full', className)}>
      <ResponsiveCirclePacking
        data={_data}
        colors={(node) => {
          if (node.radius > 100) return '#3A75F6'
          if (node.radius > 60) return '#6394FF'
          if (node.radius > 40) return '#96B7FF'
          if (node.radius > 25) return '#C2D5FF'
          else return '#DBEAFE'
        }}
        padding={4}
        leavesOnly
        enableLabels
        label="id"
        labelComponent={({ label, node }) => {
          // 1. Determine your preferred target sizes based on your original logic
          const preferredFontSize =
            node.radius > 100
              ? 24 // Fixed from 1px
              : node.radius > 60
                ? 20 // Fixed from 1px
                : node.radius > 40
                  ? 18
                  : node.radius > 35
                    ? 16
                    : node.radius > 30
                      ? 12
                      : node.radius > 25
                        ? 10
                        : node.radius > 20
                          ? 9
                          : 8

          const preferredValueSize =
            node.radius > 100
              ? 16
              : node.radius > 60
                ? 12
                : node.radius > 40
                  ? 10
                  : node.radius > 30
                    ? 9
                    : node.radius > 25
                      ? 8
                      : 6

          const preferredDy =
            node.radius > 100
              ? 32
              : node.radius > 60
                ? 24
                : node.radius > 40
                  ? 20
                  : node.radius > 30
                    ? 16
                    : node.radius > 25
                      ? 12
                      : 10

          // 2. Calculate the maximum safe size to prevent overflow
          const textLength = String(label).length
          const maxSafeFontSize = (node.radius * 2.8) / textLength

          // 3. Use the preferred size, UNLESS it exceeds the safe size
          const finalFontSize = Math.min(preferredFontSize, maxSafeFontSize)

          // Scale the value text down proportionally if the main text was shrunk
          const scaleRatio = finalFontSize / preferredFontSize
          const finalValueSize = preferredValueSize * scaleRatio
          const finalDy = preferredDy * scaleRatio

          return (
            <g transform={`translate(${node.x},${node.y})`}>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontSize: `${finalFontSize}px`,
                  fontWeight: 600,
                  pointerEvents: 'none',
                }}
                fill="#000"
                strokeWidth={
                  node.radius > 100
                    ? '1px'
                    : node.radius > 60
                      ? '0.6px'
                      : node.radius > 40
                        ? '0.4px'
                        : node.radius > 30
                          ? '0.3px'
                          : node.radius > 25
                            ? '0.25px'
                            : '0.2px'
                }
                className="font-heading"
              >
                {label}
              </text>

              <text
                textAnchor="middle"
                dominantBaseline="central"
                dy={finalDy}
                style={{
                  fontSize: `${finalValueSize}px`,
                  pointerEvents: 'none',
                }}
                fill="#71717A"
              >
                {node.value}
              </text>
            </g>
          )
        }}
        tooltip={({ color, data, value }) => (
          <div className="flex min-w-max animate-appear items-center justify-center rounded bg-zinc-900 px-[9px] py-[5px] text-sm text-bg-black-900">
            <span
              className="mr-1.5 h-4 w-4 rounded-full border-otl-gray-300 border"
              style={{ backgroundColor: color }}
            />
            {`${data.id}: ${value}`}
          </div>
        )}
        animate={false}
      />
    </div>
  )
}

export default BubbleChart
