import { AlertTriangle, DatabaseZap, RefreshCw } from 'lucide-react';

export function AdminEmptyState({ title = 'No data yet', description = 'There is nothing to show here yet.', action = null, icon: Icon = DatabaseZap }) {
  return (
    <div className="admin-card p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      <p className="admin-muted mx-auto mt-2 max-w-xl text-sm leading-relaxed">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function AdminErrorState({ title = 'Something needs attention', description = 'The dashboard could not load this section.', onRetry = null }) {
  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-amber-800">{description}</p>
          </div>
        </div>
        {onRetry && (
          <button type="button" onClick={onRetry} className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-bold text-amber-900 shadow-sm hover:bg-amber-100">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </button>
        )}
      </div>
    </div>
  );
}
