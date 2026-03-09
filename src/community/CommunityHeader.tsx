import { Home, User, Users } from 'lucide-react';

interface CommunityHeaderProps {
  onNavigateHome?: () => void;
  onOpenProfile?: () => void;
}

export function CommunityHeader({ onNavigateHome, onOpenProfile }: CommunityHeaderProps) {
  return (
    <header className="pit-community-header">
      <div className="pit-community-header-inner">
        <div className="pit-community-left">
          <button className="pit-icon-btn" aria-label="Go to home" onClick={onNavigateHome}>
            <Home size={18} />
          </button>
          <button className="pit-home-text-btn" aria-label="Go to home" onClick={onNavigateHome}>
            <span>Home</span>
          </button>
        </div>

        <div className="pit-community-right">
          <div className="pit-community-chip">
            <Users size={14} />
            <span>Community</span>
          </div>
          <button className="pit-icon-btn" aria-label="Profile" onClick={onOpenProfile}>
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
