import { Eye, BookmarkX } from 'lucide-react';
import type { Post } from './types';

interface MySidebarProps {
  posts: Post[];
  onOpenPost: (post: Post) => void;
  onUnsavePost: (postId: string) => void;
}

function cleanPromptText(value: string): string {
  return value
    .split(/\r?\n/)
    .filter((line) => !/^\s*tags:\s*/i.test(line))
    .join('\n')
    .trim();
}

export function MySidebar({ posts, onOpenPost, onUnsavePost }: MySidebarProps) {
  return (
    <aside className="pit-sidebar-card">
      <h3 className="pit-sidebar-title">Saved Posts</h3>

      {posts.length === 0 ? (
        <p className="pit-muted">No saved posts yet. Tap the save icon on any post.</p>
      ) : (
        <div className="pit-sidebar-list">
          {posts.map((post) => (
            <div key={post.id} className="pit-sidebar-item">
              <div className="pit-sidebar-item-title">{post.title}</div>
              <p className="pit-muted pit-line-clamp-4">{cleanPromptText(post.description)}</p>
              <div className="pit-sidebar-item-actions">
                <button className="pit-mini-btn" onClick={() => onOpenPost(post)}>
                  <Eye size={13} />
                  <span>View</span>
                </button>
                <button className="pit-mini-btn" onClick={() => onUnsavePost(post.id)}>
                  <BookmarkX size={13} />
                  <span>Unsave</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
