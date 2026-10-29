import React, { useRef, useState } from 'react'
import { useExportBackup, useImportBackup, useCsvExportUrl } from './api'
import { BackupErrorBoundary } from './ErrorBoundary'
import { Icon } from '@/people-plus/Icon'

function BackupContent() {
  const exportMut = useExportBackup()
  const importMut = useImportBackup()
  const csvUrl = useCsvExportUrl()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importResult, setImportResult] = useState<string | null>(null)

  const handleExport = async () => {
    const data = await exportMut.mutateAsync()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `brightcone-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      const payload = JSON.parse(text)
      const result = await importMut.mutateAsync(payload)
      setImportResult(
        `Imported ${result.imported} records (${result.duplicates_skipped} duplicates skipped).`,
      )
    }
    reader.readAsText(file)
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Administration</div>
          <h1>Data & Backup</h1>
          <p>Export and import system records for backup and disaster recovery.</p>
        </div>
      </div>

      <div className="grid g3 mt">
        <div className="card">
          <h3>JSON Backup</h3>
          <p className="muted" style={{ marginBottom: 14 }}>
            Download all records and audit history as a JSON backup file.
          </p>
          <button
            className="btn primary"
            onClick={handleExport}
            disabled={exportMut.isPending}
          >
            <Icon name="download" size={16} />
            {exportMut.isPending ? 'Exporting…' : 'Export JSON'}
          </button>
        </div>

        <div className="card">
          <h3>CSV Export</h3>
          <p className="muted" style={{ marginBottom: 14 }}>
            Download records as a CSV spreadsheet.
          </p>
          <a className="btn primary" href={csvUrl} download>
            <Icon name="download" size={16} /> Export CSV
          </a>
        </div>

        <div className="card">
          <h3>Import Backup</h3>
          <p className="muted" style={{ marginBottom: 14 }}>
            Restore records from a previously exported JSON backup file.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            style={{ marginBottom: 12, display: 'block' }}
          />
          <button
            className="btn primary"
            onClick={handleImport}
            disabled={importMut.isPending}
          >
            <Icon name="upload" size={16} />
            {importMut.isPending ? 'Importing…' : 'Import Backup'}
          </button>
          {importResult && (
            <p style={{ marginTop: 12, color: 'var(--ok)' }}>{importResult}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export const BackupPage: React.FC = () => (
  <BackupErrorBoundary>
    <BackupContent />
  </BackupErrorBoundary>
)
