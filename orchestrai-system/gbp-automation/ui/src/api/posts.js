const API_BASE = 'http://localhost:3001/api'

export const postsAPI = {
  async fetchPosts(filters = {}) {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.type) params.append('type', filters.type)
    if (filters.language) params.append('language', filters.language)
    if (filters.search) params.append('search', filters.search)

    const response = await fetch(`${API_BASE}/posts?${params}`)
    if (!response.ok) throw new Error('Failed to fetch posts')
    return response.json()
  },

  async fetchPost(postId) {
    const response = await fetch(`${API_BASE}/posts/${postId}`)
    if (!response.ok) throw new Error('Failed to fetch post')
    return response.json()
  },

  async updatePost(postId, updates) {
    const response = await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!response.ok) throw new Error('Failed to update post')
    return response.json()
  },

  async approvePost(postId) {
    const response = await fetch(`${API_BASE}/posts/${postId}/approve`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to approve post')
    return response.json()
  },

  async rejectPost(postId) {
    const response = await fetch(`${API_BASE}/posts/${postId}/reject`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to reject post')
    return response.json()
  },

  async bulkApprove(postIds) {
    const response = await fetch(`${API_BASE}/posts/bulk-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postIds })
    })
    if (!response.ok) throw new Error('Failed to bulk approve')
    return response.json()
  },

  async fetchStats() {
    const response = await fetch(`${API_BASE}/stats`)
    if (!response.ok) throw new Error('Failed to fetch stats')
    return response.json()
  },

  async exportCSV() {
    const response = await fetch(`${API_BASE}/export-csv`, { method: 'POST' })
    if (!response.ok) throw new Error('Failed to export CSV')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gbp-posts-basic-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },

  async exportCSVAdvanced() {
    const response = await fetch(`${API_BASE}/export-csv-advanced`, { method: 'POST' })
    if (!response.ok) throw new Error('Failed to export advanced CSV')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gbp-posts-advanced-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },

  async publishApproved() {
    const response = await fetch(`${API_BASE}/publish`, { method: 'POST' })
    if (!response.ok) throw new Error('Failed to publish posts')
    return response.json()
  },

  async resetExportStatus(postId) {
    const response = await fetch(`${API_BASE}/posts/${postId}/reset-export`, { method: 'POST' })
    if (!response.ok) throw new Error('Failed to reset export status')
    return response.json()
  },

  async generatePosts(data) {
    const response = await fetch(`${API_BASE}/generate-posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to generate posts')
    return response.json()
  },

  async createPosts(posts) {
    const response = await fetch(`${API_BASE}/posts/bulk-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posts })
    })
    if (!response.ok) throw new Error('Failed to create posts')
    return response.json()
  }
}
