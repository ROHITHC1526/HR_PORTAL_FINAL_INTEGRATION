import React from 'react'

export const PayrollTrendsChart: React.FC = () => {
  // Matches Image 1: May, Jun, Jul, Aug, Sep around 210L, then sharp drop at Oct to 49.4L
  const data = [
    { month: 'May', val: 210, label: '₹210 L' },
    { month: 'Jun', val: 212, label: '₹212 L' },
    { month: 'Jul', val: 214, label: '₹214 L' },
    { month: 'Aug', val: 216, label: '₹216 L' },
    { month: 'Sep', val: 220, label: '₹220 L' },
    { month: 'Oct', val: 49.4, label: '₹49.4 L' },
  ]

  const min = 30
  const max = 240
  const width = 640
  const height = 210
  const paddingX = 40
  const paddingY = 40

  const getX = (index: number) => paddingX + (index * (width - paddingX * 2)) / (data.length - 1)
  const getY = (val: number) => height - paddingY - ((val - min) / (max - min)) * (height - paddingY * 2)

  const points = data.map((d, i) => `${getX(i)},${getY(d.val)}`).join(' ')
  const areaPoints = `${getX(0)},${height - paddingY + 10} ${points} ${getX(data.length - 1)},${height - paddingY + 10}`

  return (
    <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Gross payroll, last 6 months</h3>
      </div>

      <div className="relative w-full h-[220px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="payrollAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="payrollLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Subtle horizontal dashed guidelines */}
          <line
            x1={paddingX}
            y1={getY(210)}
            x2={width - paddingX}
            y2={getY(210)}
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            strokeDasharray="4 4"
          />

          {/* Filled Area */}
          <polygon points={areaPoints} fill="url(#payrollAreaGrad)" />

          {/* Trend Line */}
          <polyline
            fill="none"
            stroke="url(#payrollLineGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Dots and Labels */}
          {data.map((d, i) => {
            const cx = getX(i)
            const cy = getY(d.val)
            const isOct = d.month === 'Oct'

            return (
              <g key={d.month}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  className="fill-emerald-500 stroke-white dark:stroke-[#10192A] stroke-2"
                />
                {isOct && (
                  <text
                    x={cx - 10}
                    y={cy - 12}
                    textAnchor="middle"
                    className="fill-slate-800 dark:fill-white text-xs font-bold font-['Sora']"
                  >
                    ₹49.4 L
                  </text>
                )}
                {/* Month labels along bottom */}
                <text
                  x={cx}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-slate-500 dark:fill-slate-400 text-xs font-medium"
                >
                  {d.month}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
export default PayrollTrendsChart
