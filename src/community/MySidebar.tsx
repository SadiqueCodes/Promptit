import type { Template } from './types';

interface MySidebarProps {
  templates: Template[];
}

export function MySidebar({ templates }: MySidebarProps) {
  return (
    <div className="space-y-4">
      {/* My Templates */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-4">My Templates</h3>
        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors group"
            >
              <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-lg">
                {template.icon}
              </div>
              <span className="flex-1 text-sm text-slate-400 group-hover:text-white transition-colors">
                {template.title}
              </span>
              <svg className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-2">About Community</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-3">
          Share and discover amazing prompts created by the PromptIT community. Collaborate, learn, and improve together.
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Members</span>
            <span className="text-white font-medium">12.5k</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Online</span>
            <span className="text-white font-medium">2.3k</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Created</span>
            <span className="text-white font-medium">Jan 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
