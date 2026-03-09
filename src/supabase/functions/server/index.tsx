import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js";
import { encrypt, decrypt } from "./encryption.tsx";

const app = new Hono();

// Add CORS middleware - MUST be first!
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Supabase-Auth'],
}));

// Add logger
app.use('*', logger(console.log));

// Hardcoded Gemini API key (this is the free API provided by the developer)
const GEMINI_API_KEY = "AIzaSyAbyxQu_ITEIOQIjw3IawrcJx57lYZAMTY";

// Usage limits - unlimited for everyone
const FREE_TRANSFORMATIONS = 999999;

// Health check endpoint
app.get("/make-server-2313fdc9/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Helper endpoint to generate a valid encryption key
app.get("/make-server-2313fdc9/generate-encryption-key", (c) => {
  try {
    const key = crypto.getRandomValues(new Uint8Array(32));
    const base64Key = btoa(String.fromCharCode(...key));
    
    return c.json({ 
      success: true,
      encryptionKey: base64Key,
      length: base64Key.length,
      instructions: "Set this as your API_KEY_ENCRYPTION_SECRET environment variable in Supabase"
    });
  } catch (error) {
    console.error('Error generating encryption key:', error);
    return c.json({ error: 'Failed to generate encryption key' }, 500);
  }
});

// Signup endpoint with auto email confirmation
app.post("/make-server-2313fdc9/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Create Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Create user with admin API and auto-confirm email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already been registered') || error.code === 'email_exists') {
        return c.json({ 
          error: "An account with this email already exists. Please sign in instead." 
        }, 409);
      }
      
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true,
      message: "Account created successfully! You can now sign in."
    });
  } catch (err) {
    console.error('Signup server error:', err);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

// Save API key securely (requires auth)
app.post("/make-server-2313fdc9/api-key", async (c) => {
  console.log('=== API Key Save Endpoint Called ===');
  
  try {
    // Get the JWT token from custom header to avoid Supabase's automatic validation
    const jwt = c.req.header('X-Supabase-Auth');
    console.log('JWT from X-Supabase-Auth header:', jwt ? jwt.substring(0, 20) + '...' : 'NONE');
    
    if (!jwt) {
      console.error('API key save error: No JWT token in X-Supabase-Auth header');
      return c.json({ error: "Unauthorized - no auth token" }, 401);
    }

    // Use the service role key to verify the user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Getting user from JWT...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    console.log('getUser() result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: authError?.message,
      errorCode: authError?.code,
      errorStatus: authError?.status
    });
    
    if (authError || !user?.id) {
      console.error('Auth error while saving API key:', JSON.stringify(authError, null, 2));
      return c.json({ error: `Unauthorized - auth failed: ${authError?.message || 'unknown'}` }, 401);
    }

    const { apiKey, provider, model } = await c.req.json();
    
    console.log('Saving API key for user:', user.id, 'provider:', provider, 'model:', model);

    if (!apiKey) {
      console.error('API key save error: No API key provided');
      return c.json({ error: "API key is required" }, 400);
    }

    // Encrypt API key
    const encryptedApiKey = await encrypt(apiKey);
    console.log('API key encrypted successfully');

    // Store encrypted API key in KV store with user ID as key
    await kv.set(`api_key:${user.id}`, encryptedApiKey);
    console.log('Encrypted API key stored');
    
    // Store provider and model settings
    if (provider) {
      await kv.set(`provider:${user.id}`, provider);
      console.log('Provider stored:', provider);
    }
    if (model) {
      await kv.set(`model:${user.id}`, model);
      console.log('Model stored:', model);
    }

    // Create preview from original key (not encrypted)
    const preview = apiKey.length > 11 
      ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`
      : apiKey.substring(0, 3) + '***';

    console.log('API key save successful, preview:', preview);
    return c.json({ success: true, message: "API key saved securely", preview });
  } catch (err) {
    console.error('Error saving API key (full error):', err);
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack');
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: `Failed to save API key: ${errorMessage}` }, 500);
  }
});

// Check if user has API key (requires auth)
app.get("/make-server-2313fdc9/api-key/status", async (c) => {
  try {
    // Get the JWT token from custom header to avoid Supabase's automatic validation
    const jwt = c.req.header('X-Supabase-Auth');
    
    if (!jwt) {
      console.error('API key status check error: No JWT token in X-Supabase-Auth header');
      return c.json({ error: "Unauthorized - no auth token" }, 401);
    }

    // Use the service role key to verify the user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user?.id) {
      console.error('API key status check error: Auth failed', authError);
      return c.json({ error: `Unauthorized - auth failed: ${authError?.message || 'unknown'}` }, 401);
    }

    // Check if user has API key stored
    const encryptedApiKey = await kv.get(`api_key:${user.id}`);

    if (!encryptedApiKey) {
      return c.json({ 
        hasApiKey: false,
        preview: null
      });
    }

    // Decrypt the key to create a proper preview
    let preview = null;
    try {
      const decryptedKey = await decrypt(encryptedApiKey);
      preview = decryptedKey.length > 11 
        ? `${decryptedKey.substring(0, 7)}...${decryptedKey.substring(decryptedKey.length - 4)}`
        : decryptedKey.substring(0, 3) + '***';
    } catch (error) {
      console.error('Error decrypting key for preview:', error);
      // If decryption fails, still show that key exists
      preview = '***...***';
    }

    // Get provider and model settings
    const provider = await kv.get(`provider:${user.id}`) || 'openai';
    const model = await kv.get(`model:${user.id}`) || 'gpt-4';

    return c.json({ 
      hasApiKey: true,
      preview,
      provider,
      model
    });
  } catch (err) {
    console.error('Error checking API key status:', err);
    return c.json({ error: "Failed to check API key status" }, 500);
  }
});

// Delete API key (requires auth)
app.delete("/make-server-2313fdc9/api-key", async (c) => {
  try {
    // Get the JWT token from custom header to avoid Supabase's automatic validation
    const jwt = c.req.header('X-Supabase-Auth');
    
    if (!jwt) {
      console.error('API key delete error: No JWT token in X-Supabase-Auth header');
      return c.json({ error: "Unauthorized - no auth token" }, 401);
    }

    // Use the service role key to verify the user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user?.id) {
      console.error('API key delete error: Auth failed', authError);
      return c.json({ error: `Unauthorized - auth failed: ${authError?.message || 'unknown'}` }, 401);
    }

    await kv.del(`api_key:${user.id}`);

    return c.json({ success: true, message: "API key deleted" });
  } catch (err) {
    console.error('Error deleting API key:', err);
    return c.json({ error: "Failed to delete API key" }, 500);
  }
});

// Enhance prompt endpoint (NOW USING HARDCODED GEMINI API)
app.post("/make-server-2313fdc9/enhance", async (c) => {
  console.log('=== Enhance Endpoint Called ===');
  
  try {
    // Get the JWT token from custom header to avoid Supabase's automatic validation
    const jwt = c.req.header('X-Supabase-Auth');
    console.log('JWT from X-Supabase-Auth header:', jwt ? jwt.substring(0, 20) + '...' : 'NONE');
    
    if (!jwt) {
      console.error('Enhancement error: No JWT token in X-Supabase-Auth header');
      return c.json({ error: "Unauthorized - no auth token" }, 401);
    }

    // Use the service role key to verify the user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Getting user from JWT...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    console.log('getUser() result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: authError?.message
    });
    
    if (authError || !user?.id) {
      console.error('Enhancement error: Auth failed', authError);
      return c.json({ error: `Unauthorized - auth failed: ${authError?.message || 'unknown'}` }, 401);
    }

    // Check subscription status and usage
    const transformationCount = await kv.get(`transformations:${user.id}`) || 0;
    const subscriptionStatus = await kv.get(`subscription:${user.id}`) || 'free';
    
    console.log('Usage check:', { transformationCount, subscriptionStatus, freeLimit: FREE_TRANSFORMATIONS });

    // If user doesn't have active subscription and has exceeded free limit
    if (subscriptionStatus !== 'active' && transformationCount >= FREE_TRANSFORMATIONS) {
      return c.json({ 
        error: "Free transformation limit reached",
        requiresUpgrade: true,
        message: `You've used all ${FREE_TRANSFORMATIONS} free transformations. Please upgrade to continue.`
      }, 403);
    }

    const { prompt, role, mood } = await c.req.json();

    if (!prompt) {
      return c.json({ error: "Prompt is required" }, 400);
    }

    const systemMessage = `You are a prompt enhancement expert. ${role ? `Role: ${role}.` : ''} ${mood ? `Mood: ${mood}.` : ''} Enhance the user's prompt to be more detailed, specific, and effective while maintaining their original intent.`;

    // Use hardcoded Gemini API
    const modelName = 'gemini-1.5-flash-002';
    
    console.log('Google Gemini API call with hardcoded key');
    
    const llmResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemMessage}\n\nUser prompt: ${prompt}` }]
        }],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!llmResponse.ok) {
      const errorData = await llmResponse.json();
      console.error('Google API error:', errorData);
      throw new Error(errorData.error?.message || 'API request failed');
    }

    const data = await llmResponse.json();
    const enhancedPrompt = data.candidates[0]?.content?.parts[0]?.text || '';

    if (!enhancedPrompt) {
      console.error('Enhancement error: Empty response from LLM');
      return c.json({ error: "Received empty response from LLM. Please try again." }, 500);
    }

    // Increment usage counter
    await kv.set(`transformations:${user.id}`, transformationCount + 1);
    console.log(`Incremented transformation count for user ${user.id}: ${transformationCount} -> ${transformationCount + 1}`);

    return c.json({ 
      success: true,
      enhancedPrompt,
      usageInfo: {
        used: transformationCount + 1,
        limit: FREE_TRANSFORMATIONS,
        hasUnlimitedAccess: subscriptionStatus === 'active'
      }
    });
  } catch (err) {
    console.error('Enhancement server error (full details):', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      type: typeof err,
      raw: err
    });
    return c.json({ 
      error: err instanceof Error ? err.message : "Failed to enhance prompt",
      details: err instanceof Error ? err.stack : String(err)
    }, 500);
  }
});

// Get user's usage stats
app.get("/make-server-2313fdc9/usage", async (c) => {
  try {
    const jwt = c.req.header('X-Supabase-Auth');
    
    if (!jwt) {
      return c.json({ error: "Unauthorized - no auth token" }, 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get usage count and subscription status
    const transformationCount = await kv.get(`transformations:${user.id}`) || 0;
    const subscriptionStatus = 'active'; // Everyone gets unlimited access
    const subscriptionPlan = 'unlimited';

    return c.json({
      transformationCount,
      subscriptionStatus,
      subscriptionPlan,
      freeLimit: FREE_TRANSFORMATIONS,
      hasUnlimitedAccess: true
    });
  } catch (err) {
    console.error('Error getting usage:', err);
    return c.json({ error: "Failed to get usage stats" }, 500);
  }
});

Deno.serve(app.fetch);