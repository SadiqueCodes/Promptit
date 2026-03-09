import { useState } from 'react';
import { ArrowUp, ArrowDown, MessageSquare, Bookmark } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import type { Post } from './types';

interface PostCardProps {
  post: Post;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onComment: (id: string) => void;
  onBookmark: (id: string) => void;
}

export function PostCard({ post, onUpvote, onDownvote, onComment, onBookmark }: PostCardProps) {
  const [userVoted, setUserVoted] = useState<'up' | 'down' | null>(null);

  const handleUpvote = () => {
    if (userVoted !== 'up') {
      onUpvote(post.id);
      setUserVoted('up');
    }
  };

  const handleDownvote = () => {
    if (userVoted !== 'down') {
      onDownvote(post.id);
      setUserVoted('down');
    }
  };

  const copyToClipboard = (text: string) => {
    // Use fallback method to avoid permissions issues
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success("Prompt copied to clipboard!");
      } else {
        toast.error("Failed to copy");
      }
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error("Failed to copy");
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-400/50 transition-colors">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={post.authorAvatar}
            alt={post.author}
            className="w-10 h-10 rounded-full bg-slate-800"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{post.author}</span>
              <span className="text-xs text-slate-400">{post.timestamp}</span>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(post.description)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-md transition-colors"
          >
            Copy Prompt
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-[1fr_auto] gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
              {post.description}
            </p>
          </div>
          {post.image && (
            <div className="w-40 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-800">
          {/* Upvote/Downvote */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUpvote}
              className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${
                userVoted === 'up' ? 'text-blue-400' : 'text-slate-400'
              }`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-white min-w-[2rem] text-center">
              {post.upvotes - post.downvotes}
            </span>
            <button
              onClick={handleDownvote}
              className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${
                userVoted === 'down' ? 'text-red-500' : 'text-slate-400'
              }`}
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* Comments */}
          <button
            onClick={() => onComment(post.id)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">{post.comments}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={() => onBookmark(post.id)}
            className={`ml-auto p-1.5 rounded hover:bg-slate-700 transition-colors ${
              post.bookmarked ? 'text-orange-300' : 'text-slate-400'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${post.bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
