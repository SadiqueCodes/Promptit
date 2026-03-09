import { FileText, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  title = 'No posts found',
  description = 'Be the first to share a prompt with the community!',
  actionText = 'Create Post',
  onAction
}: EmptyStateProps) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 mb-6">{description}</p>
        {onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
}
