import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'
import { ShimmerButton } from './magicui/shimmer-button'
import { Save, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { Card } from './ui/card'

export function GeneratedPostsPreview({ posts, onClose, onSave }) {
  const [editedPosts, setEditedPosts] = useState(posts.map((post, idx) => ({
    ...post,
    selected: true,
    id: `temp-${idx}` // Temporary ID for tracking
  })))
  const [saving, setSaving] = useState(false)

  const handleToggleSelect = (id) => {
    setEditedPosts(prev => prev.map(post =>
      post.id === id ? { ...post, selected: !post.selected } : post
    ))
  }

  const handleUpdatePost = (id, field, value) => {
    setEditedPosts(prev => prev.map(post =>
      post.id === id ? { ...post, [field]: value } : post
    ))
  }

  const handleSave = async () => {
    const selectedPosts = editedPosts.filter(p => p.selected)
    if (selectedPosts.length === 0) {
      alert('Please select at least one post to save')
      return
    }

    setSaving(true)
    try {
      await onSave(selectedPosts)
    } finally {
      setSaving(false)
    }
  }

  const selectedCount = editedPosts.filter(p => p.selected).length

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Generated Posts Preview
          </DialogTitle>
          <DialogDescription>
            Review and edit generated posts before saving as drafts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {editedPosts.map((post, idx) => (
            <Card key={post.id} className={`p-4 ${post.selected ? 'border-purple-500' : 'border-border'}`}>
              <div className="space-y-4">
                {/* Header: Checkbox + Post Type + Quality Indicators */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={post.selected}
                      onCheckedChange={() => handleToggleSelect(post.id)}
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Post {idx + 1}</span>
                      <Badge variant="outline">{post.post_type}</Badge>
                      <Badge variant="outline">{post.language}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Character Count */}
                    <div className={`text-xs px-2 py-1 rounded ${
                      post.character_count < 100 || post.character_count > 1500
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {post.character_count} chars
                    </div>

                    {/* AI Risk */}
                    <div className={`text-xs px-2 py-1 rounded ${
                      post.ai_detection_risk > 30
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      AI: {post.ai_detection_risk}%
                    </div>

                    {/* Quality Gate */}
                    {post.quality_gate_passed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>

                {/* Title Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={post.title}
                    onChange={(e) => handleUpdatePost(post.id, 'title', e.target.value)}
                    placeholder="Post title..."
                  />
                </div>

                {/* Content Textarea */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Content</label>
                    <span className="text-xs text-muted-foreground">
                      {post.content.length} / 1500 characters
                    </span>
                  </div>
                  <Textarea
                    value={post.content}
                    onChange={(e) => {
                      const newContent = e.target.value
                      handleUpdatePost(post.id, 'content', newContent)
                      handleUpdatePost(post.id, 'character_count', newContent.length)
                    }}
                    className="min-h-[100px]"
                    placeholder="Post content..."
                  />
                </div>

                {/* Quality Warnings */}
                {(post.character_count < 100 || post.character_count > 1500 || post.ai_detection_risk > 30) && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-xs text-yellow-700">
                      {post.character_count < 100 && <div>• Content too short (minimum 100 characters)</div>}
                      {post.character_count > 1500 && <div>• Content too long (maximum 1500 characters)</div>}
                      {post.ai_detection_risk > 30 && <div>• High AI detection risk (should be below 30%)</div>}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedCount} of {editedPosts.length} posts selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <ShimmerButton
              onClick={handleSave}
              disabled={selectedCount === 0 || saving}
              background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save {selectedCount} Post{selectedCount !== 1 ? 's' : ''} as Drafts
                </>
              )}
            </ShimmerButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
