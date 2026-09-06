# Stripe Integration, Feature Gating, and Custom Discount Forms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Stripe checkout session creation, instant post-purchase license key issuance, custom modal forms for Switcher & Student/OSS discounts on the website, and comprehensive Pro feature gating with an in-app upgrade modal in the desktop app.

**Architecture:** A Next.js API route handles Stripe checkout creation (or simulated checkout if no API key is provided) with dynamic discount codes. A success page reveals the generated license key with one-click copy and desktop deep-linking. On the website, custom interactive modals replace legacy mailto links. In the desktop application, a unified `ProFeatureModal` protects Pro-only features (Large v3 Turbo model, Context Engine, filler stripper, word limits) and handles in-app key activation.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS v4, Stripe SDK, Canvas Confetti, Lucide Icons, React 19, Tauri v2.

## Global Constraints

- Do not break existing Tauri bindings or Rust SOT headers.
- Maintain responsive, high-aesthetic light and dark mode styles matching Murmur's design system.
- Offline-friendly and privacy-respecting: Murmur desktop app must validate license keys locally without mandatory telemetry or phoning home.
- Graceful degradation: If `STRIPE_SECRET_KEY` is not present in `.env`, the checkout endpoint must smoothly generate a simulated checkout flow to allow testing in development without crashing.

---

### Task 1: Stripe Checkout Route & Helper in Website

**Files:**

- Create: `website/src/lib/stripe.ts`
- Create: `website/src/app/api/checkout/route.ts`

**Interfaces:**

- Consumes: `tier` (`pro_lifetime` | `pro_annual`), `discountCode` (`SWITCHER-40` | `STUDENT-50` | `OSS-50`), `customerEmail` (optional).
- Produces: JSON response `{ url: string, sessionId?: string }` for redirecting to Stripe Checkout (or mock success URL).

- [ ] **Step 1: Install stripe package in website if not present**
      Run: `bun --cwd website add stripe`
- [ ] **Step 2: Create Stripe helper module `website/src/lib/stripe.ts`**
      Implements price resolution, discount rules, license key generation, and Stripe client initialization.
- [ ] **Step 3: Create Route Handler `website/src/app/api/checkout/route.ts`**
      Handles POST requests, constructs line items, applies discounts, creates Checkout Session, and returns redirect URL.
- [ ] **Step 4: Test checkout API route with curl / fetch**
      Verify POST to `/api/checkout` returns `{ url: "..." }`.
- [ ] **Step 5: Commit changes**
      `git add website/src/lib/stripe.ts website/src/app/api/checkout/route.ts website/package.json website/bun.lockb`
      `git commit -m "feat(website): add stripe checkout route and pricing calculation helpers"`

---

### Task 2: Custom Switcher & Student/OSS Discount Modal Forms

**Files:**

- Create: `website/src/components/SwitcherModal.tsx`
- Create: `website/src/components/StudentGrantModal.tsx`

**Interfaces:**

- Consumes: `isOpen: boolean`, `onClose: () => void`, `initialPlan?: "lifetime" | "annual"`.
- Produces: Interactive dialogs that validate input, display generated coupon badge, and initiate direct Stripe checkout via `/api/checkout`.

- [ ] **Step 1: Implement `website/src/components/SwitcherModal.tsx`**
      Form with competitor select (Wispr Flow, Superwhisper, Dragon, Otter, Other), plan toggle ($69 Lifetime vs $29/yr Annual), email, proof note / attachment, real-time validation, and checkout launch.
- [ ] **Step 2: Implement `website/src/components/StudentGrantModal.tsx`**
      Two-tab form (Students & Faculty vs Open Source Maintainers) with university/email verification, GitHub repo validation, plan select ($44 Lifetime vs $24/yr Annual), discount reveal, and checkout launch.
- [ ] **Step 3: Commit custom modal components**
      `git add website/src/components/SwitcherModal.tsx website/src/components/StudentGrantModal.tsx`
      `git commit -m "feat(website): add custom modal forms for switcher deal and academic/OSS grants"`

---

### Task 3: Integrate Custom Forms and Stripe Checkout into `/pricing`

**Files:**

- Modify: `website/src/app/pricing/page.tsx`

**Interfaces:**

- Consumes: `SwitcherModal`, `StudentGrantModal`, `/api/checkout`.
- Produces: Updated pricing page where "Claim Switcher Deal", "Apply with Student ID", "Apply with GitHub Profile", "Get Pro Lifetime", and "Start Pro Annual" all trigger modern modal flows and Stripe checkout instead of `mailto:`.

