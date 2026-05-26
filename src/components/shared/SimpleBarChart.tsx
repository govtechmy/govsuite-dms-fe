import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts'

interface SimpleBarChartProps {
  data: Array<{
    name: string
    value: number
  }>
}

export default function SimpleBarChart({ data }: SimpleBarChartProps) {
  return (
    <div className="hover:cursor-pointer py-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#64748B"
            tick={{
              fill: '#64748B',
              fontFamily: 'Inter',
              fontSize: 12,
              fontWeight: 300,
              dy: 10,
              className: 'hidden sm:block',
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#64748B"
            tick={{ fill: '#64748B', fontFamily: 'Inter', fontSize: 12, fontWeight: 300 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip cursor={false} />
          <Bar dataKey="value" fill="#1D4ED8" radius={[24, 24, 24, 24]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
