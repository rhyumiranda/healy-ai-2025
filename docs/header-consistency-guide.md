# Header Consistency Implementation Guide

## Overview
This document explains the implementation of a consistent header across all pages in the AI-Powered Treatment Plan Assistant, following the **single source of truth** principle from the landing page.

## Problem Solved
Previously, each page (landing, login, register) had its own header implementation, leading to:
- ❌ Inconsistent branding
- ❌ Different navigation patterns
- ❌ Code duplication
- ❌ Difficult maintenance

## Solution: AppHeader Component

### Single Source of Truth
The `AppHeader` component in `src/modules/common/components/app-header.tsx` serves as the **single source of truth** for all header implementations.

### Design System Extracted from Landing Page

#### Visual Identity
```
Logo: Shield icon (blue-600) + "HealyAI" text
Size: 8x8 icon, text-lg font-semibold
Color Scheme: blue-600 primary, slate-900 text, slate-600 secondary
```

#### Spacing & Layout
```
Container: max-w-7xl mx-auto
Padding: px-6 lg:px-8
Height: h-16 (4rem / 64px)
Gap: gap-2 (logo), gap-6 (nav items)
```

#### Typography
```
Logo Text: text-lg font-semibold text-slate-900
Nav Links: text-sm font-medium text-slate-600
Buttons: text-sm font-medium (in blue-600 bg)
```

#### Effects & Animations
```
Entry Animation: Slide down from -100 to 0, fade in (0.6s)
Logo Animation: Scale 0.8→1, fade in (0.4s, 0.2s delay)
Nav Animation: Scale 0.8→1, fade in (0.4s, 0.3s delay)
Hover: opacity-80 (logo), text-slate-900 (links)
Transitions: All use transition-colors/opacity
```

#### Border & Background
```
Landing: border-b border-slate-100, bg-white/80 backdrop-blur-md
Auth: border-b border-slate-200, bg-white (solid)
```

## Implementation

### 1. Created Common Module
```
src/modules/common/
├── components/
│   ├── app-header.tsx
│   └── index.ts
├── index.ts
└── README.md
```

### 2. Component Variants

#### Landing Variant
```tsx
<AppHeader variant="landing" />
```
**Features:**
- Fixed positioning (stays at top)
- Backdrop blur effect
- Shows "Sign In" + "Get Started" buttons
- Subtle border (slate-100)

#### Auth Variant
```tsx
<AppHeader variant="auth" showBackButton />
```
**Features:**
- Static positioning
- Solid white background
- Optional back button with arrow
- Standard border (slate-200)

### 3. Updated Components

#### Before: Landing Page
```tsx
// Direct Navigation component in landing/components/navigation.tsx
<motion.nav>
  <div className="...">
    {/* Complex header logic */}
  </div>
</motion.nav>
```

#### After: Landing Page
```tsx
// Simplified wrapper using shared component
import { AppHeader } from '@/src/modules/common'

export function Navigation() {
  return <AppHeader variant="landing" />
}
```

#### Before: Register Page
```tsx
// Custom header with Link component
<div className="min-h-screen">
  <Link href="/" className="absolute left-4 top-4">
    <ArrowLeft /> Back to Home
  </Link>
  {/* Page content */}
</div>
```

#### After: Register Page
```tsx
// Consistent header component
<div className="min-h-screen">
  <AppHeader variant="auth" showBackButton />
  <div className="container flex min-h-[calc(100vh-4rem)]">
    {/* Page content - adjusted for header height */}
  </div>
</div>
```

#### Before: Login Page
```tsx
// No header - just centered content
<main className="min-h-screen flex items-center justify-center">
  <div className="max-w-md">
    <h1>AI Treatment Plan Assistant</h1>
    <LoginForm />
  </div>
</main>
```

#### After: Login Page
```tsx
// Consistent header + improved layout
<div className="min-h-screen">
  <AppHeader variant="auth" showBackButton />
  <div className="container flex min-h-[calc(100vh-4rem)]">
    <div className="max-w-md">
      <Stethoscope icon + heading />
      <Card><LoginForm /></Card>
    </div>
  </div>
</div>
```

## Benefits Achieved

### 1. Visual Consistency ✅
- Same logo, colors, typography across all pages
- Consistent spacing and layout
- Unified animation behavior

### 2. Maintainability ✅
- **Single update location**: Change header once, updates everywhere
- **Clear ownership**: common module owns header design
- **No duplication**: DRY principle applied

