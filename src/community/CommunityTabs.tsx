interface CommunityTabsProps {
  activeTab: 'community' | 'my-templates';
  onTabChange: (tab: 'community' | 'my-templates') => void;
}

export function CommunityTabs({ activeTab, onTabChange }: CommunityTabsProps) {
  return (
    <div className="pit-tabs-wrap">
      <button
        className={`pit-tab ${activeTab === 'community' ? 'pit-tab-active' : ''}`}
        onClick={() => onTabChange('community')}
      >
        Community
      </button>
      <button
        className={`pit-tab ${activeTab === 'my-templates' ? 'pit-tab-active' : ''}`}
        onClick={() => onTabChange('my-templates')}
      >
        My Posts
      </button>
    </div>
  );
}
