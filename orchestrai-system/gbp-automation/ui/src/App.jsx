import { useState, useEffect } from 'react'
import { postsAPI } from './api/posts'
import { Dashboard } from './components/Dashboard'
import { GeneratePostsModal } from './components/GeneratePostsModal'
import { GeneratedPostsPreview } from './components/GeneratedPostsPreview'
import { Toaster } from './components/ui/toast'
import { useToast } from './hooks/use-toast'
import './index.css'

function App() {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({ draft: 0, approved: 0, published: 0, failed: 0 })
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    language: 'all',
    search: ''
  })
  const [loading, setLoading] = useState(true)
  const [selectedPosts, setSelectedPosts] = useState(new Set())
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState([])
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadPosts()
    loadStats()
  }, [filters])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const filterParams = {
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.language !== 'all' && { language: filters.language }),
        ...(filters.search && { search: filters.search })
      }
      const data = await postsAPI.fetchPosts(filterParams)
      setPosts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await postsAPI.fetchStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleApprove = async (postId) => {
    try {
      await postsAPI.approvePost(postId)
      toast({
        title: "Success",
        description: "Post approved successfully"
      })
      loadPosts()
      loadStats()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleReject = async (postId) => {
    try {
      await postsAPI.rejectPost(postId)
      toast({
        title: "Post Rejected",
        description: "Post has been rejected"
      })
      loadPosts()
      loadStats()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleUpdate = async (postId, updates) => {
    try {
      await postsAPI.updatePost(postId, updates)
      toast({
        title: "Success",
        description: "Post updated successfully"
      })
      loadPosts()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleBulkApprove = async () => {
    try {
      const postIds = Array.from(selectedPosts)
      await postsAPI.bulkApprove(postIds)
      toast({
        title: "Success",
        description: `${postIds.length} posts approved`
      })
      setSelectedPosts(new Set())
      loadPosts()
      loadStats()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handlePublish = async () => {
    try {
      const result = await postsAPI.publishApproved()

      if (result.success) {
        // Check if any posts were actually published
        if (result.output.includes('No approved posts found')) {
          toast({
            title: "No Posts to Publish",
            description: "No approved posts found. Approve posts first before publishing.",
            variant: "destructive"
          })
        } else if (result.output.includes('Published: 0')) {
          toast({
            title: "Publishing Failed",
            description: "All posts failed to publish. Check error messages in the post details.",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Publishing Complete",
            description: result.output.match(/Published: (\d+)/)?.[0] || "Posts sent to GHL"
          })
        }
      }

      // Reload to see updated statuses
      setTimeout(() => {
        loadPosts()
        loadStats()
      }, 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleExportCSV = async () => {
    try {
      await postsAPI.exportCSV()
      toast({
        title: "Success",
        description: "Basic CSV exported successfully"
      })
      loadPosts() // Reload to show updated export status
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleExportCSVAdvanced = async () => {
    try {
      await postsAPI.exportCSVAdvanced()
      toast({
        title: "Success",
        description: "Advanced CSV exported successfully"
      })
      loadPosts() // Reload to show updated export status
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleResetExport = async (postId) => {
    try {
      await postsAPI.resetExportStatus(postId)
      toast({
        title: "Export Reset",
        description: "Export status has been reset"
      })
      loadPosts()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const togglePostSelection = (postId) => {
    const newSelection = new Set(selectedPosts)
    if (newSelection.has(postId)) {
      newSelection.delete(postId)
    } else {
      newSelection.add(postId)
    }
    setSelectedPosts(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(posts.map(p => p.id)))
    }
  }

  const handleGenerate = async (data) => {
    try {
      const result = await postsAPI.generatePosts(data)

      if (result.success && result.posts) {
        setGeneratedPosts(result.posts)
        setShowGenerateModal(false)
        setShowPreviewModal(true)
        toast({
          title: "Posts Generated",
          description: `${result.posts.length} posts generated successfully`
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleSaveGeneratedPosts = async (postsToSave) => {
    try {
      const result = await postsAPI.createPosts(postsToSave)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        })
        setShowPreviewModal(false)
        setGeneratedPosts([])
        loadPosts()
        loadStats()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Dashboard
        posts={posts}
        stats={stats}
        filters={filters}
        loading={loading}
        selectedPosts={selectedPosts}
        onFiltersChange={setFilters}
        onApprove={handleApprove}
        onReject={handleReject}
        onUpdate={handleUpdate}
        onBulkApprove={handleBulkApprove}
        onExportCSV={handleExportCSV}
        onExportCSVAdvanced={handleExportCSVAdvanced}
        onResetExport={handleResetExport}
        onToggleSelect={togglePostSelection}
        onToggleSelectAll={toggleSelectAll}
        onOpenGenerate={() => setShowGenerateModal(true)}
      />

      {showGenerateModal && (
        <GeneratePostsModal
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerate}
        />
      )}

      {showPreviewModal && generatedPosts.length > 0 && (
        <GeneratedPostsPreview
          posts={generatedPosts}
          onClose={() => {
            setShowPreviewModal(false)
            setGeneratedPosts([])
          }}
          onSave={handleSaveGeneratedPosts}
        />
      )}

      <Toaster />
    </div>
  )
}

export default App