### 3. User Experience ✅
- Familiar navigation pattern throughout app
- Clear branding reinforcement
- Predictable interaction model
- Smooth, professional animations

### 4. Code Quality ✅
- **Module-first architecture**: Clear separation of concerns
- **Type safety**: Full TypeScript support
- **Reusability**: Easy to add new variants
- **Accessibility**: Consistent keyboard navigation

### 5. Developer Experience ✅
- Easy to implement on new pages
- Self-documenting API (variant, props)
- Comprehensive documentation
- Clear examples

## Layout Adjustments

### Height Calculation
Since the auth header is **not fixed**, pages need to account for its height:

```tsx
// Container height = viewport height - header height (4rem)
<div className="min-h-[calc(100vh-4rem)]">
  {/* Content */}
</div>
```

### Spacing Consistency
All auth pages now follow the same layout pattern:
```tsx
<div className="min-h-screen bg-linear-to-b from-background to-muted/20">
  <AppHeader variant="auth" showBackButton />
  <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 md:py-16">
    <div className="mx-auto w-full max-w-[size]">
      {/* Page-specific content */}
    </div>
  </div>
</div>
```

## Design Tokens

### Colors
```css
Primary: blue-600 (#2563eb)
Primary Hover: blue-700 (#1d4ed8)
Text Primary: slate-900 (#0f172a)
Text Secondary: slate-600 (#475569)
Border Light: slate-100 (#f1f5f9)
Border Standard: slate-200 (#e2e8f0)
Background: white (#ffffff)
Background Blur: white/80 (rgba(255,255,255,0.8))
```

### Spacing
```css
Container Max: 1280px (max-w-7xl)
Container Padding: 24px (px-6) / 32px (lg:px-8)
Header Height: 64px (h-16)
Logo Icon: 32px (w-8 h-8)
Nav Gap: 24px (gap-6)
Logo Gap: 8px (gap-2)
```

### Typography
```css
Logo: 18px/1.125rem (text-lg), 600 weight (font-semibold)
Nav Links: 14px/0.875rem (text-sm), 500 weight (font-medium)
```

### Animation Timing
```css
Header: 600ms ease-out
Logo: 400ms, 200ms delay
Nav: 400ms, 300ms delay
Hover: default transition-colors
```

## Testing Checklist

- [x] Landing page shows fixed header with blur
- [x] Login page shows static header with back button
- [x] Register page shows static header with back button
- [x] Logo links to home on all pages
- [x] Back button navigates to home
- [x] Animations play smoothly
- [x] Hover states work correctly
- [x] Responsive on mobile (tested at 375px+)
- [x] Keyboard navigation works
- [x] No layout shift on page load

## Future Enhancements

### Authenticated State
```tsx
<AppHeader 
  variant="dashboard"
  user={{ name: "Dr. Smith", avatar: "..." }}
  showNotifications
  showUserMenu
/>
```

### Mobile Menu
```tsx
<AppHeader 
  variant="landing"
  showMobileMenu
  menuItems={[...]}
/>
```

### Breadcrumbs
```tsx
<AppHeader 
  variant="auth"
  breadcrumbs={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Patients", href: "/patients" },
    { label: "John Doe" }
  ]}
/>
```

## Related Documentation

- `src/modules/common/README.md` - Component API and usage
- `docs/auth-registration-guide.md` - Auth page structure
- `.cursor/rules/project-rules.mdc` - Coding standards

## Migration Guide

To add the header to a new page:

1. **Import the component:**
   ```tsx
   import { AppHeader } from '@/src/modules/common'
   ```

2. **Add to page layout:**
   ```tsx
   <div className="min-h-screen">
     <AppHeader variant="auth" showBackButton />
     <div className="container min-h-[calc(100vh-4rem)]">
       {/* Your content */}
     </div>
   </div>
   ```

3. **Adjust spacing as needed:**
   - Use `py-12 md:py-16` for vertical padding
   - Center content with `items-center justify-center`
   - Constrain width with `max-w-*` classes

## Summary

✅ **Created**: Shared `AppHeader` component as single source of truth
✅ **Updated**: Landing Navigation to use shared component
✅ **Updated**: Login page with consistent header and improved layout
✅ **Updated**: Register page with consistent header
✅ **Documented**: Complete design system and implementation guide
✅ **Maintained**: Module-first architecture and code quality standards

The header is now fully consistent across all pages, maintainable from a single location, and follows the design system extracted from the landing page.
