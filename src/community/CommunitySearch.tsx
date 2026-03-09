import { Search } from 'lucide-react';

interface CommunitySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function CommunitySearch({ value, onChange }: CommunitySearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search posts..."
        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none transition-colors"
      />
    </div>
  );
}
