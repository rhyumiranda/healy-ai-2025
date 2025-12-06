# Common Module

This module contains shared components and utilities used across multiple features in the application.

## Module Structure

```
src/modules/common/
├── components/          # Shared React components
│   ├── app-header.tsx  # Application header/navigation
│   └── index.ts
└── README.md           # This file
```

## Components

### AppHeader

A consistent header component used across all pages, extracted from the landing page navigation. This serves as the **single source of truth** for the application's header design system.

**Design System:**
- **Logo**: Blue shield icon (8x8) with "HealyAI" branding
- **Colors**: 
  - Primary: `blue-600` (bg, buttons)
  - Text: `slate-900` (primary), `slate-600` (secondary)
  - Hover: `blue-700` (buttons), `slate-900` (links)
- **Spacing**: Container max-width `7xl`, padding `6/8`, height `16` (4rem)
- **Typography**: Logo `text-lg font-semibold`, links `text-sm font-medium`
- **Effects**: 
  - Backdrop blur on landing variant
  - Smooth animations via Framer Motion
  - Opacity transitions on hover

**Props:**

```typescript
interface AppHeaderProps {
  variant?: 'landing' | 'auth'
  showBackButton?: boolean
  backButtonHref?: string
  backButtonLabel?: string
}
```

**Variants:**

1. **Landing Variant** (`variant="landing"`)
   - Fixed positioning at top of page
   - Backdrop blur effect (`bg-white/80 backdrop-blur-md`)
   - Shows "Sign In" and "Get Started" buttons
   - Border: subtle `border-slate-100`

2. **Auth Variant** (`variant="auth"`)
   - Static positioning (not fixed)
   - Solid white background
   - Optional back button
   - Border: `border-slate-200`

**Usage Examples:**

```tsx
// Landing page
<AppHeader variant="landing" />

// Auth pages (login, register)
<AppHeader variant="auth" showBackButton />

// Custom back button
<AppHeader 
  variant="auth" 
  showBackButton 
  backButtonHref="/dashboard"
  backButtonLabel="Back to Dashboard"
/>
```

**Features:**

- ✅ Consistent branding across all pages
- ✅ Smooth Framer Motion animations
- ✅ Responsive design (mobile-first)
- ✅ Accessible navigation
- ✅ Hover states and transitions
- ✅ Clickable logo linking to home

**Animation Timeline:**

1. Header slides down from top (0.6s ease-out)
2. Logo scales and fades in (0.4s, 0.2s delay)
3. Navigation items scale and fade in (0.4s, 0.3s delay)

## Design Consistency

This module ensures that all pages maintain the same:
- Branding (logo, colors, typography)
- Spacing and layout
- Animation behavior
- User experience patterns

By using this shared header, we guarantee:
1. **Visual Consistency**: Same look and feel across the app
2. **Maintainability**: Update header once, reflects everywhere
3. **Performance**: Shared component = less code duplication
4. **Accessibility**: Consistent navigation patterns

## Integration

The header is used in:
- ✅ Landing page (`app/page.tsx`) via `<Navigation />` component
- ✅ Login page (`app/auth/login/page.tsx`)
- ✅ Register page (`app/auth/register/page.tsx`)

## Future Enhancements

- [ ] Mobile menu (hamburger) for smaller screens
- [ ] User avatar/dropdown when authenticated
- [ ] Notifications bell icon
- [ ] Search functionality
- [ ] Dark mode toggle
- [ ] Active page indicator
- [ ] Breadcrumb navigation for deep pages

## Dependencies

- **Next.js**: Link component for navigation
- **Lucide React**: Shield and ArrowLeft icons
- **Framer Motion**: Smooth animations
- **Tailwind CSS**: Styling and responsive design
- **cn utility**: Class name merging

## Related Modules

- **Landing Module**: Contains the `<Navigation />` wrapper component
- **Auth Module**: Uses header on login/register pages
