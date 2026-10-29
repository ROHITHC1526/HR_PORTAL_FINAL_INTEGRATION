import React, { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'

type FileUploadResponse = {
  id: string
  filename: string
  mime_type: string
  size_bytes: number
  created_at: string
}

type DocEntry = FileUploadResponse & { category: string }

const CATEGORIES = [
  'ID Proof',
  'Address Proof',
  'Education Certificate',
  'Experience Letter',
  'Offer Letter',
  'Payslip',
  'Tax Document',
  'Other',
] as const

function useUploadFile() {
  return useMutation({
    mutationFn: async (payload: { filename: string; mime_type: string; content: string }) =>
      api<FileUploadResponse>('/files', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  })
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1] ?? ''
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const DocumentsPage: React.FC = () => {
  const { can } = useAuth()
  const isAdmin = can('people:manage') || can('users:manage')
  const upload = useUploadFile()
  const fileRef = useRef<HTMLInputElement>(null)
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [docs, setDocs] = useState<DocEntry[]>([])
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const base64 = await fileToBase64(file)
      const result = await upload.mutateAsync({
        filename: file.name,
        mime_type: file.type || 'application/octet-stream',
        content: base64,
      })
      setDocs((prev) => [...prev, { ...result, category }])
      if (fileRef.current) fileRef.current.value = ''
    } finally {
      setUploading(false)
    }
  }

  const base = import.meta.env.VITE_API_URL ?? '/api'

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">People Operations</div>
          <h1>Documents & Letters</h1>
          <p>Upload, manage and download employee documents securely.</p>
        </div>
      </div>

      <div className="card mt">
        <h3>Upload Document</h3>
        <p className="muted" style={{ marginBottom: 14 }}>
          Select a category, choose a file (max 10 MB), and upload. Files are stored encrypted.
        </p>
        <div className="toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
            style={{ flex: 1 }}
          />
          <button
            className="btn primary"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
        {upload.isError && (
          <p style={{ color: 'var(--bad)', marginTop: 8 }}>
            Upload failed: {(upload.error as Error).message}
          </p>
        )}
      </div>

      <div className="card mt">
        <h3>Uploaded Documents ({docs.length})</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Category</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td><b>{d.filename}</b></td>
                  <td><span className="pill p-info">{d.category}</span></td>
                  <td className="muted">{d.mime_type}</td>
                  <td className="muted">{formatBytes(d.size_bytes)}</td>
                  <td className="muted">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td>
                    <a
                      className="btn sm"
                      href={`${base}/files/${d.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon name="download" size={14} /> Download
                    </a>
                  </td>
                </tr>
              ))}
              {docs.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                    No documents uploaded yet. Use the form above to upload your first document.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
