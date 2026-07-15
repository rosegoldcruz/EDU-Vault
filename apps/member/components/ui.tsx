"use client";

import { AlertTriangle, Check, Inbox, LoaderCircle, X } from "lucide-react";
import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <header className="page-header"><div><p className="section-label">Iron Vault Member Back Office</p><h1>{title}</h1><p>{description}</p></div>{action && <div className="page-action">{action}</div>}</header>;
}

export function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon?: ReactNode }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span>{icon}</div><strong>{value}</strong><small>{detail}</small></article>;
}

export function Panel({ title, description, action, children, className = "" }: { title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-header">{(title || description) && <div>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>}{action}</div>{children}</section>;
}

export function DataTable({ columns, rows, emptyLabel = "No records yet" }: { columns: string[]; rows: ReactNode[][]; emptyLabel?: string }) {
  if (!rows.length) return <EmptyState title={emptyLabel} message="New activity will appear here when it is available." />;
  return <div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return <div className="state-box"><Inbox /><h3>{title}</h3><p>{message}</p></div>;
}

export function ErrorState({ title = "Unable to load", message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  return <div className="state-box state-error"><AlertTriangle /><h3>{title}</h3><p>{message}</p>{onRetry && <PrimaryButton onClick={onRetry}>Try again</PrimaryButton>}</div>;
}

export function LoadingState({ title = "Loading", rows = 3 }: { title?: string; rows?: number }) {
  return <div className="loading-panel" aria-live="polite"><div className="loading-title"><LoaderCircle className="spin" />{title}</div>{Array.from({ length: rows }, (_, index) => <div className="skeleton" key={index} style={{ width: `${92 - index * 7}%` }} />)}</div>;
}

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "success" | "pending" | "neutral" | "danger" }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} className={`button button-primary ${props.className ?? ""}`} />; }
export function SecondaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} className={`button button-secondary ${props.className ?? ""}`} />; }
export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={`input ${props.className ?? ""}`} />; }
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className={`input textarea ${props.className ?? ""}`} />; }
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} className={`input select ${props.className ?? ""}`} />; }

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => { const close = (event: KeyboardEvent) => event.key === "Escape" && onClose(); window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [onClose]);
  if (!open) return null;
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label={title}><button className="modal-backdrop" aria-label="Close modal" onClick={onClose} /><div className="modal"><div className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X /></button></div>{children}</div></div>;
}

export function Tabs({ items, active, onChange }: { items: string[]; active: string; onChange: (item: string) => void }) {
  return <div className="tabs" role="tablist">{items.map((item) => <button key={item} role="tab" aria-selected={item === active} onClick={() => onChange(item)}>{item}</button>)}</div>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return <div className="progress-block">{label && <div className="progress-label"><span>{label}</span><strong>{value}%</strong></div>}<div className="progress-track"><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div></div>;
}

export function WalletCard({ address, ready, balance }: { address: string | null; ready: boolean; balance: string }) {
  return <Panel title="Wallet readiness" className="identity-card"><div className="identity-row"><div className="icon-tile"><Check /></div><div><strong>{address ?? "No wallet connected"}</strong><p>{balance} · {ready ? "Verified and ready" : "Verification required"}</p></div></div><StatusBadge tone={ready ? "success" : "pending"}>{ready ? "Ready" : "Action needed"}</StatusBadge></Panel>;
}

export function MembershipCard({ tier, status, since }: { tier: string; status: string; since: string }) {
  return <Panel title="Membership" className="identity-card"><div><strong className="large-value">{tier}</strong><p>Member since {since}</p></div><StatusBadge tone={status === "ACTIVE" ? "success" : "pending"}>{status}</StatusBadge></Panel>;
}
