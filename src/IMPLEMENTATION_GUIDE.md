# PromptIT Paid Service Implementation Guide

## ✅ What Has Been Completed

### 1. Backend Updates (`/supabase/functions/server/index.tsx`)
- ✅ Added hardcoded Gemini API key: `AIzaSyAbyxQu_ITEIOQIjw3IawrcJx57lYZAMTY`
- ✅ Replaced user API key system with server-managed API
- ✅ Implemented usage tracking system (stores transformation count per user in KV)
- ✅ Added Stripe integration with checkout and webhook handling
- ✅ Implemented 5 free transformations limit
- ✅ Created `/usage` endpoint to get user's usage stats
- ✅ Created `/create-checkout` endpoint for Stripe payment
- ✅ Created `/stripe-webhook` endpoint for handling subscription events
- ✅ Modified `/enhance` endpoint to:
  - Check usage limits before processing
  - Use hardcoded Gemini API instead of user's API key
  - Increment usage counter after successful transformation
  - Return upgrade requirement when limit reached

### 2. Frontend Components
- ✅ Created `/components/PricingPage.tsx` - Beautiful pricing modal with:
  - Monthly and yearly billing toggle
  - Free vs Pro plan comparison
  - Stripe checkout integration
  - Usage display
  - Feature comparison section

## 📋 What Needs To Be Done

### Step 1: Update Environment Variables in Supabase

Add these environment variables to your Supabase Edge Function:

```bash
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your Stripe webhook secret
APP_URL=https://your-app-url.com # Your production URL
```

### Step 2: Set Up Stripe

1. **Create Stripe Account** (if you haven't):
   - Go to https://stripe.com and create an account
   - Get your API keys from the Dashboard

2. **Create Products & Prices**:
   - Create a "PromptIT Pro Monthly" product with price $9.99/month
   - Create a "PromptIT Pro Yearly" product with price $99.99/year
   - Copy the Price IDs (they look like `price_xxxxxxxxxxxxx`)

3. **Update PricingPage.tsx**:
   Replace the placeholder price IDs in `/components/PricingPage.tsx`:
   ```typescript
   const STRIPE_PRICE_IDS = {
     monthly: "price_xxxxxxxxxxxxx", // Your actual monthly price ID
     yearly: "price_yyyyyyyyyyyyy"   // Your actual yearly price ID
   };
   ```

4. **Set Up Webhook**:
   - In Stripe Dashboard, go to Developers → Webhooks
   - Add endpoint: `https://your-project.supabase.co/functions/v1/make-server-2313fdc9/stripe-webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the webhook signing secret and add it to your Supabase environment variables

### Step 3: Update App.tsx

The App.tsx file needs significant updates. Here are the key changes needed:

#### Remove These Imports and State Variables:
```typescript
// REMOVE:
import { Settings, AlertCircle } from "lucide-react";
const [showSettings, setShowSettings] = useState(false);
const [settingsTab, setSettingsTab] = useState<"settings" | "about">("settings");
const [apiKey, setApiKey] = useState("");
const [apiKeyPreview, setApiKeyPreview] = useState<string | null>(null);
const [hasApiKey, setHasApiKey] = useState(false);
const [llmProvider, setLlmProvider] = useState("openai");
const [llmModel, setLlmModel] = useState("gpt-4");
const [isSavingApiKey, setIsSavingApiKey] = useState(false);
const providerModels = { ... }; // Remove this object
```

#### Add These Imports and State Variables:
```typescript
// ADD:
import { Crown, Zap } from "lucide-react";
import { PricingPage } from "./components/PricingPage";

const [showPricing, setShowPricing] = useState(false);
const [showAbout, setShowAbout] = useState(false);
const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);

interface UsageInfo {
  transformationCount: number;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  freeLimit: number;
  hasUnlimitedAccess: boolean;
}
```

#### Replace checkApiKeyStatus with loadUsageInfo:
```typescript
// REMOVE checkApiKeyStatus function

// ADD this function:
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

#### Update the authentication useEffect:
```typescript
// CHANGE:
await checkApiKeyStatus(session.access_token);
// TO:
await loadUsageInfo(session.access_token);
```

#### Add checkout success handler:
```typescript
// ADD this useEffect after authentication check:
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
  }
}, []);
```

#### Update handleEnhance function:
```typescript
// In handleEnhance, add this error handling after response:
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
  // ... rest of error handling
}

// After successful enhancement, update usage:
if (result.usageInfo) {
  setUsageInfo(prev => prev ? {
    ...prev,
    transformationCount: result.usageInfo.used
  } : null);
}
```

