# Stripe Setup Guide for PromptIT

## Step 1: Create Stripe Account
1. Go to https://stripe.com
2. Sign up for a free account
3. Complete account setup

## Step 2: Get Your API Keys
1. Go to Stripe Dashboard → Developers → API keys
2. Copy your **Secret key** (starts with `sk_test_...` for test mode)
3. You'll add this to Supabase later

## Step 3: Create Products & Prices

### Create Monthly Plan:
1. Go to Stripe Dashboard → Products
2. Click "+ Add product"
3. Fill in:
   - **Name**: PromptIT Pro Monthly
   - **Description**: Unlimited prompt transformations - Monthly billing
   - **Pricing**: 
     - **Type**: Recurring
     - **Price**: $9.99
     - **Billing period**: Monthly
4. Click "Save product"
5. **COPY THE PRICE ID** (looks like `price_1234567890abcdef`)

### Create Yearly Plan:
1. Click "+ Add product" again
2. Fill in:
   - **Name**: PromptIT Pro Yearly
   - **Description**: Unlimited prompt transformations - Yearly billing (Save 17%)
   - **Pricing**:
     - **Type**: Recurring
     - **Price**: $99.99
     - **Billing period**: Yearly
3. Click "Save product"
4. **COPY THE PRICE ID** (looks like `price_0987654321fedcba`)

## Step 4: Update PricingPage.tsx
Open `/components/PricingPage.tsx` and find this section (around line 26):

```typescript
  // Stripe Price IDs - Replace these with your actual Stripe Price IDs
  const STRIPE_PRICE_IDS = {
    monthly: "price_monthly_placeholder", // Replace with actual Stripe monthly price ID
    yearly: "price_yearly_placeholder"   // Replace with actual Stripe yearly price ID
  };
```

Replace with your actual Price IDs:
```typescript
  const STRIPE_PRICE_IDS = {
    monthly: "price_1234567890abcdef", // Your monthly price ID
    yearly: "price_0987654321fedcba"   // Your yearly price ID
  };
```

## Step 5: Set Up Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "+ Add endpoint"
3. **Endpoint URL**: `https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-2313fdc9/stripe-webhook`
   - Replace `YOUR-PROJECT-ID` with your actual Supabase project ID
4. Click "Select events"
5. Select these 3 events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
6. Click "Add endpoint"
7. **COPY THE SIGNING SECRET** (starts with `whsec_...`)

## Step 6: Add Environment Variables to Supabase
1. Go to your Supabase Dashboard
2. Navigate to: **Project Settings** → **Edge Functions** → **Environment Variables**
3. Add these three variables:

| Variable Name | Value | Example |
|---------------|-------|---------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key | `sk_test_51Abc...` |
| `STRIPE_WEBHOOK_SECRET` | Your webhook signing secret | `whsec_xyz123...` |
| `APP_URL` | Your app URL | `https://your-app.com` or `http://localhost:5173` for local |

4. Click "Save" after adding each variable
5. **Redeploy your Edge Functions** to apply the new environment variables

## Step 7: Test the Integration

### Test with Stripe Test Cards:
Stripe provides test card numbers that work in test mode:

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

For all test cards, use:
- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Testing Steps:
1. **Test Free Limit**:
   - Create a new account
   - Make 5 transformations
   - On the 6th attempt, you should see upgrade prompt

2. **Test Payment Flow**:
   - Click "Upgrade Now"
   - Fill in email and test card `4242 4242 4242 4242`
   - Complete checkout
   - Should redirect back to app with success message

3. **Test Unlimited Access**:
   - After payment, try making more transformations
   - Should work without limits
   - Top-right should show "Pro" badge

4. **Test Subscription in Stripe**:
   - Go to Stripe Dashboard → Customers
   - Find your test customer
   - Should see active subscription

## Step 8: Going Live (When Ready)

### Switch to Live Mode:
1. In Stripe Dashboard, toggle from "Test mode" to "Live mode" (top-right)
2. Create new products & prices in live mode (repeat Step 3)
3. Get new live API keys:
   - Secret key (starts with `sk_live_...`)
   - Webhook signing secret
4. Update Supabase environment variables with live keys
5. Update PricingPage.tsx with live price IDs

### Enable Payment Methods:
1. Go to Stripe Dashboard → Settings → Payment methods
2. Enable the payment methods you want to accept:
   - ✅ Card (Visa, Mastercard, Amex, etc.)
   - ⚪ Apple Pay
   - ⚪ Google Pay
   - ⚪ Others...

### Set Up Billing:
1. Complete your Stripe business profile
2. Add bank account for payouts
3. Set up automatic payout schedule

## Pricing Summary
- **Free**: 5 transformations total (one-time, not monthly)
- **Pro Monthly**: $9.99/month → Unlimited transformations
- **Pro Yearly**: $99.99/year ($8.33/month) → Save 17%

## Troubleshooting

### "No price ID" error:
- Make sure you updated PricingPage.tsx with your actual Stripe Price IDs
- Check that the price IDs are correct (start with `price_`)

### Webhook not working:
- Verify webhook URL is correct
- Check webhook signing secret in Supabase
- Look at Stripe Dashboard → Webhooks → [your webhook] → Events
- Check Supabase Edge Function logs for errors

### Payment successful but subscription not active:
- Check Supabase Edge Function logs
- Verify webhook events are being received
- Check KV storage: `subscription:USER_ID` should be `'active'`

### Can't make transformations after payment:
- Check browser console for errors
- Verify usage endpoint returns correct data
- Clear browser cache and refresh

## Support Resources
- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Testing**: https://stripe.com/docs/testing
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Stripe Support**: dashboard → Help center

## Security Notes
⚠️ **NEVER commit your Stripe keys to Git/GitHub!**
- Keep them in Supabase environment variables only
- Use `.env` files for local development (add to `.gitignore`)
- Rotate keys immediately if accidentally exposed

Good luck with your launch! 🚀💰