- [ ] **Step 1: Wire modal states and checkout triggers in `website/src/app/pricing/page.tsx`**
- [ ] **Step 2: Replace `mailto:` links with interactive modal triggers**
- [ ] **Step 3: Wire tier cards CTA buttons to `/api/checkout`**
- [ ] **Step 4: Verify in browser that modals open smoothly and initiate checkout**
- [ ] **Step 5: Commit pricing page updates**
      `git add website/src/app/pricing/page.tsx`
      `git commit -m "feat(website): integrate custom discount modals and stripe checkout on pricing page"`

---

### Task 4: Pricing Success & Instant License Delivery Page

**Files:**

- Create: `website/src/app/pricing/success/page.tsx`

**Interfaces:**

- Consumes: Query params `session_id`, `plan`, `code`.
- Produces: Confetti celebration page showing customer license key, 1-click copy, deep link to open Murmur desktop, and desktop download links.

- [ ] **Step 1: Implement `website/src/app/pricing/success/page.tsx`**
      Build celebratory UI with canvas-confetti, formatted license key display (e.g. `LIFETIME-XXXX-XXXX`), copy-to-clipboard, `murmur://activate?key=...` link, and step-by-step activation guide.
- [ ] **Step 2: Test `/pricing/success` with sample params**
- [ ] **Step 3: Commit success page**
      `git add website/src/app/pricing/success/page.tsx`
      `git commit -m "feat(website): add pricing success and instant license delivery page"`

---

### Task 5: Desktop App Feature Gating & ProFeatureModal

**Files:**

- Create: `src/components/global/ProFeatureModal.tsx`
- Modify: `src/lib/plan.ts`
- Modify: `src/app/dashboard/settings/_components/ModelManager.tsx`
- Modify: `src/app/dashboard/settings/_components/AppProfiles.tsx`
- Modify: `src/app/dashboard/settings/_components/DictionaryManager.tsx`
- Modify: `src/app/dashboard/billing/BillingView.tsx`

**Interfaces:**

- Consumes: `usePlan()`, feature gate helpers (`canUseTurboModel`, `canUseContextEngine`, `canUseFillerStripper`, etc.).
- Produces: `ProFeatureModal` shown when Starter users attempt locked actions; lock badges on gated controls; inline key activation.

- [ ] **Step 1: Create `src/components/global/ProFeatureModal.tsx`**
      Dialog explaining the attempted locked feature, offering "Start 14-Day Free Trial", "Upgrade on Murmur.app", or "Enter License Key".
- [ ] **Step 2: Update `src/lib/plan.ts`**
      Ensure all license formats (`LIFETIME-`, `PRO-`, `SWITCHER-`, `STUDENT-`, `OSS-`, `TEAM-`) are recognized and exported cleanly.
- [ ] **Step 3: Wire feature gate interceptors to `ModelManager.tsx`, `AppProfiles.tsx`, and `DictionaryManager.tsx`**
      Show `ProFeatureModal` when a Starter user without an active trial clicks download/select on Large v3 Turbo or attempts to add profiles / excess words.
- [ ] **Step 4: Update `BillingView.tsx` with direct switcher and student modal links**
- [ ] **Step 5: Run typecheck to verify desktop app compiles cleanly**
      Run: `bun run typecheck`
- [ ] **Step 6: Commit desktop app feature gating**
      `git add src/components/global/ProFeatureModal.tsx src/lib/plan.ts src/app/dashboard/settings/_components/ModelManager.tsx src/app/dashboard/settings/_components/AppProfiles.tsx src/app/dashboard/settings/_components/DictionaryManager.tsx src/app/dashboard/billing/BillingView.tsx`
      `git commit -m "feat(app): add pro feature gating modal and wire locked feature interceptors"`

---

### Task 6: Full Verification & Walkthrough

**Files:**

- Verify: Website build (`bun --cwd website run build`)
- Verify: Desktop build (`bun run typecheck`)
- Create: `docs/superpowers/walkthrough.md`

- [ ] **Step 1: Run website build and typecheck**
- [ ] **Step 2: Run desktop typecheck**
- [ ] **Step 3: End-to-end verification of checkout flow and desktop gating**
- [ ] **Step 4: Final commit and walkthrough summary**
