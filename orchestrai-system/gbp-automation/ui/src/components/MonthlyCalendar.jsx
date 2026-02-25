import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react'

export function MonthlyCalendar({ posts }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get first day of month and number of days
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() // 0 = Sunday

  // Group posts by date
  const postsByDate = {}
  posts.forEach(post => {
    if (post.scheduled_at) {
      const date = new Date(post.scheduled_at)
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      if (!postsByDate[dateKey]) {
        postsByDate[dateKey] = []
      }
      postsByDate[dateKey].push(post)
    }
  })

  // Generate calendar days
  const calendarDays = []

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const today = new Date()
  const isToday = (day) => {
    return day &&
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
  }

  const getPostsForDay = (day) => {
    if (!day) return []
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return postsByDate[dateKey] || []
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Scheduled Posts</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {monthNames[month]} {year}
            </span>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-xs font-medium text-center text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dayPosts = getPostsForDay(day)
            const hasPosts = dayPosts.length > 0

            return (
              <div
                key={index}
                className={`
                  min-h-[60px] border rounded p-1 text-xs
                  ${!day ? 'bg-muted/30' : 'bg-background hover:bg-muted/50'}
                  ${isToday(day) ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-border'}
                  ${hasPosts ? 'border-purple-300' : ''}
                `}
              >
                {day && (
                  <>
                    <div className={`text-right font-medium mb-1 ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                      {day}
                    </div>
                    {hasPosts && (
                      <div className="space-y-0.5">
                        {dayPosts.map((post, idx) => (
                          <div key={post.id} className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              post.status === 'approved' ? 'bg-green-500' :
                              post.status === 'published' ? 'bg-blue-500' :
                              post.status === 'failed' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`} />
                            <span className="text-[10px] text-muted-foreground truncate">
                              #{post.id}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Draft</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Approved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Published</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Failed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
