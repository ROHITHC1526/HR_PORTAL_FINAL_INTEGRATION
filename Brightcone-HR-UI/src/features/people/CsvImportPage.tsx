import React, { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { components } from '@/api/schema'
import { Icon } from '@/people-plus/Icon'

type CsvDryRun = {
  valid: boolean
  total_rows?: number
  issues?: Array<{ row: number; message: string }>
  [key: string]: any
}

function useCsvDryRun() {
  return useMutation({
    mutationFn: (csv: string) =>
      api<CsvDryRun>('/people/employees/import/dry-run', {
        method: 'POST',
        body: JSON.stringify({ csv }),
      }),
  })
}

export const CsvImportPage: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [csvText, setCsvText] = useState('')
  const [result, setResult] = useState<CsvDryRun | null>(null)
  const dryRun = useCsvDryRun()

  const base = import.meta.env.VITE_API_URL ?? '/api'
  const templateUrl = `${base}/people/employees/import/template.csv`

  const handleFileLoad = () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setCsvText(e.target?.result as string)
      setResult(null)
    }
    reader.readAsText(file)
  }

  const handleValidate = async () => {
    if (!csvText.trim()) return
    const data = await dryRun.mutateAsync(csvText)
    setResult(data)
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">People Operations</div>
          <h1>CSV Employee Import</h1>
          <p>Validate employee data before importing. Download the template, fill it, and upload.</p>
        </div>
        <div className="actions">
          <a className="btn primary" href={templateUrl} download>
            <Icon name="download" size={16} /> Download template
          </a>
        </div>
      </div>

      <div className="card mt">
        <h3>Upload CSV</h3>
        <p className="muted" style={{ marginBottom: 14 }}>
          Select a CSV file with the employee template columns. The dry-run validates without saving.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFileLoad}
          style={{ marginBottom: 12, display: 'block' }}
        />
        {csvText && (
          <div style={{ marginBottom: 16 }}>
            <textarea
              className="input"
              value={csvText}
              onChange={(e) => { setCsvText(e.target.value); setResult(null) }}
              rows={8}
              style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}
            />
          </div>
        )}
        <button
          className="btn primary"
          onClick={handleValidate}
          disabled={!csvText.trim() || dryRun.isPending}
        >
          {dryRun.isPending ? 'Validating…' : 'Validate (dry run)'}
        </button>
      </div>

      {result && (
        <div className="card mt">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Validation Result</h3>
            <span className={`pill ${result.valid ? 'p-ok' : 'p-bad'}`}>
              {result.valid ? 'Valid' : 'Has Issues'}
            </span>
          </div>
          <p className="muted" style={{ marginBottom: 12 }}>
            {result.rows} row{result.rows !== 1 ? 's' : ''} parsed
          </p>
          {Boolean(result.issues && result.issues.length > 0) && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {result.issues?.map((issue: any, i: number) => (
                    <tr key={i}>
                      <td><span className="pill p-warn">Row {issue.row}</span></td>
                      <td>{issue.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {result.valid && (
            <p style={{ marginTop: 12, color: 'var(--ok)' }}>
              All rows are valid. The transactional importer is not yet available —
              records will be importable once the import endpoint is complete.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
