# Quick Fix Script for App.tsx

## STEP 1: Update imports (Line 2)
**FIND THIS LINE:**
```typescript
import { Sparkles, ArrowRight, Copy, Check, History, Trash2, Wand2, ChevronDown, Settings, X, Menu, Mail, FileText, MessageSquare, Code, Briefcase, GraduationCap, LogOut, AlertCircle } from "lucide-react";
```

**REPLACE WITH:**
```typescript
import { Sparkles, ArrowRight, Copy, Check, History, Trash2, Wand2, ChevronDown, X, Menu, Mail, FileText, MessageSquare, Code, Briefcase, GraduationCap, LogOut, Crown, Zap } from "lucide-react";
```

## STEP 2: Add PricingPage import (After line 8)
**ADD THIS LINE:**
```typescript
import { PricingPage } from "./components/PricingPage";
```

## STEP 3: Add UsageInfo interface (After PromptPair interface, around line 17)
**ADD THIS:**
```typescript
interface UsageInfo {
  transformationCount: number;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  freeLimit: number;
  hasUnlimitedAccess: boolean;
}
```

## STEP 4: Remove OLD state variables (Lines 20-27, 40-46, 56)
**DELETE THESE LINES:**
```typescript
  // LLM Provider configurations
  const providerModels: Record<string, { name: string; models: string[] }> = {
    openai: { name: "OpenAI", models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"] },
    anthropic: { name: "Anthropic Claude", models: ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"] },
    google: { name: "Google Gemini", models: ["gemini-1.5-flash-002", "gemini-1.5-pro-002", "gemini-pro"] },
    groq: { name: "Groq", models: ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"] },
    openrouter: { name: "OpenRouter", models: ["openai/gpt-4", "anthropic/claude-3.5-sonnet", "google/gemini-pro"] },
  };

  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"settings" | "about">("settings");
  const [apiKey, setApiKey] = useState("");
  const [apiKeyPreview, setApiKeyPreview] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [llmProvider, setLlmProvider] = useState("openai");
  const [llmModel, setLlmModel] = useState("gpt-4");
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
```

## STEP 5: Add NEW state variables (Where you deleted the old ones)
**ADD THESE:**
```typescript
  const [showPricing, setShowPricing] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
```

## STEP 6: Replace checkApiKeyStatus function (Around line 103-130)
**FIND AND DELETE:**
```typescript
  // Check if user has API key stored
  const checkApiKeyStatus = async (accessToken: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2313fdc9/api-key/status`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Supabase-Auth': accessToken,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHasApiKey(data.hasApiKey);
        setApiKeyPreview(data.preview);
        // Load provider settings if available
        if (data.provider) {
          setLlmProvider(data.provider);
        }
        if (data.model) {
          setLlmModel(data.model);
        }
      }
    } catch (error) {
      console.error('Error checking API key status:', error);
    }
  };
```

**REPLACE WITH:**
```typescript
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
```

## STEP 7: Update auth check (Lines 79 and 95)
**FIND:**
```typescript
await checkApiKeyStatus(session.access_token);
```

**REPLACE WITH:**
```typescript
await loadUsageInfo(session.access_token);
```
(Do this in BOTH places - around line 79 and line 95)

## STEP 8: Add checkout success handler (After the first useEffect, around line 100)
**ADD THIS NEW useEffect:**
```typescript
  // Check for successful checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('checkout') === 'success') {
      toast.success('Welcome to PromptIT Pro! 🎉', {
        description: 'Your subscription is now active. Enjoy unlimited transformations!',
        duration: 5000
      });
      window.history.replaceState({}, '', window.location.pathname);
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) loadUsageInfo(session.access_token);
      });
    } else if (urlParams.get('checkout') === 'cancel') {
      toast.info('Checkout canceled');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
```

## STEP 9: Update handleEnhance function (Around line 236-308)
**FIND THIS SECTION in handleEnhance (after const result = await response.json();):**
```typescript
      if (!response.ok) {
        // Handle specific error cases
        if (result.error?.includes('API key not found')) {
          toast.error('Please add your API key in Settings', {
            duration: 5000,
          });
          // Optionally open settings
          setTimeout(() => setShowSettings(true), 500);
          throw new Error('API key not configured');
        }
```

**REPLACE WITH:**
```typescript
      if (!response.ok) {
        // Handle usage limit reached
        if (result.requiresUpgrade) {
          toast.error(result.message || 'Free transformation limit reached', {
            description: 'Upgrade to Pro for unlimited transformations',
            duration: 6000,
            action: {
              label: 'Upgrade Now',
              onClick: () => setShowPricing(true)
            }
          });
          setTimeout(() => setShowPricing(true), 1000);
          throw new Error('Upgrade required');
        }
```

**AND ADD after setHistory (around line 299):**
```typescript
      // Update usage info
      if (result.usageInfo) {
        setUsageInfo(prev => prev ? {
          ...prev,
          transformationCount: result.usageInfo.used
        } : null);
      }
```

**AND UPDATE the catch block (around line 303):**
```typescript
    } catch (error: any) {
      console.error('Enhancement error:', error);
      if (!error.message.includes('Upgrade required') && !error.message.includes('API key not configured')) {
        toast.error(error.message || 'Failed to enhance prompt');
      }
    } finally {
```

Now continue to PART 2...
