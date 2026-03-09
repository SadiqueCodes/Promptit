import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { CommunityHeader } from './CommunityHeader';
import { CommunityTabs } from './CommunityTabs';
import { CommunitySearch } from './CommunitySearch';
import { CommunityFilters } from './CommunityFilters';
import { PostsFeed } from './PostsFeed';
import { MySidebar } from './MySidebar';
import { NewPostModal } from './NewPostModal';
import { PostDetailModal } from './PostDetailModal';
import { supabase } from '../utils/supabase/client';
import type { Post, Template } from './types';

interface SavedTemplate {
  id: string;
  title: string;
  iconName?: string;
}

interface CommunityPageProps {
  onNavigateHome?: () => void;
  onBack?: () => void;
  userEmail?: string | null;
  templates?: SavedTemplate[];
}

interface PostRow {
  id: string;
  user_id: string | null;
  author: string;
  author_avatar: string | null;
  title: string;
  description: string;
  image_url: string | null;
  upvotes: number | null;
  downvotes: number | null;
  bookmarked: boolean | null;
  category: string;
  created_at: string;
}

interface CommentCountRow {
  post_id: string;
}

function timeAgo(isoTime: string): string {
  const diffMs = Date.now() - new Date(isoTime).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

function mapIcon(iconName?: string): string {
  if (!iconName) return '*';
  const byName: Record<string, string> = {
    Sparkles: '*',
    Mail: 'M',
    FileText: 'T',
    MessageSquare: 'C',
    Code: '</>',
    Briefcase: 'B',
    GraduationCap: 'G',
    Wand2: 'W',
    History: 'H',
  };
  return byName[iconName] || '*';
}

export function CommunityPage({
  onNavigateHome,
  onBack,
  userEmail = null,
  templates = [],
}: CommunityPageProps) {
  const [activeTab, setActiveTab] = useState<'community' | 'my-templates'>('community');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortFilter, setSortFilter] = useState<'hot' | 'new' | 'top'>('hot');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const sidebarTemplates: Template[] = useMemo(
    () => templates.map((template) => ({ id: template.id, title: template.title, icon: mapIcon(template.iconName) })),
    [templates],
  );

  const loadPosts = async () => {
    const { data: postRows, error: postsError } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error loading community posts:', postsError);
      toast.error('Failed to load community feed');
      return;
    }

    const { data: commentRows, error: commentsError } = await supabase
      .from('community_comments')
      .select('post_id');

    if (commentsError) {
      console.error('Error loading comment counts:', commentsError);
    }

    const counts = new Map<string, number>();
    (commentRows as CommentCountRow[] | null)?.forEach((row) => {
      counts.set(row.post_id, (counts.get(row.post_id) || 0) + 1);
    });

    const mapped = ((postRows || []) as PostRow[]).map((row) => ({
      id: row.id,
      userId: row.user_id || undefined,
      author: row.author || 'Anonymous',
      authorAvatar: row.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row.author || 'Anonymous')}`,
      timestamp: timeAgo(row.created_at),
      createdAt: row.created_at,
      title: row.title,
      description: row.description,
      image: row.image_url || undefined,
      upvotes: row.upvotes || 0,
      downvotes: row.downvotes || 0,
      comments: counts.get(row.id) || 0,
      bookmarked: Boolean(row.bookmarked),
      category: row.category || 'general',
    }));

    setPosts(mapped);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(query) || post.description.toLowerCase().includes(query);
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortFilter === 'hot') return b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
    if (sortFilter === 'new') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    return b.upvotes - a.upvotes;
  });

  const updatePostField = async (postId: string, field: 'upvotes' | 'downvotes' | 'bookmarked', value: number | boolean) => {
    const { error } = await supabase.from('community_posts').update({ [field]: value }).eq('id', postId);
    if (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}`);
      await loadPosts();
    }
  };

  const handleUpvote = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const next = post.upvotes + 1;
    setPosts(posts.map((p) => (p.id === postId ? { ...p, upvotes: next } : p)));
    updatePostField(postId, 'upvotes', next);
    toast.success('Upvoted!');
  };

  const handleDownvote = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const next = post.downvotes + 1;
    setPosts(posts.map((p) => (p.id === postId ? { ...p, downvotes: next } : p)));
    updatePostField(postId, 'downvotes', next);
    toast.success('Downvoted!');
  };

  const handleComment = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) setSelectedPost(post);
  };

  const handleBookmark = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const next = !post.bookmarked;
    setPosts(posts.map((p) => (p.id === postId ? { ...p, bookmarked: next } : p)));
    updatePostField(postId, 'bookmarked', next);
    toast.success(next ? 'Added to bookmarks' : 'Removed from bookmarks');
  };

  const handleNewPost = async (postData: Partial<Post>) => {
    const { data: auth } = await supabase.auth.getUser();
    const email = userEmail || auth.user?.email || 'Anonymous';
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: auth.user?.id || null,
        author: email,
        author_avatar: avatar,
        title: postData.title || '',
        description: postData.description || '',
        image_url: postData.image || null,
        category: postData.category || 'general',
        upvotes: 0,
        downvotes: 0,
        bookmarked: false,
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
      return;
    }

    const row = data as PostRow;
    const nextPost: Post = {
      id: row.id,
      userId: row.user_id || undefined,
      author: row.author,
      authorAvatar: row.author_avatar || avatar,
      timestamp: timeAgo(row.created_at),
      createdAt: row.created_at,
      title: row.title,
      description: row.description,
      image: row.image_url || undefined,
      upvotes: row.upvotes || 0,
      downvotes: row.downvotes || 0,
      comments: 0,
      bookmarked: Boolean(row.bookmarked),
      category: row.category,
    };

    setPosts((prev) => [nextPost, ...prev]);
    setShowNewPostModal(false);
    toast.success('Post created successfully!');
  };

  const handleCommentsChanged = (postId: string, commentCount: number) => {
    setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, comments: commentCount } : post)));
    setSelectedPost((prev) => (prev && prev.id === postId ? { ...prev, comments: commentCount } : prev));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <CommunityHeader onNewPost={() => setShowNewPostModal(true)} onNavigateHome={onNavigateHome || onBack} />

      <div className="max-w-[1280px] mx-auto px-6 py-6">
        <CommunityTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'community' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mt-6 h-[calc(100vh-200px)]">
            <div className="overflow-y-auto pr-2 custom-scrollbar">
              <div className="mb-6 space-y-4 sticky top-0 bg-slate-950 z-10 pb-4">
                <CommunitySearch value={searchQuery} onChange={setSearchQuery} />
                <CommunityFilters
                  sortFilter={sortFilter}
                  categoryFilter={categoryFilter}
                  onSortChange={setSortFilter}
                  onCategoryChange={setCategoryFilter}
                  onNewPost={() => setShowNewPostModal(true)}
                />
              </div>

              <PostsFeed
                posts={sortedPosts}
                onUpvote={handleUpvote}
                onDownvote={handleDownvote}
                onComment={handleComment}
                onBookmark={handleBookmark}
              />
            </div>

            <div className="overflow-y-auto custom-scrollbar">
              <MySidebar templates={sidebarTemplates} />
            </div>
          </div>
        ) : (
          <div className="mt-6 h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center">
              <h3 className="text-xl mb-2">My Templates</h3>
              <p className="text-slate-400 mb-6">Your saved templates appear here from Studio.</p>
              <div className="space-y-3">
                {sidebarTemplates.length === 0 ? (
                  <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-400">
                    No saved templates found.
                  </div>
                ) : (
                  sidebarTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-slate-950 border border-slate-700 rounded-lg p-4 text-left hover:border-blue-400 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-sm">
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">{template.title}</h4>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showNewPostModal && <NewPostModal onClose={() => setShowNewPostModal(false)} onSubmit={handleNewPost} />}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          userEmail={userEmail}
          onCommentsChanged={handleCommentsChanged}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}
