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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ShimmerButton } from './magicui/shimmer-button'
import { Link, FileText, Sparkles } from 'lucide-react'

export function GeneratePostsModal({ onClose, onGenerate }) {
  const [method, setMethod] = useState('url')
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState('SL')
  const [count, setCount] = useState('3')
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!input.trim()) {
      alert('Please provide input')
      return
    }

    setGenerating(true)
    try {
      await onGenerate({
        method,
        input: input.trim(),
        language,
        count: parseInt(count)
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Generate GBP Posts
          </DialogTitle>
          <DialogDescription>
            Create optimized Google Business Profile posts from articles or descriptions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Method Selection */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Generation Method</label>

            {/* URL Option */}
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                method === 'url'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                  : 'border-border hover:border-purple-300'
              }`}
              onClick={() => setMethod('url')}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  checked={method === 'url'}
                  onChange={() => setMethod('url')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    <Link className="h-4 w-4" />
                    From Article URL
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Transform blog posts or landing pages into multiple GBP posts
                  </p>
                  {method === 'url' && (
                    <Input
                      placeholder="https://nasmehpg.si/blog/article-url"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="mt-3"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Description Option */}
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                method === 'description'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                  : 'border-border hover:border-purple-300'
              }`}
              onClick={() => setMethod('description')}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  checked={method === 'description'}
                  onChange={() => setMethod('description')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4" />
                    From Description
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create original posts from topic ideas or announcements
                  </p>
                  {method === 'description' && (
                    <Textarea
                      placeholder="Describe what you want posts about... (e.g., 'Invisalign benefits for adults', 'Spring teeth whitening promotion', 'New hygienist joining team')"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="mt-3 min-h-[100px]"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN">English</SelectItem>
                  <SelectItem value="SL">Slovenian</SelectItem>
                  <SelectItem value="NL">Dutch</SelectItem>
                  <SelectItem value="DE">German</SelectItem>
                  <SelectItem value="ES">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Posts</label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 post</SelectItem>
                  <SelectItem value="2">2 posts</SelectItem>
                  <SelectItem value="3">3 posts</SelectItem>
                  <SelectItem value="4">4 posts</SelectItem>
                  <SelectItem value="5">5 posts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={generating}>
            Cancel
          </Button>
          <ShimmerButton
            onClick={handleGenerate}
            disabled={!input.trim() || generating}
            background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            className="flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Posts
              </>
            )}
          </ShimmerButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
