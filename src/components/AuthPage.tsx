import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, Shield, Zap, Fingerprint } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const now = Date.now();
    if (now - lastAttemptTime < 2000) {
      setError('Please wait a moment before trying again');
      return;
    }
    setLastAttemptTime(now);
    
    setIsLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data.session) {
          toast.success('Welcome back!');
          onAuthSuccess();
        }
      } else {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2313fdc9/signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ email, password, name }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create account');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success('Account created successfully!');
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMessage = err.message || 'An error occurred';
      
      if (errorMessage.includes('rate limit') || errorMessage.includes('request this after')) {
        setError('Too many attempts. Please wait a minute and try again.');
        toast.error('Too many attempts. Please wait a minute.');
      } else if (errorMessage.includes('Invalid login credentials')) {
        setError('Invalid email or password');
        toast.error('Invalid email or password');
      } else if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
        setError('This email is already registered. Please sign in instead.');
        toast.error('This email is already registered. Please sign in instead.');
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-black">
      {/* Dynamic Spacey Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Multiple Animated Gradient Orbs */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ 
            top: '5%', 
            left: '10%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 40%, transparent 70%)'
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -60, 80, 0],
            scale: [1, 1.2, 0.9, 1],
            rotate: [0, 90, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ 
            bottom: '10%', 
            right: '5%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 40%, transparent 70%)'
          }}
          animate={{
            x: [0, -80, 60, 0],
            y: [0, 50, -40, 0],
            scale: [1, 0.9, 1.3, 1],
            rotate: [360, 270, 90, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ 
            top: '50%', 
            left: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.03) 40%, transparent 70%)'
          }}
          animate={{
            x: [0, -100, 100, 0],
            y: [0, 100, -100, 0],
            scale: [1, 1.4, 0.8, 1],
            rotate: [0, 180, 360, 0],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3 + 0.1,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Animated Grid Pattern */}
        <motion.div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
          animate={{
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Radial gradient overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.4) 100%)'
          }}
        />
      </div>

      {/* Left Side - Enhanced with Motion */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 space-y-8 max-w-lg">
          {/* Logo with Glow */}
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: 0.2,
              type: "spring",
              stiffness: 100
            }}
          >
            <div className="inline-flex items-center gap-3 mb-4 relative">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Sparkles className="w-10 h-10 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              </motion.div>
              <h1 className="text-5xl text-slate-100 tracking-tight">
                P<span className="font-mono font-light">rompt</span>IT
              </h1>
              {/* Glow effect */}
              <motion.div
                className="absolute -inset-4 bg-purple-500/10 rounded-full blur-xl -z-10"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <motion.p 
              className="text-slate-400 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Transform your prompts with AI precision
            </motion.p>
          </motion.div>

          {/* Feature Cards with Stagger Animation */}
          <div className="space-y-4">
            {[
              { icon: Zap, title: "AI-Powered Enhancement", desc: "Get better results instantly", delay: 0.5 },
              { icon: Shield, title: "Military-Grade Security", desc: "AES-256 encryption", delay: 0.6 },
              { icon: Fingerprint, title: "Complete Privacy", desc: "Your data stays yours", delay: 0.7 }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: feature.delay,
                  type: "spring",
                  stiffness: 80
                }}
                whileHover={{ 
                  scale: 1.02,
                  x: 5,
                  transition: { duration: 0.2 }
                }}
                className="flex items-center gap-4 p-4 bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-xl hover:border-purple-500/30 transition-all cursor-pointer group"
              >
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl flex items-center justify-center group-hover:from-purple-500/20 group-hover:to-blue-500/20 transition-all"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-5 h-5 text-slate-300 group-hover:text-purple-400 transition-colors" />
                </motion.div>
                <div>
                  <div className="text-slate-200 text-sm font-medium">{feature.title}</div>
                  <div className="text-slate-500 text-xs">{feature.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonial with Fade In */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="pt-6 border-t border-slate-800/50"
          >
            <motion.p 
              className="text-slate-500 text-sm italic"
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              "The split-screen comparison changed how our team writes prompts. Incredible tool."
            </motion.p>
            <p className="text-slate-600 text-xs mt-2">— Ritwik Pawar, Product Manager</p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <Sparkles className="w-7 h-7 text-slate-300" />
              <h1 className="text-3xl text-slate-100">
                P<span className="font-mono">rompt</span>IT
              </h1>
            </div>
            <p className="text-slate-500 text-sm">Transform your prompts with AI</p>
          </div>

          {/* Auth Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl text-slate-100 mb-1">
                {isLogin ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p className="text-slate-500 text-sm">
                {isLogin ? 'Sign in to continue' : 'Create your account'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-0 mb-6 bg-slate-800/30 p-1 rounded-xl border border-slate-700/30">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg transition-all duration-300 text-sm relative overflow-hidden ${
                  isLogin ? 'text-slate-900' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {isLogin && (
                  <motion.div
                    layoutId="auth-tab"
                    className="absolute inset-0 bg-slate-200"
                    style={{ borderRadius: 8 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg transition-all duration-300 text-sm relative overflow-hidden ${
                  !isLogin ? 'text-slate-900' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {!isLogin && (
                  <motion.div
                    layoutId="auth-tab"
                    className="absolute inset-0 bg-slate-200"
                    style={{ borderRadius: 8 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">Sign Up</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm text-slate-400 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-800/30 border border-slate-700/50 rounded-lg pl-10 pr-3 py-2.5 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-slate-600 focus:bg-slate-800/50 transition-all"
                        placeholder="Enter your name"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800/30 border border-slate-700/50 rounded-lg pl-10 pr-3 py-2.5 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-slate-600 focus:bg-slate-800/50 transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800/30 border border-slate-700/50 rounded-lg pl-10 pr-10 py-2.5 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-slate-600 focus:bg-slate-800/50 transition-all"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-xs">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                className="w-full bg-slate-200 text-slate-900 rounded-lg py-2.5 flex items-center justify-center gap-2 hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20 mt-6 text-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Security Badge */}
            <div className="mt-5 flex items-center justify-center gap-2 text-slate-600 text-xs">
              <Shield className="w-3 h-3" />
              <span>AES-256 encrypted</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}