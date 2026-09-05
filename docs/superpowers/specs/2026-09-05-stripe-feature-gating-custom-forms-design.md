# Stripe Integration, Feature Gating, and Custom Discount Forms Design

- **Date:** 2026-09-05
- **Status:** Approved
- **Scope:** Website Stripe Checkout API, Pricing Success & License Delivery, Custom Switcher & Student/OSS Modal Forms, Desktop Feature Gating & In-App Upgrade Experience.

---

## 1. Overview & Architecture

Murmur is a privacy-first, local-first voice dictation application for macOS and Windows. The commercialization model offers:
1. **Free Starter Tier:** 100% on-device Whisper Base model, up to 25 custom dictionary words, standard punctuation, sub-200ms latency.
2. **Pro Lifetime License ($89 one-time):** Whisper Large v3 Turbo & Medium models, Smart Context Engine, automatic filler word stripping, unlimited dictionary words, voice snippets, and air-gapped offline verification.
3. **Pro Annual Pass ($49/year):** Continuous model updates and priority support.
4. **Acquisition Programs:**
   - **Claim Switcher Deal:** $20 off Lifetime ($69) or 40% off Annual ($29/yr) for users migrating from Wispr Flow, Superwhisper, or Dragon.
   - **Student & Academic Faculty Grant:** 50% discount ($44 Lifetime / $24 Annual).
   - **Open Source Maintainer Grant:** 50% discount ($44 Lifetime / $24 Annual).

This specification establishes:
- A self-service Stripe Checkout pipeline in Next.js (`website`) with dynamic pricing and coupon support.
- An instant license key generation and activation page (`/pricing/success`).
- Custom interactive modal forms for Switcher claims and Student/OSS grants, replacing legacy `mailto:` links.
- Robust desktop app feature gating (`ProFeatureModal`) intercepting locked Pro features in the desktop app (`src/`).

---

## 2. Component Specifications

### 2.1 Stripe Checkout API (`website/src/app/api/checkout/route.ts`)
- **Endpoint:** `POST /api/checkout`
- **Request Body:**
  ```json
  {
    "tier": "pro_lifetime" | "pro_annual",
    "discountCode": "SWITCHER-40" | "STUDENT-50" | "OSS-50" | null,
    "customerEmail": string | null
  }
  ```
- **Pricing Calculation:**
  - `pro_lifetime` (Base $89.00):
    - With `SWITCHER-40`: $69.00 USD
    - With `STUDENT-50` or `OSS-50`: $44.00 USD
  - `pro_annual` (Base $49.00/yr):
    - With `SWITCHER-40`: $29.00 USD
    - With `STUDENT-50` or `OSS-50`: $24.00 USD
- **Stripe Checkout Session:**
  - If `STRIPE_SECRET_KEY` is present, initiates a live/test Stripe Checkout Session using the official Stripe Node SDK.
  - If `STRIPE_SECRET_KEY` is not present (local dev / offline), returns a simulated session redirecting to `/pricing/success?session_id=mock_session_...&plan={tier}&discount={discountCode}`.
- **Success URL:** `/pricing/success?session_id={CHECKOUT_SESSION_ID}&plan={tier}&code={discountCode}`
- **Cancel URL:** `/pricing`

---

### 2.2 Pricing Success & License Delivery Page (`website/src/app/pricing/success/page.tsx`)
- **Visuals:** Confetti animation triggered on mount, modern translucent card, celebratory checkmark.
- **License Generator:**
  - Deterministically or cryptographically generates a valid Murmur license key matching desktop activation patterns:
    - Lifetime: `LIFETIME-XXXX-XXXX-XXXX`
    - Annual: `PRO-XXXX-XXXX-XXXX`
    - Student: `STUDENT-XXXX-XXXX-XXXX`
    - Switcher: `SWITCHER-XXXX-XXXX-XXXX`
- **User Actions:**
  - **Copy License Key:** Copies key to clipboard with visual toast feedback.
  - **Activate in Murmur:** Deep-link `murmur://activate?key={KEY}` with fallback instructions.
  - **Activation Instructions:** 3-step guide: (1) Open Murmur, (2) Navigate to Billing, (3) Click Activate Key.
  - **Download Desktop App:** Quick links to macOS (.dmg) and Windows (.exe / .msix).

