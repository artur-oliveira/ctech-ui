import {useRef, useState, type DragEvent} from "react"

import {cn} from "../lib/cn"

interface FileDropProps {
  id: string
  label: string
  hint?: string
  error?: string
  /** Comma-separated extensions, as the input's accept (".crt,.pem"). */
  accept: string
  maxBytes: number
  file: File | null
  onFile: (f: File | null) => void
  chooseLabel: string
  replaceLabel: string
  removeLabel: string
  tooLargeLabel: string
  wrongTypeLabel: string
}

/**
 * One file, dropped or chosen. Validates extension and size before handing it
 * over; never reads the content (the consumer decides what to do with it).
 * The whole zone is a 44px-tall button on a phone; drag and drop is a bonus.
 */
function FileDrop(p: FileDropProps) {
  const input = useRef<HTMLInputElement>(null)
  const [local, setLocal] = useState<string | null>(null)
  const [over, setOver] = useState(false)
  const exts = p.accept.split(",").map(e => e.trim().toLowerCase())

  function take(f: File | undefined) {
    if (!f) return
    if (!exts.some(e => f.name.toLowerCase().endsWith(e))) return setLocal(p.wrongTypeLabel)
    if (f.size > p.maxBytes) return setLocal(p.tooLargeLabel)
    setLocal(null)
    p.onFile(f)
  }

  function drop(e: DragEvent) {
    e.preventDefault()
    setOver(false)
    take(e.dataTransfer.files[0])
  }

  const error = local ?? p.error
  const describedBy = error ? `${p.id}-error` : p.hint ? `${p.id}-hint` : undefined

  return (
    <div className="grid gap-1.5">
      <label htmlFor={p.id} className="text-sm font-medium text-foreground">{p.label}</label>
      <div data-testid={`file-drop-${p.id}`} onDragOver={e => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)} onDrop={drop}
        className={cn("flex min-h-11 flex-wrap items-center gap-3 rounded-md border border-dashed px-3 py-2 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
          over ? "border-brand-600 bg-brand-50" : "border-border", error && "border-danger")}>
        <input ref={input} id={p.id} type="file" accept={p.accept} className="sr-only" aria-describedby={describedBy}
          onChange={e => { take(e.target.files?.[0]); e.target.value = "" }}/>
        {p.file
          ? <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">{p.file.name}</span>
          : <span className="flex-1"/>}
        {/* The input is the keyboard control (its label names it); this button is its pointer twin. */}
        <button type="button" tabIndex={-1} onClick={() => input.current?.click()}
          className="min-h-11 rounded-md px-3 text-sm font-medium text-brand-700 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-ring">
          {p.file ? p.replaceLabel : p.chooseLabel}
        </button>
        {p.file && (
          <button type="button" onClick={() => p.onFile(null)}
            className="min-h-11 rounded-md px-3 text-sm text-muted-foreground hover:bg-surface focus-visible:outline-2 focus-visible:outline-ring">
            {p.removeLabel}
          </button>
        )}
      </div>
      {p.hint && !error && <p id={`${p.id}-hint`} className="text-sm text-muted-foreground">{p.hint}</p>}
      {error && <p id={`${p.id}-error`} role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  )
}

export {FileDrop, type FileDropProps}
