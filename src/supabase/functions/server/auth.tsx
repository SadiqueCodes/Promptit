// @ts-nocheck
import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";

const authRouter = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Sign up route
authRouter.post("/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.error("Signup error:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name
      }
    });
  } catch (error: any) {
    console.error("Signup exception:", error);
    return c.json({ error: error.message || "Internal server error" }, 500);
  }
});

// Verify user session (for protected routes)
authRouter.get("/verify", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];

    if (!accessToken) {
      return c.json({ error: "No token provided" }, 401);
    }

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return c.json({ error: "Invalid token" }, 401);
    }

    return c.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name
      }
    });
  } catch (error: any) {
    console.error("Verify exception:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default authRouter;
