import { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight, Copy, Check, History, Trash2, Wand2, ChevronDown, X, Menu, Mail, FileText, MessageSquare, Code, Briefcase, GraduationCap, LogOut, User, Settings, Users } from "lucide-react";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import { ScrollArea } from "./components/ui/scroll-area";
import { toast } from "sonner@2.0.3";
import { motion, AnimatePresence } from "motion/react";
import { AuthPage } from "./components/AuthPage";
import { CommunityPage } from "./community";
import { supabase } from "./utils/supabase/client";
import { projectId, publicAnonKey } from "./utils/supabase/info";

interface PromptPair {
  id: string;
  original: string;
  enhanced: string;
  timestamp: Date;
}

interface UsageInfo {
  transformationCount: number;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  freeLimit: number;
  hasUnlimitedAccess: boolean;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [inputPrompt, setInputPrompt] = useState("");
  const [currentPair, setCurrentPair] = useState<PromptPair | null>(null);
  const [history, setHistory] = useState<PromptPair[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isMoodMenuOpen, setIsMoodMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentView, setCurrentView] = useState<"studio" | "community">("studio");
  const [, setShowPricing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"templates" | "history">("templates");
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");
  const [newTemplateIcon, setNewTemplateIcon] = useState("Sparkles");
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const roleMenuRef = useRef<HTMLDivElement | null>(null);
  const moodMenuRef = useRef<HTMLDivElement | null>(null);

  const iconMap: Record<string, any> = {
    Sparkles,
    Mail,
    FileText,
    MessageSquare,
    Code,
    Briefcase,
    GraduationCap,
    Wand2,
    History
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || null);
          // Load usage info
          await loadUsageInfo(session.access_token);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user.email || null);
      if (session) {
        await loadUsageInfo(session.access_token);
      }
    });

    return () => subscription.unsubscribe();
  }, []);



  // Load usage information
  const loadUsageInfo = async (accessToken: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2313fdc9/usage`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Supabase-Auth': accessToken,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsageInfo(data);
      }
    } catch (error) {
      console.error('Error loading usage info:', error);
    }
  };

  // Load custom templates from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('promptit-custom-templates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Restore icon components from icon names
        const restored = parsed.map((template: any) => ({
          ...template,
          icon: iconMap[template.iconName] || Sparkles
        }));
        setCustomTemplates(restored);
      } catch (error) {
        console.error('Failed to load custom templates:', error);
      }
    }
  }, []);

  const roleDescriptions: Record<string, string> = {
    'software-developer': 'an experienced software developer',
    'data-scientist': 'a skilled data scientist',
    'teacher': 'an expert educator',
    'artist': 'a creative artist',
    'writer': 'a professional writer',
    'marketer': 'a marketing specialist',
    'business-analyst': 'a business analyst',
    'designer': 'a creative designer',
    'researcher': 'an academic researcher'
  };

  const moodDescriptions: Record<string, string> = {
    'detailed': 'comprehensive and thorough',
    'concise': 'brief and to the point',
    'professional': 'formal and business-appropriate',
    'casual': 'relaxed and conversational',
    'creative': 'innovative and imaginative',
    'technical': 'precise and technical',
    'formal': 'structured and official',
    'friendly': 'warm and approachable'
  };

  const roleLabels: Record<string, string> = {
    "software-developer": "Developer",
    "data-scientist": "Data Scientist",
    "teacher": "Teacher",
    "artist": "Artist",
    "writer": "Writer",
    "marketer": "Marketer",
    "business-analyst": "Business Analyst",
    "designer": "Designer",
    "researcher": "Researcher",
  };

  const moodLabels: Record<string, string> = {
    "detailed": "Detailed",
    "concise": "Concise",
    "professional": "Professional",
    "casual": "Casual",
    "creative": "Creative",
    "technical": "Technical",
    "formal": "Formal",
    "friendly": "Friendly",
  };

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (roleMenuRef.current && !roleMenuRef.current.contains(target)) {
        setIsRoleMenuOpen(false);
      }
      if (moodMenuRef.current && !moodMenuRef.current.contains(target)) {
        setIsMoodMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const generateEnhancedPrompt = (original: string, role: string, mood: string): string => {
    let enhanced = '';
    
    // Add role context if selected
    if (role && roleDescriptions[role]) {
      enhanced += `Acting as ${roleDescriptions[role]}, `;
    }
    
    // Build the main prompt
    enhanced += `${original}`;
    
    // Add mood-based instructions
    let instructions = '\n\nKey Requirements:\n';
    
    if (mood === 'detailed') {
      instructions += '- Provide comprehensive and in-depth information\n';
      instructions += '- Include relevant examples and context\n';
      instructions += '- Cover all aspects thoroughly\n';
    } else if (mood === 'concise') {
      instructions += '- Keep responses brief and focused\n';
      instructions += '- Prioritize essential information\n';
      instructions += '- Avoid unnecessary details\n';
    } else if (mood === 'professional') {
      instructions += '- Maintain formal and professional tone\n';
      instructions += '- Use industry-standard terminology\n';
      instructions += '- Focus on business value\n';
    } else if (mood === 'casual') {
      instructions += '- Use conversational and friendly tone\n';
      instructions += '- Keep it approachable and easy to understand\n';
      instructions += '- Avoid overly formal language\n';
    } else if (mood === 'creative') {
      instructions += '- Think outside the box\n';
      instructions += '- Explore innovative approaches\n';
      instructions += '- Consider unique perspectives\n';
    } else if (mood === 'technical') {
      instructions += '- Use precise technical terminology\n';
      instructions += '- Include specific details and specifications\n';
      instructions += '- Focus on implementation details\n';
    } else if (mood === 'formal') {
      instructions += '- Maintain official and structured tone\n';
      instructions += '- Follow standard conventions\n';
      instructions += '- Ensure clarity and professionalism\n';
    } else if (mood === 'friendly') {
      instructions += '- Be warm and welcoming\n';
      instructions += '- Use encouraging language\n';
      instructions += '- Make it accessible and supportive\n';
    } else {
      // Default instructions
      instructions += '- Maintain clarity and precision\n';
      instructions += '- Focus on actionable outcomes\n';
      instructions += '- Ensure quality and best practices\n';
    }
    
    enhanced += instructions;
    
    // Add mood-specific output expectation
    if (moodDescriptions[mood]) {
      enhanced += `\nExpected Output:\nProvide a ${moodDescriptions[mood]} response that addresses all aspects of the request.`;
    }

    return enhanced;
  };

  const handleEnhance = async () => {
    if (!inputPrompt.trim() || isEnhancing) return;

    setIsEnhancing(true);
    setCurrentPair(null);

    try {
      const puter = (window as any).puter;
      if (!puter?.ai?.chat) {
        throw new Error('Puter SDK not loaded. Please refresh the page.');
      }

      const roleContext = selectedRole && roleDescriptions[selectedRole]
        ? `Role context: ${roleDescriptions[selectedRole]}.`
        : '';
      const moodContext = selectedMood && moodDescriptions[selectedMood]
        ? `Tone/style: ${moodDescriptions[selectedMood]}.`
        : '';

      const enhancementPrompt = [
        'You are an expert prompt engineer.',
        'Rewrite and enhance the user prompt for better AI output.',
        'Return only the final enhanced prompt text, no preface, no markdown.',
        roleContext,
        moodContext,
        `User prompt:\n${inputPrompt.trim()}`,
      ].filter(Boolean).join('\n\n');

      const aiResponse = await puter.ai.chat(enhancementPrompt, { model: 'gpt-5-nano' });

      const enhancedText =
        typeof aiResponse === 'string'
          ? aiResponse
          : aiResponse?.message?.content ||
            aiResponse?.content ||
            aiResponse?.text ||
            '';

      if (!enhancedText || !String(enhancedText).trim()) {
        throw new Error('Model returned an empty response');
      }

      const newPair: PromptPair = {
        id: Date.now().toString(),
        original: inputPrompt,
        enhanced: String(enhancedText).trim(),
        timestamp: new Date(),
      };

      setCurrentPair(newPair);
      setHistory((prev) => [newPair, ...prev]);

      toast.success('Prompt enhanced successfully!');
    } catch (error: any) {
      console.error('Enhancement error:', error);
      toast.error(error.message || 'Failed to enhance prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleNew = () => {
    setInputPrompt("");
    setCurrentPair(null);
  };

  const loadFromHistory = (pair: PromptPair) => {
    setCurrentPair(pair);
    setInputPrompt(pair.original);
    setShowHistory(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserEmail(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const copyToClipboard = (text: string, id: string) => {
    // Use fallback method directly to avoid permissions issues
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
        setCopiedId(id);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleEnhance();
    }
  };

  const promptTemplates = [
    {
      id: 'email-professional',
      title: 'Professional Email',
      description: 'Craft a formal business email',
      icon: Mail,
      template: 'Write a professional email to [RECIPIENT/COMPANY] about [TOPIC/PURPOSE]. Include the following key points: [LIST YOUR MAIN POINTS HERE]. The tone should be [formal/enthusiastic/respectful]. Structure the email with a clear opening, body with specific details, and a strong closing with a call-to-action. Keep it concise and professional.'
    },
    {
      id: 'email-follow-up',
      title: 'Follow-up Email',
      description: 'Send a polite follow-up message',
      icon: Mail,
      template: 'Write a follow-up email regarding [PREVIOUS INTERACTION/MEETING/APPLICATION] with [PERSON/COMPANY] from [TIMEFRAME]. Politely inquire about [STATUS/NEXT STEPS] while reiterating my interest in [TOPIC/POSITION/PROJECT]. Reference a specific point from our previous conversation: [SPECIFIC DETAIL]. Maintain a professional yet warm tone and express continued availability for [WHAT YOU\'RE OFFERING].'
    },
    {
      id: 'content-blog',
      title: 'Blog Post',
      description: 'Create engaging blog content',
      icon: FileText,
      template: 'Write a blog post about [TOPIC]. Include an attention-grabbing introduction that highlights [HOOK/STATISTICS/PROBLEM]. Discuss [NUMBER] key points: [LIST MAIN POINTS]. Provide real-world examples and practical insights. Target audience: [DESCRIBE YOUR AUDIENCE]. Aim for [WORD COUNT] words. Tone should be [conversational/professional/educational/inspiring]. End with actionable takeaways or a compelling conclusion.'
    },
    {
      id: 'content-social',
      title: 'Social Media Post',
      description: 'Create viral social content',
      icon: MessageSquare,
      template: 'Create an engaging social media post about [TOPIC/ANNOUNCEMENT/PRODUCT]. Highlight the key benefit: [MAIN VALUE PROPOSITION]. Include a compelling hook that addresses [PAIN POINT/PROBLEM]. Use emojis strategically for visual appeal. Add relevant hashtags: [LIST 3-5 HASHTAGS]. Platform: [LinkedIn/Twitter/Instagram/Facebook]. End with a clear call-to-action: [WHAT YOU WANT AUDIENCE TO DO]. Tone: [professional/casual/inspiring/humorous].'
    },
    {
      id: 'code-review',
      title: 'Code Review',
      description: 'Review code for improvements',
      icon: Code,
      template: 'Review the following [LANGUAGE/FRAMEWORK] code for [PURPOSE/FUNCTIONALITY] and suggest improvements. Focus on: performance optimization, security best practices, code readability, error handling, [ADD SPECIFIC AREAS]. Look for potential bugs, memory leaks, and inefficient patterns. Provide specific code examples for each improvement with explanations. Here\'s the code: [PASTE YOUR CODE HERE]'
    },
    {
      id: 'code-debug',
      title: 'Debug Code',
      description: 'Find and fix code issues',
      icon: Code,
      template: 'Help me debug this [LANGUAGE] code that\'s supposed to [INTENDED FUNCTIONALITY], but it\'s showing this error: [ERROR MESSAGE]. The code does [DESCRIBE WHAT THE CODE DOES]. Expected behavior: [WHAT SHOULD HAPPEN]. Actual behavior: [WHAT\'S HAPPENING]. Additional context: [ANY RELEVANT DETAILS]. Please identify the root cause, explain why it\'s happening, provide corrected code with comments, and suggest best practices to prevent similar issues. Code: [PASTE CODE HERE]'
    },
    {
      id: 'business-proposal',
      title: 'Business Proposal',
      description: 'Draft a business proposal',
      icon: Briefcase,
      template: 'Create a business proposal for [PROJECT/SOLUTION/SERVICE] for [CLIENT/COMPANY]. Include: executive summary highlighting [KEY BENEFITS], problem statement ([CURRENT CHALLENGES]), proposed solution ([YOUR OFFERING] with specific features), implementation timeline ([DURATION/PHASES]), cost breakdown ([BUDGET DETAILS]), expected ROI and measurable outcomes, risk mitigation strategies, and a compelling conclusion. Format professionally with clear sections and bullet points for easy reading.'
    },
    {
      id: 'learning-explain',
      title: 'Explain Concept',
      description: 'Learn something new',
      icon: GraduationCap,
      template: 'Explain the concept of [TOPIC/CONCEPT] in simple terms for [TARGET AUDIENCE: e.g., beginners/high school students/non-technical people]. Use everyday analogies and examples. Break down the key components: [LIST MAIN ELEMENTS TO COVER]. Explain [SPECIFIC ASPECT YOU WANT CLARIFIED]. Provide a real-world example or practical application. Address common misconceptions. Avoid jargon and use simple language. Include a brief summary at the end with key takeaways.'
    }
  ];

  const allTemplates = [...customTemplates, ...promptTemplates];

  const saveAsTemplate = () => {
    if (!currentPair || !newTemplateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    const newTemplate = {
      id: `custom-${Date.now()}`,
      title: newTemplateName,
      description: newTemplateDescription || "Custom template",
      iconName: newTemplateIcon,
      icon: iconMap[newTemplateIcon] || Sparkles,
      template: currentPair.enhanced,
      isCustom: true
    };

    const updatedTemplates = [newTemplate, ...customTemplates];
    setCustomTemplates(updatedTemplates);
    localStorage.setItem('promptit-custom-templates', JSON.stringify(updatedTemplates));
    
    setShowSaveTemplateModal(false);
    setNewTemplateName("");
    setNewTemplateDescription("");
    setNewTemplateIcon("Sparkles");
    toast.success("Template saved successfully!");
  };

  const deleteTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedTemplates = customTemplates.filter(t => t.id !== templateId);
    setCustomTemplates(updatedTemplates);
    localStorage.setItem('promptit-custom-templates', JSON.stringify(updatedTemplates));
    toast.success("Template deleted successfully!");
  };

  const useTemplate = (templateData: any) => {
    setShowSidebar(false);
    setShowTemplateGallery(false);
    setSelectedTemplate(templateData);
  };

  const loadFromHistorySidebar = (pair: PromptPair) => {
    setCurrentPair(pair);
    setInputPrompt(pair.original);
    setShowSidebar(false);
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (currentView === "community") {
    return (
      <>
        <CommunityPage
          userEmail={userEmail}
          templates={customTemplates}
          onBack={() => setCurrentView("studio")}
          onOpenProfile={() => setShowSettings(true)}
        />

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-400" />
                    Account Settings
                  </h2>
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">Signed in as</p>
                    <p className="text-white">{userEmail}</p>
                  </div>

                  {usageInfo && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-sm text-slate-400 mb-2">Usage Stats</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          {usageInfo.transformationCount} transformations
                        </span>
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleLogout}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 w-full border border-red-500/20"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Radial gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/10 via-black to-black"></div>
        
        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
        {/* Hamburger menu - floating in top left */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowSidebar(true)}
          className="fixed top-6 left-6 z-40 p-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-full transition-all group"
        >
          <Menu className="w-5 h-5 text-slate-400 group-hover:text-white transition-all duration-300" />
        </motion.button>

        {/* Top right buttons */}
        <div className="fixed top-6 right-6 z-40 flex items-center gap-2">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setCurrentView("community")}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 backdrop-blur-xl border border-cyan-400/25 hover:border-cyan-300/35 rounded-full text-sm text-cyan-100 transition-all"
            title="Open community page"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Community
            </span>
          </motion.button>

          {/* Settings button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setShowSettings(true)}
            className="p-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-full transition-all group"
            title="Account Settings"
          >
            <User className="w-5 h-5 text-slate-400 group-hover:text-white transition-all duration-300" />
          </motion.button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white blur-xl opacity-30 animate-pulse"></div>
              <Sparkles className="w-8 h-8 relative z-10" />
            </div>
            <h1 className="text-5xl tracking-tight flex items-center overflow-visible">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">P</span>
              <motion.span
                initial={{ maxWidth: 0, opacity: 0 }}
                animate={{ 
                  maxWidth: currentPair ? 0 : "200px", 
                  opacity: currentPair ? 0 : 1 
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="inline-block overflow-hidden"
                style={{ verticalAlign: "bottom" }}
              >
                <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent whitespace-nowrap" style={{ fontFamily: "'Courier New', monospace", fontWeight: 300 }}>rompt</span>
              </motion.span>
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">IT</span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm tracking-wide">Transform your prompts into powerful requests</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedTemplate ? (
            // Template Card View
            <motion.div
              key="template"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto"
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
                
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
                  {/* Template Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                      {(() => {
                        const Icon = selectedTemplate.icon;
                        return <Icon className="w-6 h-6 text-purple-400" />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl text-white mb-1">{selectedTemplate.title}</h2>
                      <p className="text-sm text-slate-400">{selectedTemplate.description}</p>
                    </div>
                  </div>

                  {/* Template Content */}
                  <div className="bg-black/20 border border-white/10 rounded-xl p-6 mb-6">
                    <div
                      className="thin-scrollbar"
                      style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "6px", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.28) transparent" }}
                    >
                      <p
                        className="text-white leading-relaxed whitespace-pre-wrap"
                        style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                      >
                        {selectedTemplate.template}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => copyToClipboard(selectedTemplate.template, 'template')}
                      className="flex-1 bg-white text-black hover:bg-slate-100 gap-2 h-11"
                    >
                      {copiedId === 'template' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Template
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setSelectedTemplate(null)}
                      variant="ghost"
                      className="text-slate-400 hover:text-white hover:bg-white/10 gap-2 h-11 px-6"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      Back
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : !currentPair && !isEnhancing ? (
            // Initial input state
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto"
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <Textarea
                    placeholder="Enter your prompt here..."
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[140px] resize-none border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-slate-500 mb-4"
                  />
                  
                  <div className="flex items-center justify-between gap-3 mt-2">
                    <div className="flex items-center gap-4">
                      {/* Role Dropdown */}
                      <div className="relative" ref={roleMenuRef}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRoleMenuOpen((prev) => !prev);
                            setIsMoodMenuOpen(false);
                          }}
                          className="h-9 px-3 rounded-md text-sm border border-white/15 bg-black/40 text-slate-200 hover:bg-white/10 inline-flex items-center gap-1.5 leading-5"
                        >
                          <span>{selectedRole ? roleLabels[selectedRole] : "Role"}</span>
                          <ChevronDown
                            size={12}
                            style={{
                              transform: isRoleMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 150ms ease",
                            }}
                          />
                        </button>
                        {isRoleMenuOpen && (
                          <div
                            className="absolute left-0 min-w-[150px] z-40 rounded-md border border-white/10 bg-black/95 shadow-xl p-1"
                            style={{
                              top: "calc(100% + 8px)",
                            }}
                          >
                            <div className="thin-scrollbar" style={{ maxHeight: "160px", overflowY: "auto", scrollbarWidth: "thin" }}>
                              <button type="button" onClick={() => { setSelectedRole(""); setIsRoleMenuOpen(false); }} className="w-full text-left px-2 py-1.5 text-xs leading-4 rounded text-slate-300 hover:bg-white/10">Role</button>
                              {Object.entries(roleLabels).map(([value, label]) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => {
                                    setSelectedRole(value);
                                    setIsRoleMenuOpen(false);
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-xs leading-4 rounded text-slate-300 hover:bg-white/10"
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mood Dropdown */}
                      <div className="relative" ref={moodMenuRef}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMoodMenuOpen((prev) => !prev);
                            setIsRoleMenuOpen(false);
                          }}
                          className="h-9 px-3 rounded-md text-sm border border-white/15 bg-black/40 text-slate-200 hover:bg-white/10 inline-flex items-center gap-1.5 leading-5"
                        >
                          <span>{selectedMood ? moodLabels[selectedMood] : "Mood"}</span>
                          <ChevronDown
                            size={12}
                            style={{
                              transform: isMoodMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 150ms ease",
                            }}
                          />
                        </button>
                        {isMoodMenuOpen && (
                          <div
                            className="absolute left-0 min-w-[130px] z-40 rounded-md border border-white/10 bg-black/95 shadow-xl p-1"
                            style={{
                              top: "calc(100% + 8px)",
                            }}
                          >
                            <div className="thin-scrollbar" style={{ maxHeight: "160px", overflowY: "auto", scrollbarWidth: "thin" }}>
                              <button type="button" onClick={() => { setSelectedMood(""); setIsMoodMenuOpen(false); }} className="w-full text-left px-2 py-1.5 text-xs leading-4 rounded text-slate-300 hover:bg-white/10">Mood</button>
                              {Object.entries(moodLabels).map(([value, label]) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => {
                                    setSelectedMood(value);
                                    setIsMoodMenuOpen(false);
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-xs leading-4 rounded text-slate-300 hover:bg-white/10"
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={handleEnhance}
                      disabled={!inputPrompt.trim()}
                      className="bg-white text-black hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed gap-2 h-9"
                    >
                      <Wand2 className="w-4 h-4" />
                      Enhance Prompt
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : isEnhancing ? (
            // Loading state
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <div className="relative mb-6">
                <motion.div
                  className="w-20 h-20 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
              </div>
              <p className="text-slate-400">Enhancing your prompt...</p>
            </motion.div>
          ) : currentPair ? (
            // Split view result
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                {/* Original prompt */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative group"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-slate-600/20 to-slate-800/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm text-slate-400">Original Prompt</h3>
                    </div>
                    <div
                      className="thin-scrollbar"
                      style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "6px", width: "100%", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.28) transparent" }}
                    >
                      <p
                        className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap w-full"
                        style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                      >
                        {currentPair.original}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Arrow - centered between cards */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <ArrowRight className="w-5 h-5 text-slate-600" />
                  </motion.div>
                </div>

                {/* Enhanced prompt */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative group"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 h-full shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-slate-400" />
                        <h3 className="text-sm text-slate-300">Enhanced Prompt</h3>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(currentPair.enhanced, currentPair.id)}
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-white hover:bg-white/10 h-8 gap-2"
                      >
                        {copiedId === currentPair.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-xs">Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <div
                      className="thin-scrollbar"
                      style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "6px", width: "100%", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.28) transparent" }}
                    >
                      <p
                        className="text-white text-sm leading-relaxed whitespace-pre-wrap w-full"
                        style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                      >
                        {currentPair.enhanced}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center gap-4"
              >
                <Button
                  onClick={handleNew}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  Enhance Another
                </Button>
                <Button
                  onClick={() => setShowSaveTemplateModal(true)}
                  className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 text-purple-200 hover:text-purple-100 gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Save as Template
                </Button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* History drawer */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <History className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h2 className="text-xl">History</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{history.length} prompt{history.length !== 1 ? 's' : ''} enhanced</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setHistory([]);
                      setShowHistory(false);
                      toast.success("History cleared");
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </Button>
                </div>

                <ScrollArea className="h-[calc(85vh-140px)]">
                  <div className="space-y-2 pr-4">
                    {history.map((pair, index) => (
                      <motion.button
                        key={pair.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => loadFromHistory(pair)}
                        className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all group"
                      >
                        <p className="text-sm text-white line-clamp-2 mb-2">
                          {pair.original}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{pair.timestamp.toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{pair.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>



        {/* Settings/Account Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-400" />
                    Account Settings
                  </h2>
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">Signed in as</p>
                    <p className="text-white">{userEmail}</p>
                  </div>

                  {usageInfo && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-sm text-slate-400 mb-2">Usage Stats</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          {usageInfo.transformationCount} transformations
                        </span>
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleLogout}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 w-full border border-red-500/20"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs text-slate-500 text-center">
                    PromptIT v1.0 • Powered by Google Gemini
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Side Drawer - Templates & History */}
        <AnimatePresence>
          {showSidebar && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
                onClick={() => setShowSidebar(false)}
              />
              
              {/* Drawer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-full max-w-md bg-zinc-900/98 backdrop-blur-xl border-r border-white/10 shadow-2xl"
              >
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                          <Menu className="w-5 h-5 text-slate-400" />
                        </div>
                        <h2 className="text-xl">Menu</h2>
                      </div>
                      <Button
                        onClick={() => setShowSidebar(false)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-white/10">
                      <button
                        onClick={() => setSidebarTab("templates")}
                        className={`px-4 py-2 text-sm transition-all relative ${
                          sidebarTab === "templates"
                            ? "text-white"
                            : "text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        Templates
                        {sidebarTab === "templates" && (
                          <motion.div
                            layoutId="sidebarTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </button>
                      <button
                        onClick={() => setSidebarTab("history")}
                        className={`px-4 py-2 text-sm transition-all relative ${
                          sidebarTab === "history"
                            ? "text-white"
                            : "text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        History
                        {sidebarTab === "history" && (
                          <motion.div
                            layoutId="sidebarTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <ScrollArea className="flex-1 p-6">
                    <AnimatePresence mode="wait">
                      {sidebarTab === "templates" ? (
                        <motion.div
                          key="templates"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="space-y-3"
                        >
                          <p className="text-xs text-slate-500 mb-4">Choose a template to get started quickly</p>
                          
                          <div className="grid gap-3">
                            {allTemplates.slice(0, 4).map((template, index) => {
                              const Icon = template.icon;
                              return (
                                <motion.div
                                  key={template.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="group relative"
                                >
                                  <button
                                    onClick={() => useTemplate(template)}
                                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-lg transition-all"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="p-1.5 bg-white/5 rounded-md">
                                        <Icon className="w-4 h-4 text-slate-400" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h3 className="text-sm text-white mb-0.5">
                                          {template.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 line-clamp-1">
                                          {template.description}
                                        </p>
                                      </div>
                                    </div>
                                  </button>

                                  {/* Delete button for custom templates */}
                                  {template.isCustom && (
                                    <button
                                      onClick={(e) => deleteTemplate(template.id, e)}
                                      className="absolute top-2 right-2 p-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded opacity-0 group-hover:opacity-100 transition-all"
                                      title="Delete template"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-400" />
                                    </button>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* See More button */}
                          <button
                            onClick={() => {
                              setShowSidebar(false);
                              setShowTemplateGallery(true);
                            }}
                            className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 border border-purple-500/20 hover:border-purple-500/30 rounded-xl text-sm text-purple-300 hover:text-purple-200 transition-all flex items-center justify-center gap-2 group"
                          >
                            <span>See All Templates</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="history"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-3"
                        >
                          {history.length > 0 ? (
                            <>
                              <div className="flex items-center justify-between mb-4">
                                <p className="text-xs text-slate-500">{history.length} prompt{history.length !== 1 ? 's' : ''} enhanced</p>
                                <Button
                                  onClick={() => {
                                    setHistory([]);
                                    toast.success("History cleared");
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 text-xs gap-1.5"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Clear
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                {history.map((pair, index) => (
                                  <motion.button
                                    key={pair.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => loadFromHistorySidebar(pair)}
                                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all group"
                                  >
                                    <p className="text-sm text-white line-clamp-2 mb-2">
                                      {pair.original}
                                    </p>
                                    
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                      <span>{pair.timestamp.toLocaleDateString()}</span>
                                      <span>•</span>
                                      <span>{pair.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                  </motion.button>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-12">
                              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <History className="w-8 h-8 text-slate-600" />
                              </div>
                              <p className="text-sm text-slate-400 mb-1">No history yet</p>
                              <p className="text-xs text-slate-600">Your enhanced prompts will appear here</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </ScrollArea>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Template Gallery - Full Screen */}
        <AnimatePresence>
          {showTemplateGallery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-md overflow-auto"
              onClick={() => setShowTemplateGallery(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-6xl my-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl mb-2">Prompt Templates</h2>
                    <p className="text-slate-400 text-sm">Choose from our curated collection of templates</p>
                  </div>
                  <Button
                    onClick={() => setShowTemplateGallery(false)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-white/10 h-10 w-10 p-0"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allTemplates.map((template, index) => {
                    const Icon = template.icon;
                    return (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative"
                      >
                        <button
                          onClick={() => {
                            useTemplate(template);
                          }}
                          className="w-full aspect-square bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl p-6 transition-all flex flex-col items-center justify-center text-center"
                        >
                          {/* Icon */}
                          <div className="mb-3 p-3 bg-white/5 rounded-lg">
                            <Icon className="w-6 h-6 text-slate-400" />
                          </div>
                          
                          {/* Text */}
                          <h3 className="text-sm text-white mb-1">
                            {template.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {template.description}
                          </p>
                        </button>

                        {/* Delete button for custom templates */}
                        {template.isCustom && (
                          <button
                            onClick={(e) => deleteTemplate(template.id, e)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete template"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Template Modal */}
        <AnimatePresence>
          {showSaveTemplateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
              onClick={() => setShowSaveTemplateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="text-xl">Save as Template</h2>
                  </div>
                  <Button
                    onClick={() => setShowSaveTemplateModal(false)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Template Name *</label>
                    <input
                      type="text"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="e.g., My Custom Template"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Description</label>
                    <input
                      type="text"
                      value={newTemplateDescription}
                      onChange={(e) => setNewTemplateDescription(e.target.value)}
                      placeholder="Brief description of this template"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Icon</label>
                    <select
                      value={newTemplateIcon}
                      onChange={(e) => setNewTemplateIcon(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
                    >
                      <option value="Sparkles">✨ Sparkles</option>
                      <option value="Mail">📧 Mail</option>
                      <option value="FileText">📄 File Text</option>
                      <option value="MessageSquare">💬 Message</option>
                      <option value="Code">💻 Code</option>
                      <option value="Briefcase">💼 Briefcase</option>
                      <option value="GraduationCap">🎓 Education</option>
                      <option value="Wand2">🪄 Wand</option>
                      <option value="History">🕐 History</option>
                    </select>
                  </div>

                  {/* Preview */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-2">Preview:</p>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        {(() => {
                          const PreviewIcon = iconMap[newTemplateIcon] || Sparkles;
                          return <PreviewIcon className="w-4 h-4 text-purple-400" />;
                        })()}
                      </div>
                      <div>
                        <p className="text-sm text-white">{newTemplateName || "Template Name"}</p>
                        <p className="text-xs text-slate-500">{newTemplateDescription || "Description"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => setShowSaveTemplateModal(false)}
                      variant="ghost"
                      className="flex-1 text-slate-400 hover:text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveAsTemplate}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    >
                      Save Template
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
