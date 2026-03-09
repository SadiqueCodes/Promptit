import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import type { Post } from './types';

interface NewPostModalProps {
  onClose: () => void;
  onSubmit: (post: Partial<Post>) => void;
}

export function NewPostModal({ onClose, onSubmit }: NewPostModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [imageUrl, setImageUrl] = useState('');

  const submitPost = () => {
    if (!title.trim() || !description.trim()) return;

    onSubmit({
      title,
      description,
      category,
      image: imageUrl || undefined,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('general');
    setImageUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPost();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Create New Post</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your prompt in detail..."
              rows={6}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none transition-colors resize-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none transition-colors"
            >
              <option value="general">General</option>
              <option value="creative">Creative</option>
              <option value="marketing">Marketing</option>
              <option value="technical">Technical</option>
              <option value="design">Design</option>
              <option value="discussion">Discussion</option>
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Image URL (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none transition-colors"
              />
              <button
                type="button"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          </div>

          {/* Preview */}
          {imageUrl && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">Image Preview</label>
              <div className="w-full h-48 bg-slate-950 border border-slate-700 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImageUrl('')}
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submitPost}
            disabled={!title.trim() || !description.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Create Post
          </button>
        </div>
      </div>
    </div>
  );
}
