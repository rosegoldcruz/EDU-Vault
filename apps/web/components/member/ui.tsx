"use client"

import {
  AlertTriangle,
  Inbox,
  LoaderCircle,
  X,
  type LucideIcon,
} from "lucide-react"
import {
  useEffect,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react"

export function MemberPageHeader({
  title,
  accent,
  description,
  action,
}: {
  title: string
  accent?: string
  description: string
  action?: ReactNode
}) {
  return (
    <header className="iv-member-page-header">
      <div>
        <span className="iv-label">Iron Vault Member Workspace</span>
        <h1>{title} {accent ? <span className="iv-serif">{accent}</span> : null}</h1>
        <p>{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  )
}

export function MemberPanel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`iv-panel iv-member-panel ${className}`}>
      {title || description || action ? (
        <div className="iv-member-panel-header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function MemberMetric({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <article className="iv-member-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}

export function MemberState({
  icon: Icon = Inbox,
  title,
  message,
  tone = "empty",
  action,
}: {
  icon?: LucideIcon
  title: string
  message: string
  tone?: "empty" | "error" | "loading"
  action?: ReactNode
}) {
  return (
    <div className="iv-member-state" data-tone={tone} aria-live={tone === "loading" ? "polite" : undefined}>
      {tone === "loading" ? <LoaderCircle className="iv-member-spinner" /> : <Icon />}
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  )
}

export function MemberError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <MemberState
      icon={AlertTriangle}
      title="Unable to load"
      message={message}
      tone="error"
      action={onRetry ? <MemberButton onClick={onRetry}>Try again</MemberButton> : undefined}
    />
  )
}

export function MemberButton({
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  return <button {...props} className={`iv-btn ${variant === "secondary" ? "iv-btn-ghost" : ""} ${props.className ?? ""}`} />
}

export function MemberInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`iv-member-field ${props.className ?? ""}`} />
}

export function MemberTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`iv-member-field ${props.className ?? ""}`} />
}

export function MemberSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`iv-member-field ${props.className ?? ""}`} />
}

export function MemberModal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [onClose])

  if (!open) return null

  return (
    <div className="iv-member-modal-layer" role="dialog" aria-modal="true" aria-label={title}>
      <button className="iv-member-modal-backdrop" type="button" aria-label="Close modal" onClick={onClose} />
      <div className="iv-panel iv-member-modal">
        <div className="iv-member-modal-header">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close"><X /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
