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
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ShimmerButton } from './magicui/shimmer-button'
import { validateCharacterLimit, getStatusColor, getStatusIcon } from '../lib/utils'
import { CheckCircle2, XCircle, Save, AlertTriangle } from 'lucide-react'

export function PostModal({ post, onClose, onSave, onApprove, onReject }) {
  const [formData, setFormData] = useState({
    title: post.title || '',
    content: post.content || '',
    type: post.type || 'whats_new',
    category: post.category || '',
    tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
    language: post.language || 'EN',
    scheduled_at: post.scheduled_at || '',
    apply_watermark: post.apply_watermark || false,
  })

  const validation = validateCharacterLimit(formData.content)

  const handleSave = () => {
    const updates = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    onSave(updates)
  }

  const aiDetection = post.ai_detection_score || 0
  const aiDetectionStatus = aiDetection < 30 ? 'pass' : 'warning'

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Post</span>
            <Badge className={getStatusColor(post.status)}>
              {getStatusIcon(post.status)} {post.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Make changes to your GBP post. Character limit: 100-1500 characters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter post title"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Content</label>
              <span className={`text-sm font-mono ${validation.isValid ? 'text-emerald-600' : 'text-red-600'}`}>
                {validation.length}/1500 ({validation.percentage}%)
              </span>
            </div>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter post content"
              className="min-h-[200px] font-sans"
            />
            {!validation.isValid && (
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Content must be between 100 and 1500 characters
              </p>
            )}
          </div>

          {/* Type and Language */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whats_new">What's New</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN">English</SelectItem>
                  <SelectItem value="NL">Dutch</SelectItem>
                  <SelectItem value="SL">Slovenian</SelectItem>
                  <SelectItem value="DE">German</SelectItem>
                  <SelectItem value="ES">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category and Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., education, promotion"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          {/* Schedule Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Schedule Date (Optional)</label>
            <Input
              type="datetime-local"
              value={formData.scheduled_at ? new Date(formData.scheduled_at).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
            />
          </div>

          {/* Watermark Checkbox */}
          <div className="flex items-center space-x-3 border rounded-lg p-4 bg-muted/30">
            <Checkbox
              id="apply-watermark"
              checked={formData.apply_watermark}
              onCheckedChange={(checked) => setFormData({ ...formData, apply_watermark: checked })}
            />
            <label
              htmlFor="apply-watermark"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Apply watermark to images
              <span className="block text-xs text-muted-foreground font-normal mt-1">
                Applies your configured GHL watermark to post images (recommended for before/after photos)
              </span>
            </label>
          </div>

          {/* Quality Gates */}
          <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
            <h4 className="font-medium text-sm">Quality Gates</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Character Limit (100-1500)</span>
                <Badge variant={validation.isValid ? "default" : "destructive"}>
                  {validation.isValid ? '✓ Pass' : '✗ Fail'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>AI Detection (&lt; 30%)</span>
                <Badge variant={aiDetectionStatus === 'pass' ? "default" : "destructive"}>
                  {aiDetectionStatus === 'pass' ? '✓ Pass' : '⚠ Warning'} ({aiDetection}%)
                </Badge>
              </div>
            </div>
          </div>

          {/* Publish Error Display */}
          {post.status === 'failed' && post.publish_error && (
            <div className="border border-red-500/50 rounded-lg p-4 space-y-2 bg-red-950/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <h4 className="font-medium text-sm text-red-400">Publish Failed</h4>
              </div>
              <p className="text-sm text-red-300 font-mono bg-black/30 p-2 rounded">
                {post.publish_error}
              </p>
              <p className="text-xs text-muted-foreground">
                Fix the issue and click "Reset to Approved" to try publishing again.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {post.status === 'failed' && (
            <Button onClick={onApprove} variant="default" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Reset to Approved
            </Button>
          )}
          {post.status === 'draft' && (
            <>
              <Button variant="outline" onClick={onReject} className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              <ShimmerButton
                onClick={onApprove}
                disabled={!validation.isValid}
                background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </ShimmerButton>
            </>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
