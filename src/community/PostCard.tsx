import { useState } from 'react';
import { ArrowUp, ArrowDown, MessageSquare, Bookmark, Copy, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { DEFAULT_PROMPT_IMAGE } from './constants';
import type { Post } from './types';

interface PostCardProps {
  post: Post;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onComment: (id: string) => void;
  onBookmark: (id: string) => void;
  onOpenPost: (post: Post) => void;
}

export function PostCard({ post, onUpvote, onDownvote, onComment, onBookmark, onOpenPost }: PostCardProps) {
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    const textArea = document.createElement('textarea');
    textArea.value = post.description;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const ok = document.execCommand('copy');
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
        toast.success('Copied!');
      }
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return (
    <article className="pit-post-card">
      <header className="pit-post-header">
        <img src={post.authorAvatar} alt={post.author} className="pit-avatar" />
        <div>
          <div className="pit-author">{post.author}</div>
          <div className="pit-time">{post.timestamp}</div>
        </div>
      </header>

      <h3 className="pit-post-title">{post.title}</h3>

      <div className="pit-post-content-box">
        <p className="pit-post-content pit-line-clamp-4">{post.description}</p>
        <div className="pit-post-actions-top">
          <button className="pit-link-btn" onClick={() => onOpenPost(post)}>View Full Prompt</button>
          <button className="pit-mini-btn" onClick={copyPrompt}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
          </button>
        </div>
      </div>

      <div className="pit-image-wrap">
        <div className="pit-image-stage">
          <div
            className="pit-image-blur-bg"
            style={{ backgroundImage: `url(${post.image || DEFAULT_PROMPT_IMAGE})` }}
          />
          <ImageWithFallback
            src={post.image || DEFAULT_PROMPT_IMAGE}
            alt={post.title}
            className="pit-post-image-contained"
          />
        </div>
      </div>

      <div className="pit-interaction-bar">
        <button className="pit-vote-btn" onClick={() => onUpvote(post.id)}>
          <ArrowUp size={16} />
          <span>{post.upvotes}</span>
        </button>
        <button className="pit-vote-btn" onClick={() => onDownvote(post.id)}>
          <ArrowDown size={16} />
          <span>{post.downvotes}</span>
        </button>
        <button className="pit-vote-btn" onClick={() => onComment(post.id)}>
          <MessageSquare size={16} />
          <span>{post.comments}</span>
        </button>
        <button className="pit-bookmark-btn" onClick={() => onBookmark(post.id)}>
          <Bookmark size={16} className={post.bookmarked ? 'pit-bookmarked' : ''} />
        </button>
      </div>
    </article>
  );
}
