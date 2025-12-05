# Auth Module

This module contains all authentication-related functionality following the module-first architecture pattern.

## Structure

```
src/modules/auth/
├── components/                         # Reusable auth UI components
│   ├── registration-wizard.tsx         # Multi-step registration wizard
│   ├── registration-step-indicator.tsx # Progress indicator component
│   ├── registration-step-navigation.tsx # Navigation buttons (Back/Next/Submit)
│   ├── registration-form.tsx           # Single-page registration form
│   ├── registration-form-personal.tsx  # Personal information section
│   ├── registration-form-professional.tsx  # Professional details section
│   ├── registration-form-security.tsx  # Password and security section
│   ├── registration-form-terms.tsx     # Terms acceptance section
│   ├── password-input.tsx              # Reusable password input with toggle
│   ├── password-strength-indicator.tsx # Password strength display
│   ├── form-field-wrapper.tsx          # Consistent field wrapper
│   └── index.ts                        # Barrel exports
├── hooks/                              # Custom React hooks
│   ├── use-registration-wizard.ts      # Multi-step wizard state management
│   └── index.ts                        # Barrel exports
├── types/                              # TypeScript type definitions
│   ├── index.ts                        # Form types and interfaces
│   └── wizard.ts                       # Wizard step definitions
├── utils/                              # Utility functions
│   └── validation.ts                   # Form validation logic
├── constants/                          # Constants and configuration
│   └── index.ts                        # Medical specialties, etc.
└── index.ts                            # Module exports
```

## Multi-Step Registration Wizard

### Overview

The registration wizard breaks the doctor onboarding process into **4 digestible steps**:

1. **Personal Info** - Name, email, phone number
2. **Professional** - Medical license number, specialty
3. **Security** - Password creation and confirmation
4. **Confirm** - Review information and accept terms

### Features

#### 🎯 Step-by-Step Validation
- Each step validates only its own fields
- Clear error messages for invalid inputs
- Auto-scroll to first error field
- Fields must be filled to proceed

#### 🔄 Flexible Navigation
- **Next button**: Proceeds to next step (with validation)
- **Back button**: Returns to previous step (no validation)
- **Create Account**: Final submission on last step
- Smooth scroll animations between steps

#### 📊 Progress Tracking
- Visual step indicator with completed/current/upcoming states
- Progress bar connecting steps
- Step titles and descriptions
- Mobile-optimized progress display

#### 💾 State Management
- Form data persists across steps
- Validation errors tracked per step
- Loading states during submission
- Error recovery with step navigation

#### ♿ Accessibility
- ARIA labels for progress indicators
- Keyboard navigation support
- Screen reader friendly
- Focus management

### Usage

#### Basic Wizard Implementation

```tsx
import { RegistrationWizard } from '@/src/modules/auth'
import type { DoctorRegistrationForm } from '@/src/modules/auth/types'

export default function RegisterPage() {
  const handleRegistration = async (data: DoctorRegistrationForm) => {
    // Your registration logic here
    await api.register(data)
  }

  return <RegistrationWizard onSubmit={handleRegistration} />
}
```

#### Custom Hook Usage

```tsx
import { useRegistrationWizard } from '@/src/modules/auth/hooks'

function CustomWizard() {
  const {
    currentStep,
    formData,
    errors,
    isSubmitting,
    totalSteps,
    handleChange,
    handleNext,
    handleBack,
    handleSubmit,
    canProceedToNextStep,
  } = useRegistrationWizard()

  // Build your custom wizard UI
}
```

### Step Configuration

Steps are defined in `types/wizard.ts`:

```tsx
export const REGISTRATION_STEPS: WizardStep[] = [
  {
    id: 1,
    title: 'Personal Info',
    description: 'Tell us about yourself',
    fields: ['fullName', 'email', 'phoneNumber'],
  },
  {
    id: 2,
    title: 'Professional',
    description: 'Verify your credentials',
    fields: ['medicalLicenseNumber', 'specialty'],
  },
  {
    id: 3,
    title: 'Security',
    description: 'Secure your account',
    fields: ['password', 'confirmPassword'],
  },
  {
    id: 4,
    title: 'Confirm',
    description: 'Review and agree',
    fields: ['acceptTerms'],
  },
]
```

### Component APIs

#### RegistrationWizard