---

### 2.3 Custom Modal Forms (`website/src/components/`)

#### A. SwitcherModal (`website/src/components/SwitcherModal.tsx`)
- **Trigger:** "Claim Switcher Deal" button in `/pricing` hero and banner.
- **Inputs:**
  - Competitor App: Wispr Flow, Superwhisper, Dragon Professional, Otter.ai, Other.
  - Plan Preference: Pro Lifetime ($69) vs Pro Annual ($29/yr).
  - User Email Address.
  - Proof Note / Receipt screenshot or confirmation ID.
- **Action:**
  - Validates fields.
  - Applies `SWITCHER-40` discount.
  - Immediately invokes `/api/checkout` and redirects to checkout.

#### B. StudentGrantModal (`website/src/components/StudentGrantModal.tsx`)
- **Trigger:** "Apply with Student ID / .edu" and "Apply with GitHub Profile" buttons in `/pricing`.
- **Tab 1: Student / Academic Faculty:**
  - Name, Educational Institution, Academic Email (`.edu` domain recognition), Target Plan ($44 Lifetime vs $24/yr Annual).
  - Instant validation -> Applies `STUDENT-50` discount -> Launches Stripe checkout.
- **Tab 2: Open Source Maintainer:**
  - Name, Developer Email, GitHub Profile URL, Public Repository URL, Target Plan ($44 Lifetime vs $24/yr Annual).
  - Instant validation -> Applies `OSS-50` discount -> Launches Stripe checkout.

---

### 2.4 Desktop App Feature Gating (`src/`)

#### A. Plan & Capability Store (`src/lib/plan.ts`)
- Preserves existing `usePlan()` API and state synchronization.
- Recognizes license key prefixes: `LIFETIME-`, `PRO-`, `SWITCHER-`, `STUDENT-`, `OSS-`, `TEAM-`, and `FOUNDING-`.
- Explicit gate check helpers:
  - `canUseTurboModel(tier)`
  - `canUseContextEngine(tier)`
  - `canUseFillerStripper(tier)`
  - `getDictionaryWordLimit(tier)`
  - `canUseVoiceSnippets(tier)`
  - `canUseDomainPacks(tier)`

#### B. Pro Feature Modal (`src/components/global/ProFeatureModal.tsx`)
- Centrally-triggered modal when a Starter user interacts with gated features:
  - Attempting to download or select Whisper Large v3 Turbo / Medium.
  - Attempting to add an app profile in Smart Context Engine.
  - Attempting to toggle Automatic Filler Word Stripping.
  - Exceeding 25 custom dictionary words.
  - Activating domain-specific vocabulary packs.
- **Modal Controls:**
  - Headline and description tailored to the feature attempted.
  - "Start 14-Day Free Trial" button (if not already started).
  - "Upgrade on Murmur.app" button (opens pricing page via Tauri opener).
  - "Enter License Key" accordion to directly input and activate key.

#### C. Gated UI Enhancements
- Visual `PRO` lock pill in `ModelManager.tsx`, `AppProfiles.tsx`, `DictionaryManager.tsx`, and `SettingsView.tsx`.
- Updated `BillingView.tsx` with links to the new Switcher and Student modals.

---

## 3. Verification Plan

1. **Website Builds & Routing:**
   - Verify `website` runs `bun dev` without compilation errors.
   - Test `/pricing` page renders cleanly with responsive layout.
   - Click "Claim Switcher Deal" → confirm `SwitcherModal` opens, validates, and redirects to checkout.
   - Click "Apply with Student ID / .edu" → confirm `StudentGrantModal` opens, validates, and redirects to checkout.
   - Verify `/pricing/success` page loads confetti, displays generated license key, and copy button works.
2. **Desktop App Builds & Gating:**
   - Verify `src/` TypeScript typecheck passes (`bun run typecheck`).
   - Confirm `ProFeatureModal` opens on locked features when tier is `starter`.
   - Test license key validation with `LIFETIME-TEST-1234`, `STUDENT-TEST-5678`, `SWITCHER-TEST-9999` in `BillingView.tsx`.
