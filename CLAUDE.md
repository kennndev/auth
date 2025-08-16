# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Install dependencies (ALWAYS use --legacy-peer-deps due to React 19)
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

**IMPORTANT**: This project uses React 19, which has peer dependency conflicts with some packages. Always use `--legacy-peer-deps` when running `npm install` or adding new packages.

## High-level Architecture

### Tech Stack
- **Next.js 15.2.4** with App Router - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with cyberpunk theme
- **Stripe** - Payment processing
- **Supabase** - Database and auth
- **Three.js** - 3D card previews

### Core Integrations

#### Stripe Integration (`lib/stripe.ts`, `lib/stripeClient.ts`)
- Checkout sessions for card orders
- Webhook handling with idempotency and retry logic
- Real-time inventory management with optimistic locking
- Multi-tier bulk pricing discounts
- International shipping calculations

#### Supabase Integration (`lib/supabase.ts`)
- Stores webhook events and purchase data
- User rights requests (GDPR compliance)
- Customer data management

### API Architecture

All API routes use Next.js App Router conventions in `app/api/`:

- **`/api/create-checkout-session`** - Stripe checkout with CSRF protection
- **`/api/csrf-token`** - CSRF token generation
- **`/api/inventory`** - Product inventory status
- **`/api/webhooks/stripe`** - Webhook handler with comprehensive logging

Key patterns:
- CSRF protection on all write operations
- Consistent error response format
- Webhook signature verification
- Rate limiting considerations

### Component Architecture

Components follow shadcn/ui patterns:
- **`components/ui/`** - Radix UI primitives with Tailwind styling
- **`components/`** - Business logic components
- Form handling with react-hook-form and Zod validation

### Security Considerations

1. **Environment Variables** - Never commit `.env` files
2. **CSRF Protection** - All API endpoints validate CSRF tokens
3. **Webhook Verification** - Stripe signatures always verified
4. **Error Handling** - Comprehensive logging without exposing internals

### Product Context

From the PRD:
- **Goal**: $50K MRR within 6 months
- **Focus**: Physical trading cards (not NFTs)
- **Features**: AI-powered card generation using ByteDance Flux-PuLID
- **Quality**: 95% on-time delivery, <2% defect rate
- **Market**: International shipping to 15+ countries

### Cursor Rules

The project includes specific cursor rules in `.cursor/rules/`:
- Follow established file naming conventions (kebab-case)
- Component files use PascalCase
- Hooks prefixed with `use-`
- Full TypeScript implementation required