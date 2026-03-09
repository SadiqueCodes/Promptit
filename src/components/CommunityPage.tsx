import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ImagePlus,
  Search,
  Upload,
  Users,
  X,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner@2.0.3";

interface SavedTemplate {
  id: string;
  title: string;
  description: string;
  template: string;
}

interface CommunityPost {
  id: string;
  templateId: string;
  templateTitle: string;
  templateDescription: string;
  prompt: string;
  caption: string;
  promptType: string;
  imageUrl: string | null;
  author: string;
  createdAt: string;
}

interface CommunityPageProps {
  userEmail: string | null;
  templates: SavedTemplate[];
  onBack: () => void;
}

const COMMUNITY_STORAGE_KEY = "promptit-community-posts";

const DEFAULT_TYPES = [
  "Email",
  "Code",
  "Marketing",
  "Business",
  "Education",
  "Social",
  "Content",
];

export function CommunityPage({ userEmail, templates, onBack }: CommunityPageProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [caption, setCaption] = useState("");
  const [promptType, setPromptType] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setPosts(parsed);
      }
    } catch (error) {
      console.error("Failed to parse community posts:", error);
    }
  }, []);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return posts;

    return posts.filter((post) => {
      return (
        post.templateTitle.toLowerCase().includes(q) ||
        post.caption.toLowerCase().includes(q) ||
        post.promptType.toLowerCase().includes(q) ||
        post.prompt.toLowerCase().includes(q)
      );
    });
  }, [posts, searchQuery]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const persistPosts = (nextPosts: CommunityPost[]) => {
    setPosts(nextPosts);
    localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(nextPosts));
  };

  const handleImageChange = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!selectedTemplate) {
      toast.error("Select a saved template first");
      return;
    }
    if (!caption.trim()) {
      toast.error("Caption is required");
      return;
    }
    if (!promptType.trim()) {
      toast.error("Prompt type is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const nextPost: CommunityPost = {
        id: Date.now().toString(),
        templateId: selectedTemplate.id,
        templateTitle: selectedTemplate.title,
        templateDescription: selectedTemplate.description,
        prompt: selectedTemplate.template,
        caption: caption.trim(),
        promptType: promptType.trim(),
        imageUrl,
        author: userEmail || "Anonymous",
        createdAt: new Date().toISOString(),
      };

      persistPosts([nextPost, ...posts]);
      setSelectedTemplateId("");
      setCaption("");
      setPromptType("");
      setImageUrl(null);
      toast.success("Shared with community");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPrompt = (post: CommunityPost) => {
    const textArea = document.createElement("textarea");
    textArea.value = post.prompt;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const ok = document.execCommand("copy");
      if (ok) {
        setCopiedPostId(post.id);
        setTimeout(() => setCopiedPostId(null), 1500);
        toast.success("Prompt copied");
      } else {
        toast.error("Copy failed");
      }
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Copy failed");
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-950" />
        <motion.div
          className="absolute top-20 left-10 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl"
          animate={{ x: [0, 70, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-0 w-[420px] h-[420px] rounded-full bg-emerald-500/10 blur-3xl"
          animate={{ x: [0, -90, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="ghost"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Studio
            </Button>
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-400/20">
              <Users className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl">Community</h1>
              <p className="text-xs md:text-sm text-slate-400">
                Share your saved templates, add context, and discover prompt styles.
              </p>
            </div>
          </div>
          <div className="w-full md:w-auto md:min-w-[320px]">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by type, caption, or prompt..."
                className="pl-9 bg-white/5 border-white/15 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
              <h2 className="text-lg mb-4">Share a Template</h2>

              {templates.length === 0 ? (
                <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                  No saved templates yet. Save a prompt as a template in Studio, then share it here.
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Saved template</label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => {
                        setSelectedTemplateId(e.target.value);
                        const selected = templates.find((t) => t.id === e.target.value);
                        if (selected && !promptType) {
                          setPromptType(selected.title);
                        }
                      }}
                      className="w-full bg-white/5 border border-white/15 rounded-lg h-10 px-3 text-sm text-white"
                    >
                      <option value="">Select template</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Prompt type</label>
                    <Input
                      value={promptType}
                      onChange={(e) => setPromptType(e.target.value)}
                      placeholder="ex: Email, Marketing, Code Review"
                      className="bg-white/5 border-white/15 text-white placeholder:text-slate-500"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {DEFAULT_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setPromptType(type)}
                          className="px-2.5 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Caption</label>
                    <Textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="What problem does this prompt solve? How should others use it?"
                      className="min-h-24 bg-white/5 border-white/15 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Optional image</label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-sm cursor-pointer">
                        <ImagePlus className="w-4 h-4" />
                        Upload image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                        />
                      </label>
                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageUrl(null)}
                          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                          Remove
                        </button>
                      )}
                    </div>
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt="Selected"
                        className="mt-3 w-full h-36 object-cover rounded-xl border border-white/15"
                      />
                    )}
                  </div>

                  <Button
                    onClick={handlePublish}
                    disabled={isSubmitting || templates.length === 0}
                    className="w-full h-11 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:from-cyan-400 hover:to-emerald-400"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Publishing..." : "Publish to Community"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl min-h-[620px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg">Community Feed</h2>
                <span className="text-xs text-slate-400">
                  {filteredPosts.length} result{filteredPosts.length !== 1 ? "s" : ""}
                </span>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="h-[520px] flex items-center justify-center text-center border border-dashed border-white/15 rounded-xl">
                  <div>
                    <Users className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                    <p className="text-slate-300 mb-1">No community posts yet</p>
                    <p className="text-xs text-slate-500">
                      Share your first prompt template to start the feed.
                    </p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[560px] pr-3">
                  <div className="space-y-4">
                    {filteredPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/30 border border-white/10 rounded-xl p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="px-2 py-1 rounded-full text-[11px] bg-cyan-500/15 border border-cyan-400/25 text-cyan-200">
                            {post.promptType}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(post.createdAt).toLocaleString()}
                          </span>
                          <span className="text-[11px] text-slate-500">by {post.author}</span>
                        </div>

                        <h3 className="text-sm text-white mb-1">{post.templateTitle}</h3>
                        <p className="text-xs text-slate-400 mb-3">{post.templateDescription}</p>

                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt={post.templateTitle}
                            className="w-full h-44 object-cover rounded-lg border border-white/10 mb-3"
                          />
                        )}

                        <p className="text-sm text-slate-200 mb-3">{post.caption}</p>

                        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-2">Prompt</p>
                          <p className="text-xs text-slate-300 whitespace-pre-wrap line-clamp-4">
                            {post.prompt}
                          </p>
                        </div>

                        <div className="mt-3 flex justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyPrompt(post)}
                            className="text-slate-300 hover:text-white hover:bg-white/10"
                          >
                            {copiedPostId === post.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 mr-1" />
                                Copy prompt
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
