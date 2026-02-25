import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString) {
  if (!dateString) return 'Not scheduled'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function getStatusColor(status) {
  const colors = {
    draft: 'status-draft',
    approved: 'status-approved',
    published: 'status-published',
    failed: 'status-failed',
    scheduled: 'status-scheduled'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function getStatusIcon(status) {
  const icons = {
    draft: '🟡',
    approved: '🟢',
    published: '🔵',
    failed: '🔴',
    scheduled: '🟣'
  }
  return icons[status] || '⚪'
}

export function validateCharacterLimit(content) {
  const length = content?.length || 0
  return {
    length,
    isValid: length >= 100 && length <= 1500,
    percentage: Math.round((length / 1500) * 100)
  }
}

export function stripMarkdown(text) {
  if (!text) return ''

  return text
    // Remove bold/italic
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')

    // Remove headers
    .replace(/^#+\s+/gm, '')

    // Remove bullet points
    .replace(/^[•\-\*]\s+/gm, '• ')

    // Remove links but keep text
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')

    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
