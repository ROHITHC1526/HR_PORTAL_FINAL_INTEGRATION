import { useState, type FormEvent } from 'react'
import { useCreateReference, useReferences } from './api'

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500'
const labelClass = 'grid gap-1 text-xs font-medium text-slate-300'

export function OrganizationSetup() {
  const departments = useReferences('departments', true)
  return (
    <details className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <summary className="cursor-pointer text-sm font-semibold text-slate-100">
        Organization setup
      </summary>
      <p className="mt-2 text-xs text-slate-400">
        Create reference records first. Referenced records are archived rather than deleted.
      </p>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ReferenceForm kind="departments" title="Department" departments={departments.data ?? []} />
        <ReferenceForm kind="grades" title="Grade" departments={[]} />
        <ReferenceForm kind="locations" title="Location" departments={[]} />
      </div>
      {departments.isError && (
        <p role="alert" className="mt-3 text-xs text-rose-300">
          Could not load departments: {departments.error.message}
        </p>
      )}
    </details>
  )
}

function ReferenceForm({
  kind,
  title,
  departments,
}: {
  kind: 'departments' | 'grades' | 'locations'
  title: string
  departments: { id: string; label: string }[]
}) {
  const create = useCreateReference(kind)
  const [message, setMessage] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const payload: Record<string, string | number | null> = {
      code: String(data.get('code') ?? '').trim(),
      ...(kind === 'departments' && {
        name: String(data.get('label') ?? '').trim(),
        parent_id: String(data.get('parent_id') ?? '') || null,
      }),
      ...(kind === 'grades' && {
        label: String(data.get('label') ?? '').trim(),
        rank: Number(data.get('rank') ?? 0),
      }),
      ...(kind === 'locations' && {
        label: String(data.get('label') ?? '').trim(),
        country_code: String(data.get('country_code') ?? '')
          .trim()
          .toUpperCase(),
        region: String(data.get('region') ?? '').trim() || null,
      }),
    }
    try {
      await create.mutateAsync(payload)
      form.reset()
      setMessage(`${title} created.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `${title} could not be created.`)
    }
  }
  return (
    <form
      onSubmit={submit}
      className="grid content-start gap-3 rounded-lg border border-slate-800 p-4"
    >
      <h3 className="text-sm font-semibold text-white">{title}s</h3>
      <label className={labelClass}>
        Code
        <input required maxLength={32} name="code" className={inputClass} />
      </label>
      <label className={labelClass}>
        Name / label
        <input required maxLength={120} name="label" className={inputClass} />
      </label>
      {kind === 'departments' && (
        <label className={labelClass}>
          Parent department
          <select name="parent_id" className={inputClass}>
            <option value="">No parent</option>
            {departments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      )}
      {kind === 'grades' && (
        <label className={labelClass}>
          Rank
          <input required min={0} type="number" name="rank" className={inputClass} />
        </label>
      )}
      {kind === 'locations' && (
        <>
          <label className={labelClass}>
            Country code
            <input
              required
              minLength={2}
              maxLength={2}
              name="country_code"
              placeholder="IN"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Region
            <input name="region" maxLength={120} className={inputClass} />
          </label>
        </>
      )}
      <button
        disabled={create.isPending}
        className="rounded-lg bg-sky-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {create.isPending ? 'Saving…' : `Add ${title.toLowerCase()}`}
      </button>
      {message && (
        <p aria-live="polite" className="text-xs text-slate-300">
          {message}
        </p>
      )}
    </form>
  )
}
