import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Calendar as CalendarIcon } from 'lucide-react'
import { getStatusColor } from '../lib/utils'

export function PostCalendar({ posts }) {
  // Group posts by date
  const postsByDate = posts
    .filter(post => post.scheduled_at)
    .reduce((acc, post) => {
      const date = new Date(post.scheduled_at).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(post)
      return acc
    }, {})

  // Sort dates
  const sortedDates = Object.keys(postsByDate).sort()

  // Get month groupings
  const postsByMonth = sortedDates.reduce((acc, date) => {
    const monthKey = date.substring(0, 7) // YYYY-MM
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(date)
    return acc
  }, {})

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date)
  }

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-')
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(new Date(year, parseInt(month) - 1))
  }

  if (sortedDates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Scheduled Posts Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No scheduled posts yet</p>
            <p className="text-sm mt-1">Posts with schedule dates will appear here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Scheduled Posts Calendar ({sortedDates.length} dates)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Object.keys(postsByMonth).sort().map(monthKey => (
            <div key={monthKey}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
                {formatMonth(monthKey)}
              </h3>
              <div className="space-y-3">
                {postsByMonth[monthKey].map(date => (
                  <div key={date} className="border border-border/50 rounded-lg p-4 bg-card/50 backdrop-blur">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium">
                        {formatDate(date)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {postsByDate[date].length} post{postsByDate[date].length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {postsByDate[date].map(post => (
                        <div
                          key={post.id}
                          className="flex items-center gap-3 p-2 rounded bg-background/50 hover:bg-background/80 transition-colors"
                        >
                          <div className="text-xs font-mono text-muted-foreground min-w-[60px]">
                            {formatTime(post.scheduled_at)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {post.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {post.id}
                            </div>
                          </div>
                          <Badge className={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
