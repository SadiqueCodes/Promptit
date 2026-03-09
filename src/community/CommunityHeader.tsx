import { Menu, Sparkles, User, Bell, Home } from 'lucide-react';

interface CommunityHeaderProps {
  onNewPost: () => void;
  onNavigateHome?: () => void;
}

export function CommunityHeader({ onNewPost, onNavigateHome }: CommunityHeaderProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-4">
            {onNavigateHome && (
              <button 
                onClick={onNavigateHome}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
                title="Back to Home"
              >
                <Home className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-white" />
              <h1 className="text-xl font-semibold text-white">
                PromptIT <span className="text-slate-400 font-normal">Community</span>
              </h1>
            </div>
          </div>

          {/* Right: User actions */}
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg cursor-pointer hover:border-slate-400/50 transition-colors">
              <span className="text-sm text-slate-400">Emaiance maara</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <User className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
