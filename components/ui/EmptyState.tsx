import { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 text-center ${className}`}>
      {icon && <div className="text-[var(--muted,#9ca3af)]">{icon}</div>}
      <h3 className="text-lg font-semibold text-[var(--text,#111)]">{title}</h3>
      {description && <p className="text-sm text-[var(--muted,#9ca3af)] max-w-sm">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-2 text-sm rounded-lg bg-[var(--primary,#6366f1)] text-white hover:opacity-90 transition-opacity"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
