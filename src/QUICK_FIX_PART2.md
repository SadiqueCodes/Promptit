# Quick Fix Script for App.tsx - PART 2

## STEP 10: Replace Settings button with Usage/Account buttons (Around line 559-567)
**FIND:**
```typescript
        {/* Settings button - floating in top right */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowSettings(true)}
          className="fixed top-6 right-6 z-40 p-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-full transition-all group"
        >
          <Settings className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
        </motion.button>
```

**REPLACE WITH:**
```typescript
        {/* Top right buttons */}
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

## STEP 11: Add usage warning banner (After top buttons, around line 568)
**ADD THIS RIGHT AFTER THE BUTTONS:**
```typescript
        {/* Usage warning banner */}
        {usageInfo && !usageInfo.hasUnlimitedAccess && Math.max(0, usageInfo.freeLimit - usageInfo.transformationCount) <= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full mx-auto px-6"
          >
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-4 backdrop-blur-xl flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-200 mb-1 font-medium">
                  {usageInfo.transformationCount >= usageInfo.freeLimit 
                    ? 'No free transformations remaining' 
                    : `Only ${usageInfo.freeLimit - usageInfo.transformationCount} free transformation${usageInfo.freeLimit - usageInfo.transformationCount === 1 ? '' : 's'} left`}
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
                onClick={() => {/* Could close banner */}}
                className="text-amber-400/60 hover:text-amber-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
```

## STEP 12: Remove API Key Warning Banner (Around line 677-699)
**FIND AND DELETE THIS ENTIRE SECTION:**
```typescript
              {/* API Key Warning Banner */}
              {!hasApiKey && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-200 mb-1">Setup Required</p>
                    <p className="text-xs text-amber-300/80">
                      Add your OpenAI API key in Settings to start enhancing prompts.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowSettings(true)}
                    size="sm"
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs h-8"
                  >
                    Open Settings
                  </Button>
                </motion.div>
              )}
```

## STEP 13: Delete entire Settings/About Modal section (Around line 1007-1400+)
**FIND THIS ENTIRE SECTION (starts around line 1007):**
```typescript
        {/* Settings/About Modal */}
        <AnimatePresence>
          {showSettings && (
```

**DELETE EVERYTHING until you see the NEXT major section which is probably the Sidebar.**

The Settings modal is HUGE (several hundred lines). Delete from `{/* Settings/About Modal */}` all the way down to and including the closing `</AnimatePresence>` for that modal (should be around line 1400+).

## STEP 14: Add NEW Pricing and About modals (Where you deleted Settings modal)
**ADD THESE TWO MODALS:**
```typescript
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

## ✅ DONE!

After making all these changes, save the file and refresh your browser. You should now see:
1. ✅ No more Settings/API page
2. ✅ Usage counter in top-right showing "X / 5 free"
3. ✅ Account button (logout icon) in top-right
4. ✅ Pricing modal when you click upgrade
5. ✅ Warning banner when you have 2 or fewer transformations left
6. ✅ Automatic upgrade prompt when limit is reached

The app now uses the hardcoded Gemini API on the server and tracks usage!