```tsx
interface RegistrationWizardProps {
  onSubmit: (data: DoctorRegistrationForm) => Promise<void>
}
```

#### RegistrationStepIndicator

```tsx
interface RegistrationStepIndicatorProps {
  steps: WizardStep[]
  currentStep: number
}
```

#### RegistrationStepNavigation

```tsx
interface RegistrationStepNavigationProps {
  currentStep: number
  totalSteps: number
  canGoNext: boolean
  isSubmitting: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
}
```

#### useRegistrationWizard Hook

```tsx
function useRegistrationWizard() {
  return {
    currentStep: number
    formData: Partial<DoctorRegistrationForm>
    errors: FormErrors
    isSubmitting: boolean
    totalSteps: number
    handleChange: (field, value) => void
    handleNext: () => void
    handleBack: () => void
    handleSubmit: (onSubmit) => Promise<void>
    canProceedToNextStep: boolean
  }
}
```

## Design Principles

### Component Modularity & Granularity

Each component has a **single, well-defined responsibility**:

#### Wizard Components
- **RegistrationWizard**: Main container orchestrating the multi-step flow
- **RegistrationStepIndicator**: Visual progress tracker
- **RegistrationStepNavigation**: Navigation buttons with validation

#### Form Sections (Separated by concern)
- **RegistrationFormPersonal**: Personal contact information
- **RegistrationFormProfessional**: Medical credentials
- **RegistrationFormSecurity**: Password creation
- **RegistrationFormTerms**: Terms acceptance

#### Reusable Components
- **PasswordInput**: Password field with show/hide toggle
- **FormFieldWrapper**: Consistent label, error, and description display
- **PasswordStrengthIndicator**: Visual password strength feedback

### Benefits

1. **Reduced Cognitive Load**: Users focus on one section at a time
2. **Better Completion Rates**: Smaller steps feel more achievable
3. **Clear Progress**: Users know how far they are in the process
4. **Flexible Navigation**: Easy to go back and correct mistakes
5. **Maintainability**: Each step can be updated independently
6. **Reusability**: Components can be used in other forms
7. **Testability**: Each component can be tested in isolation

## Validation Strategy

### Per-Step Validation
- Only validates fields in the current step
- Shows errors immediately when moving to next step
- Doesn't validate previous steps when going back

### Final Validation
- On submission, validates all steps
- If errors found, navigates to the first step with errors
- Shows all errors for that step

### Real-Time Validation
- Clears errors as user types
- Enables/disables Next button based on field completion
- Password strength indicator updates in real-time

## Styling

The wizard uses:
- **ShadCN UI components**: Button, Card, Input, Label, Select, Checkbox, Separator
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Check, ChevronLeft, ChevronRight, Loader2
- **Consistent spacing**: Design system scale (4px increments)
- **Professional theme**: Serious and trustworthy for medical use

## Accessibility Features

- ✅ Proper ARIA labels (`aria-current`, `aria-invalid`, `aria-describedby`)
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus management on step transitions
- ✅ Auto-scroll to errors
- ✅ Screen reader friendly progress indicators
- ✅ Semantic HTML structure
- ✅ Loading states clearly communicated

## Responsive Design

- ✅ Mobile-first approach
- ✅ Compact progress indicator on mobile (shows current step below)
- ✅ Full step titles visible on desktop
- ✅ Touch-friendly navigation buttons
- ✅ Adaptive card padding
- ✅ Fluid typography

## Medical Specialties

Supported specialties (from `constants/index.ts`):
- Cardiology
- Dermatology
- Emergency Medicine
- Endocrinology
- Family Medicine
- Gastroenterology
- General Surgery
- Internal Medicine
- Neurology
- Obstetrics & Gynecology
- Oncology
- Ophthalmology
- Orthopedics
- Otolaryngology (ENT)
- Pediatrics
- Psychiatry
- Radiology
- Urology

## Future Enhancements

- [ ] Add save draft functionality (localStorage)
- [ ] Email verification step
- [ ] Medical license verification API integration
- [ ] Photo upload step
- [ ] Additional credential fields (certifications, affiliations)
- [ ] Two-factor authentication setup step
- [ ] Progressive field validation (as user types)
- [ ] Step completion animations
- [ ] Mobile app deep linking for photo uploads
- [ ] Analytics tracking for step completion rates
