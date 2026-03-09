interface CommunityTabsProps {
  activeTab: 'community' | 'my-templates';
  onTabChange: (tab: 'community' | 'my-templates') => void;
}

export function CommunityTabs({ activeTab, onTabChange }: CommunityTabsProps) {
  return (
    <div className="border-b border-slate-700">
      <nav className="flex gap-6">
        <button
          onClick={() => onTabChange('community')}
          className={`pb-3 px-1 border-b-2 transition-colors ${
            activeTab === 'community'
              ? 'border-orange-400 text-white'
              : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          Community
        </button>
        <button
          onClick={() => onTabChange('my-templates')}
          className={`pb-3 px-1 border-b-2 transition-colors ${
            activeTab === 'my-templates'
              ? 'border-orange-400 text-white'
              : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          My Templates
        </button>
      </nav>
    </div>
  );
}