#### Replace Settings Button with Usage/Account Buttons:
```typescript
// REMOVE the Settings button code

// ADD these buttons in the top-right area:
<div className="fixed top-6 right-6 z-40 flex items-center gap-2">
  {/* Usage indicator */}
  {usageInfo && (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => setShowPricing(true)}
      className={`px-4 py-2 backdrop-blur-xl border rounded-full transition-all text-sm font-medium ${
        usageInfo.hasUnlimitedAccess
          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50 text-purple-300'
          : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
      }`}
    >
      {usageInfo.hasUnlimitedAccess ? (
        <span className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-purple-400" />
          Pro
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {Math.max(0, usageInfo.freeLimit - usageInfo.transformationCount)} / {usageInfo.freeLimit} free
        </span>
      )}
    </motion.button>
  )}

  {/* Account button */}
  <motion.button
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    onClick={() => setShowAbout(true)}
    className="p-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-full transition-all group"
  >
    <LogOut className="w-5 h-5 text-slate-400 group-hover:text-white transition-all duration-300" />
  </motion.button>
</div>
```

#### Add Usage Warning Banner:
```typescript
// ADD this before the Header section:
const remainingFree = usageInfo ? Math.max(0, usageInfo.freeLimit - usageInfo.transformationCount) : 0;
const showUsageBanner = usageInfo && !usageInfo.hasUnlimitedAccess && remainingFree <= 2;

{showUsageBanner && (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full mx-auto px-6"
  >
    <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-4 backdrop-blur-xl flex items-start gap-3">
      <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-amber-200 mb-1 font-medium">
          {remainingFree === 0 ? 'No free transformations remaining' : `Only ${remainingFree} free transformation${remainingFree === 1 ? '' : 's'} left`}
        </p>
        <p className="text-xs text-amber-300/80 mb-2">
          Upgrade to Pro for unlimited access
        </p>
        <Button
          onClick={() => setShowPricing(true)}
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 h-8 text-xs"
        >
          <Crown className="w-3 h-3 mr-1" />
          Upgrade Now
        </Button>
      </div>
      <button
        onClick={() => {/* Close banner */}}
        className="text-amber-400/60 hover:text-amber-400"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
)}
```

#### Remove API Key Warning Banner:
```typescript
// REMOVE this section completely:
{!hasApiKey && (
  <motion.div ...>
    API key warning
  </motion.div>
)}
```

#### Remove Settings Modal, Add Pricing and About Modals:
```typescript
// REMOVE the entire Settings modal section (lines ~1007-1400+)

// ADD these modals before the closing divs:
{/* Pricing Modal */}
<AnimatePresence>
  {showPricing && (
    <PricingPage 
      onClose={() => setShowPricing(false)}
      currentUsage={usageInfo ? {
        used: usageInfo.transformationCount,
        limit: usageInfo.freeLimit
      } : undefined}
    />
  )}
</AnimatePresence>

{/* About/Account Modal */}
<AnimatePresence>
  {showAbout && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
      onClick={() => setShowAbout(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Account</h2>
          <Button
            onClick={() => setShowAbout(false)}
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
              <p className="text-sm text-slate-400 mb-2">Plan</p>
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">
                  {usageInfo.hasUnlimitedAccess ? 'Pro' : 'Free'}
                </span>
                {!usageInfo.hasUnlimitedAccess && (
                  <Button
                    onClick={() => {
                      setShowAbout(false);
                      setShowPricing(true);
                    }}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                  >
                    Upgrade
                  </Button>
                )}
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
```

### Step 4: Test the Implementation

1. **Test Free Usage**:
   - Create a new account
   - Make 5 transformations
   - On the 6th attempt, you should see the upgrade prompt

2. **Test Stripe Checkout**:
   - Click "Upgrade Now"
   - Complete test payment (use Stripe test card: 4242 4242 4242 4242)
   - Verify redirect back to app with success message

3. **Test Unlimited Access**:
   - After successful payment, try making more transformations
   - Should work without limits

### Step 5: Optional Enhancements

Consider adding:
- Customer portal link for users to manage subscriptions
- Email notifications for subscription events
- Analytics tracking for conversion
- A/B testing different pricing
- Annual discount badges
- Free trial period

## 🎨 Pricing Display Locations

The pricing is displayed in these places:
1. **PricingPage modal** - Full pricing comparison
2. **Usage indicator** (top-right) - Shows remaining free transformations
3. **Warning banner** - Appears when 2 or fewer free transformations remain
4. **Error toast** - When limit is reached
5. **Account modal** - Shows current plan and upgrade button

## 💰 Pricing Structure

- **Free Plan**: 5 transformations total (not per month)
- **Pro Monthly**: $9.99/month - Unlimited transformations
- **Pro Yearly**: $99.99/year ($8.33/month) - Save 17%

## 🔒 Security Notes

- Gemini API key is hardcoded on the server (never exposed to client)
- Stripe keys should be environment variables (never committed to git)
- Webhook signature verification prevents unauthorized requests
- User authentication required for all endpoints

## 📝 Next Steps

1. Set up Stripe account and get API keys
2. Update environment variables in Supabase
3. Update Stripe Price IDs in PricingPage.tsx
4. Apply all App.tsx changes listed above
5. Test thoroughly in development
6. Deploy and monitor

Good luck with your PromptIT launch! 🚀
