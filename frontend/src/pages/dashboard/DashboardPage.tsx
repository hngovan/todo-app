import {
  format,
  isToday,
  isBefore,
  startOfToday,
  subDays,
  isSameDay
} from 'date-fns'
import { CheckCircle2, Clock, CalendarDays, ListTodo } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts'

import { categoryApi } from '@/apis/categoryApi'
import { todoApi } from '@/apis/todoApi'
import { getPriorityColor } from '@/constants/todo.constants'
import type { Todo, Category } from '@/types'

export default function DashboardPage() {
  const { t } = useTranslation('common')
  const [todos, setTodos] = useState<Todo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todosRes, catRes] = await Promise.all([
          todoApi.getAll(),
          categoryApi.getAll()
        ])
        setTodos(todosRes.data ?? [])
        setCategories(catRes.data ?? [])
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    void fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-muted-foreground">{t('loading')}...</span>
      </div>
    )
  }

  // Cards Data
  const totalTasks = todos.length
  const completedTasks = todos.filter(t => t.completed).length
  const today = startOfToday()
  const dueToday = todos.filter(
    t => t.dueDate && isToday(new Date(t.dueDate)) && !t.completed
  ).length
  const overdue = todos.filter(
    t => t.dueDate && isBefore(new Date(t.dueDate), today) && !t.completed
  ).length

  // Priority Data
  const priorityData = Array.from({ length: 10 }, (_, i) => ({
    name: `P${i + 1}`,
    count: todos.filter(t => t.priority === i + 1).length,
    fill: getPriorityColor(i + 1)
  })).filter(p => p.count > 0) // Only show priorities with tasks

  // Category Data
  const categoryData = categories
    .map(c => ({
      name: c.name,
      value: todos.filter(t => t.categoryId === c.id || t.category?.id === c.id)
        .length,
      color: c.color
    }))
    .filter(c => c.value > 0)

  // Trend Data (Last 7 Days completions based on updatedAt)
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i))
  const trendData = last7Days.map(date => ({
    date: format(date, 'MMM dd'),
    completed: todos.filter(
      t => t.completed && t.updatedAt && isSameDay(new Date(t.updatedAt), date)
    ).length
  }))

  return (
    <div className="animate-in fade-in container mx-auto space-y-8 p-4 duration-500 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('totalTasks')}
          value={totalTasks}
          icon={<ListTodo className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title={t('completed')}
          value={completedTasks}
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          title={t('dueToday')}
          value={dueToday}
          icon={<CalendarDays className="h-5 w-5 text-yellow-500" />}
        />
        <StatCard
          title={t('overdue')}
          value={overdue}
          icon={<Clock className="h-5 w-5 text-red-500" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Priority Bar Chart */}
        <div className="bg-card border-border flex h-[320px] min-w-0 flex-col rounded-xl border p-4 shadow-sm">
          <h3 className="text-muted-foreground mb-4 text-sm font-medium">
            {t('taskPriorityDistribution')}
          </h3>
          <div className="relative min-h-0 flex-1">
            {mounted && (
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={0}
                debounce={1}
                initialDimension={{ width: 400, height: 320 }}
              >
                <BarChart
                  data={priorityData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.2}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#888' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#888' }}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Donut Chart */}
        <div className="bg-card border-border flex h-[320px] min-w-0 flex-col rounded-xl border p-4 shadow-sm">
          <h3 className="text-muted-foreground mb-4 text-sm font-medium">
            {t('tasksPerCategory')}
          </h3>
          <div className="relative min-h-0 flex-1">
            {mounted && (
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={0}
                debounce={1}
                initialDimension={{ width: 400, height: 320 }}
              >
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name = '', percent }) => {
                      const truncatedName =
                        name.length > 20 ? `${name.substring(0, 17)}...` : name
                      return `${truncatedName} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }}
                    labelLine={false}
                  >
                    {categoryData.map(entry => (
                      <Cell key={entry.color} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      maxWidth: '240px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Completion Trend Line Chart */}
        <div className="bg-card border-border flex h-[320px] min-w-0 flex-col rounded-xl border p-4 shadow-sm lg:col-span-2">
          <h3 className="text-muted-foreground mb-4 text-sm font-medium">
            {t('completionTrend')}
          </h3>
          <div className="relative min-h-0 flex-1">
            {mounted && (
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={0}
                debounce={1}
                initialDimension={{ width: 800, height: 320 }}
              >
                <LineChart
                  data={trendData}
                  margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.2}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#888' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#888' }}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#22c55e"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                    dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon
}: {
  title: string
  value: number | string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-card border-border flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm font-medium">{title}</div>
        <div className="bg-muted/50 rounded-full p-2">{icon}</div>
      </div>
      <div className="mt-4 text-3xl font-bold">{value}</div>
    </div>
  )
}
