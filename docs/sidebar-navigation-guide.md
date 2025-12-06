# Sidebar Navigation Guide

## Overview

This document outlines the sidebar navigation structure for the AI-Powered Treatment Plan Assistant. The design follows the **80/20 principle** - focusing on the 20% of features that deliver 80% of value to healthcare professionals.

---

## Critical User Journey

Based on the core application workflow defined in `cursor.mdc`:

```
Intake → AI Analysis → Doctor Review/Edit → Final Summary
```

---

## Sidebar Structure

| # | Navigation Item | Icon | URL | Purpose |
|---|-----------------|------|-----|---------|
| 1 | **Dashboard** | `LayoutDashboard` | `/dashboard` | Overview, recent activity, quick stats |
| 2 | **Patients** | `Users` | `/dashboard/patients` | Create & manage patient profiles |
| 3 | **New Treatment** | `Plus` | `/dashboard/treatment-plans/new` | Start treatment plan wizard |
| 4 | **Treatment Plans** | `FileText` | `/dashboard/treatment-plans` | View/manage all treatment plans |
| 5 | **Settings** | `Settings` | `/dashboard/settings` | Profile & preferences |

---

## User Flow Mapping

### Complete Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SIDEBAR NAVIGATION                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. DASHBOARD                                                       │
│     └── Entry point, overview of practice                           │
│                    │                                                │
│                    ▼                                                │
│  2. PATIENTS ─────────────────────────────────────────┐             │
│     └── Create patient profile                        │             │
│     └── Add medical history                           │             │
│     └── Document conditions & allergies               │             │
│                    │                                  │             │
│                    ▼                                  │             │
│  3. NEW TREATMENT ◄───────────────────────────────────┘             │
│     └── Select patient                                              │
│     └── [WIZARD STARTS]                                             │
│         ├── Step 1: Intake (current condition)                      │
│         ├── Step 2: AI Analysis (Gemini recommendations)            │
│         ├── Step 3: Doctor Review/Edit                              │
│         └── Step 4: Final Summary & Approval                        │
│                    │                                                │
│                    ▼                                                │
│  4. TREATMENT PLANS                                                 │
│     └── View all historical plans                                   │
│     └── Filter by status (Draft, Approved, etc.)                    │
│     └── Access plan details                                         │
│                                                                     │
│  5. SETTINGS                                                        │
│     └── User profile management                                     │
│     └── Preferences                                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Feature Mapping to Sidebar

### From `cursor.mdc` Core Features:

| Core Feature | Sidebar Location | Notes |
|--------------|------------------|-------|
| Treatment Plan Generation | **New Treatment** | Multi-step wizard |
| Safety & Risk Management | **New Treatment** (Step 2-3) | Part of AI analysis & review |
| Clinical Decision Support | **New Treatment** (Step 3) | Doctor review phase |
| Patient Data Management | **Patients** | CRUD operations |
| Doctor Workflow Integration | **New Treatment** | Review/edit/approve flow |

---

## Dashboard Quick Actions

The Dashboard should provide shortcuts to the most common actions:

```
┌─────────────────────────────────────────────────────────┐
│                    DASHBOARD                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Quick Stats:                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Total   │ │ Active  │ │ Pending │ │ Safety  │       │
│  │Patients │ │ Plans   │ │ Review  │ │ Alerts  │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                         │
│  Quick Actions:                                         │
│  ┌──────────────────┐ ┌──────────────────┐             │
│  │ + New Treatment  │ │ + Add Patient    │             │
│  └──────────────────┘ └──────────────────┘             │
│                                                         │
│  Recent Activity:                                       │
│  • Treatment plan approved - John Doe (2h ago)          │
│  • New patient added - Jane Smith (4h ago)              │
│  • AI analysis completed - Robert Johnson (6h ago)      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Treatment Plan Wizard Flow

When user clicks **"New Treatment"**, they enter the multi-step wizard:

### Step 1: Patient Selection & Intake
- Select existing patient OR create new
- Document current condition
- List current symptoms
- Note current medications

### Step 2: AI Analysis
- Gemini processes patient data
- Generates treatment recommendations
- Performs safety checks (drug interactions, contraindications)
- Calculates risk scores

### Step 3: Doctor Review & Edit
- Review AI-generated plan
- View flagged risks prominently
- Modify medications/dosages/duration
- Approve or reject recommendations
- View alternative treatment options

### Step 4: Final Summary
- Display final approved treatment plan
- Show risk assessment summary
- Generate structured output (JSON)
- Save to patient record

---

## Design Principles

1. **Minimal Navigation**: 5 items maximum in sidebar
2. **Clear Hierarchy**: Dashboard → Patients → Treatment → History
3. **Workflow-Driven**: Navigation mirrors the clinical workflow
4. **Progressive Disclosure**: Complex features hidden in wizard steps
5. **Quick Access**: Most common actions accessible from Dashboard

---

## Why This Structure?

### Removed Overhead:
- ❌ Team Switcher (single-doctor MVP)
- ❌ Nested submenus (flat navigation)
- ❌ Separate Safety/Alerts section (integrated into wizard)
- ❌ Analytics section (future enhancement)
- ❌ Multiple quick action panels (consolidated)

### Kept Core Features:
- ✅ Patient management
- ✅ Treatment plan creation wizard
- ✅ Historical plan access
- ✅ User settings
- ✅ Dashboard overview

---

## Future Enhancements

When scaling beyond MVP, consider adding:

1. **Analytics** - Practice insights and reporting
2. **Notifications** - Real-time alerts for critical risks
3. **Collaboration** - Multi-doctor review workflows
4. **Templates** - Saved treatment plan templates
5. **Integrations** - EHR system connections

---

**Last Updated**: December 2024
**Related Documents**: 
- `cursor.mdc` - Root documentation
- `project-mvp-plan.mdc` - MVP specifications
