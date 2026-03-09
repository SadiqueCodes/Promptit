import { Search } from 'lucide-react';

interface CommunitySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function CommunitySearch({ value, onChange }: CommunitySearchProps) {
  return (
    <div className="pit-search-wrap">
      <Search size={16} className="pit-search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search posts..."
        className="pit-search-input"
      />
    </div>
  );
}
