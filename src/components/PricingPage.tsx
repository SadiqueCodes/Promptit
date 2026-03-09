import { useState } from "react";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { supabase } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";

interface PricingPageProps {
  onClose: () => void;
  currentUsage?: {
    used: number;
    limit: number;
  };
}

export function PricingPage({ onClose, currentUsage }: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(false);

  // Stripe Price IDs - Replace these with your actual Stripe Price IDs
  const STRIPE_PRICE_IDS = {
    monthly: "price_monthly_placeholder", // Replace with actual Stripe monthly price ID
    yearly: "price_yearly_placeholder"   // Replace with actual Stripe yearly price ID
  };

  const handleSubscribe = async (planType: "monthly" | "yearly") => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Please sign in to subscribe');
        return;
      }

      const priceId = STRIPE_PRICE_IDS[planType];

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2313fdc9/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Supabase-Auth': session.access_token,
          },
          body: JSON.stringify({ priceId, planType }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to start checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const monthlyPrice = 9.99;
  const yearlyPrice = 99.99;
  const yearlyMonthlyEquivalent = (yearlyPrice / 12).toFixed(2);
  const savings = ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12) * 100).toFixed(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-xl opacity-30 animate-pulse"></div>
              <Crown className="w-10 h-10 relative z-10 text-purple-400" />
            </div>
          </div>
          <h2 className="text-4xl mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Upgrade to Pro
          </h2>
          <p className="text-slate-400 text-lg">
            Unlock unlimited prompt transformations and boost your productivity
          </p>
          
          {currentUsage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-200">
                You've used {currentUsage.used} of {currentUsage.limit} free transformations
              </span>
            </motion.div>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-14 h-7 bg-white/10 rounded-full transition-all border border-white/20"
          >
            <motion.div
              className="absolute top-0.5 left-0.5 w-6 h-6 bg-purple-500 rounded-full"
              animate={{ x: billingCycle === 'yearly' ? 28 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'} flex items-center gap-2`}>
            Yearly
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
              Save {savings}%
            </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="mb-6">
              <h3 className="text-2xl mb-2">Free</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl">$0</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-sm text-slate-400">
                Perfect for trying out PromptIT
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">5 prompt transformations</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">Access to all templates</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">Role & mood customization</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">History tracking</span>
              </li>
            </ul>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Current Plan
            </Button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-2xl blur-xl opacity-50"></div>
            
            <div className="relative bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-500/50 rounded-2xl p-6">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-purple-500 text-white text-xs rounded-full">
                  POPULAR
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl mb-2 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-purple-400" />
                  Pro
                </h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl">
                    ${billingCycle === 'monthly' ? monthlyPrice : yearlyMonthlyEquivalent}
                  </span>
                  <span className="text-slate-400">/month</span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-xs text-slate-400 mb-4">
                    Billed ${yearlyPrice} yearly
                  </p>
                )}
                <p className="text-sm text-slate-300">
                  Unlimited transformations for power users
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white font-medium">Unlimited transformations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">Priority processing</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">Advanced AI model</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">Custom templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">Early access to new features</span>
                </li>
              </ul>

              <Button
                onClick={() => handleSubscribe(billingCycle)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 h-12 text-base font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Features Comparison */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <h4 className="text-lg mb-4 text-center">Why upgrade to Pro?</h4>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h5 className="text-sm mb-2">Unlimited Access</h5>
              <p className="text-xs text-slate-400">
                Transform as many prompts as you need without any restrictions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h5 className="text-sm mb-2">Faster Processing</h5>
              <p className="text-xs text-slate-400">
                Get your enhanced prompts faster with priority queue processing
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-green-400" />
              </div>
              <h5 className="text-sm mb-2">Premium Features</h5>
              <p className="text-xs text-slate-400">
                Access advanced features and templates before anyone else
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          <p className="mb-2">Secure payment powered by Stripe • Cancel anytime</p>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            Maybe later
          </Button>
        </div>
      </motion.div>
    </div>
  );
}