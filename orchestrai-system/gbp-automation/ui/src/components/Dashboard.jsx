import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { NumberTicker } from './magicui/number-ticker'
import { ShimmerButton } from './magicui/shimmer-button'
import { PostModal } from './PostModal'
import { MonthlyCalendar } from './MonthlyCalendar'
import { formatDate, getStatusColor, getStatusIcon, validateCharacterLimit } from '../lib/utils'
import { Download, FileText, CheckCircle2, XCircle, Edit2, Filter, Calendar, Upload, RotateCcw, Sparkles } from 'lucide-react'

export function Dashboard({
  posts,
  stats,
  filters,
  loading,
  selectedPosts,
  onFiltersChange,
  onApprove,
  onReject,
  onUpdate,
  onBulkApprove,
  onExportCSV,
  onExportCSVAdvanced,
  onResetExport,
  onToggleSelect,
  onToggleSelectAll,
  onOpenGenerate,
}) {
  const [editingPost, setEditingPost] = useState(null)

  const handleRowClick = (post) => {
    setEditingPost(post)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1 py-4">
          <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            GBP Post Manager
          </h1>
          <p className="text-sm text-muted-foreground">Review and manage Google Business Profile posts</p>
        </div>

        {/* Action Buttons - Top Left */}
        <div className="flex gap-3 flex-wrap">
          {selectedPosts.size > 0 && (
            <Button
              onClick={onBulkApprove}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Selected ({selectedPosts.size})
            </Button>
          )}
          <Button
            onClick={onOpenGenerate}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Posts
          </Button>
          <Button onClick={onExportCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Basic CSV
          </Button>
          <Button onClick={onExportCSVAdvanced} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Advanced CSV
          </Button>
        </div>

        {/* Two Column Layout: Calendar + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar - Left Column (2/3 width) */}
          <div className="lg:col-span-2">
            <MonthlyCalendar posts={posts} />
          </div>

          {/* Stats - Right Column (1/3 width) */}
          <div className="space-y-3">
            {[
              { label: 'Draft', value: stats.draft, color: 'text-amber-400', icon: '🟡' },
              { label: 'Approved', value: stats.approved, color: 'text-emerald-400', icon: '🟢' },
              { label: 'Published', value: stats.published, color: 'text-blue-400', icon: '🔵' },
              { label: 'Failed', value: stats.failed, color: 'text-red-400', icon: '🔴' },
            ].map((stat) => (
              <Card key={stat.label} className="border-border/50 bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-3">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </CardTitle>
                  <span className="text-base">{stat.icon}</span>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <div className={`text-xl font-bold font-display ${stat.color}`}>
                    <NumberTicker value={stat.value} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Search
                </label>
                <Input
                  placeholder="Search posts..."
                  value={filters.search}
                  onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                />
              </div>

              <div className="w-full md:w-48 space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-48 space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={filters.type} onValueChange={(value) => onFiltersChange({ ...filters, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="whats_new">What's New</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-48 space-y-2">
                <label className="text-sm font-medium">Language</label>
                <Select value={filters.language} onValueChange={(value) => onFiltersChange({ ...filters, language: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    <SelectItem value="EN">English</SelectItem>
                    <SelectItem value="NL">Dutch</SelectItem>
                    <SelectItem value="SL">Slovenian</SelectItem>
                    <SelectItem value="DE">German</SelectItem>
                    <SelectItem value="ES">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-4 w-4" />
              Posts ({posts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No posts found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPosts.size === posts.length}
                        onCheckedChange={onToggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32">Scheduled</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Characters</TableHead>
                    <TableHead className="w-24">Exported</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => {
                    const validation = validateCharacterLimit(post.content)
                    return (
                      <TableRow
                        key={post.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(post)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedPosts.has(post.id)}
                            onCheckedChange={() => onToggleSelect(post.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {post.id}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(post.status)}>
                            {getStatusIcon(post.status)} {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {post.scheduled_at ? (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.scheduled_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Not scheduled</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                        <TableCell className="capitalize">{post.type.replace('_', ' ')}</TableCell>
                        <TableCell>{post.language}</TableCell>
                        <TableCell>
                          <span className={validation.isValid ? 'text-emerald-600' : 'text-red-600'}>
                            {validation.length}/1500
                          </span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {post.exported_at ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                <Upload className="h-3 w-3 mr-1" />
                                Exported
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onResetExport && onResetExport(post.id)
                                }}
                                className="h-6 w-6 p-0"
                                title="Reset export status"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not exported</span>
                          )}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            {post.status === 'draft' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onApprove(post.id)
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onReject(post.id)
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <XCircle className="h-3 w-3" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {post.status === 'failed' && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onApprove(post.id)
                                }}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Reset to Approved
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingPost(post)
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Post Edit Modal */}
      {editingPost && (
        <PostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={(updates) => {
            onUpdate(editingPost.id, updates)
            setEditingPost(null)
          }}
          onApprove={() => {
            onApprove(editingPost.id)
            setEditingPost(null)
          }}
          onReject={() => {
            onReject(editingPost.id)
            setEditingPost(null)
          }}
        />
      )}
    </div>
  )
}
