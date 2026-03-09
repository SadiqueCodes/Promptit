import { Plus, MoreHorizontal } from 'lucide-react';

interface CommunityFiltersProps {
  sortFilter: 'hot' | 'new' | 'top';
  categoryFilter: string;
  onSortChange: (filter: 'hot' | 'new' | 'top') => void;
  onCategoryChange: (category: string) => void;
  onNewPost: () => void;
}

export function CommunityFilters({
  sortFilter,
  categoryFilter,
  onSortChange,
  onCategoryChange,
  onNewPost,
}: CommunityFiltersProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left: Sort filters */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSortChange('hot')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            sortFilter === 'hot'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Hot
        </button>
        <button
          onClick={() => onSortChange('new')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            sortFilter === 'new'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          New
        </button>
        <button
          onClick={() => onSortChange('top')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            sortFilter === 'top'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Top
        </button>
      </div>

      {/* Right: Category filter and actions */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="appearance-none bg-slate-800 border border-slate-700 text-white text-sm rounded-lg pl-3 pr-8 py-2 cursor-pointer hover:bg-slate-700 transition-colors focus:outline-none focus:border-blue-400"
          >
            <option value="all">All</option>
            <option value="creative">Creative</option>
            <option value="marketing">Marketing</option>
            <option value="technical">Technical</option>
            <option value="design">Design</option>
            <option value="discussion">Discussion</option>
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <MoreHorizontal className="w-5 h-5 text-slate-400" />
        </button>

        <button
          onClick={onNewPost}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Template Post
        </button>
      </div>
    </div>
  );
}
