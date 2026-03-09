import { Plus } from 'lucide-react';

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
    <div className="pit-filter-row">
      <div className="pit-filter-group">
        <label className="pit-label">Sort by</label>
        <select
          value={sortFilter}
          onChange={(e) => onSortChange(e.target.value as 'hot' | 'new' | 'top')}
          className="pit-select"
          style={{ colorScheme: 'dark' }}
        >
          <option value="hot">Hot</option>
          <option value="new">New</option>
          <option value="top">Top</option>
        </select>
      </div>

      <div className="pit-filter-group">
        <label className="pit-label">Category</label>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="pit-select"
          style={{ colorScheme: 'dark' }}
        >
          <option value="all">All</option>
          <option value="writing">Writing</option>
          <option value="coding">Coding</option>
          <option value="marketing">Marketing</option>
          <option value="ai-tools">AI Tools</option>
          <option value="other">Other</option>
        </select>
      </div>

      <button onClick={onNewPost} className="pit-new-post-btn">
        <Plus size={16} />
        <span>New Template Post</span>
      </button>
    </div>
  );
}
