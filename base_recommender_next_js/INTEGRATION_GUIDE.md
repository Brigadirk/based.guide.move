# Section Integration Guide

This guide explains how to add "Check My Information" buttons to the remaining section components.

## What's Been Completed

✅ **Backend Infrastructure:**
- Individual section story generation functions
- API endpoints for all 8 sections + summary
- Pydantic schemas for request validation

✅ **Frontend Infrastructure:**
- API client (`lib/api-client.ts`)
- Section info modal component (`components/ui/section-info-modal.tsx`)
- Check info button component (`components/ui/check-info-button.tsx`)
- Section info hook (`lib/hooks/use-section-info.ts`)

✅ **Integrated Sections:**
- Personal Information ✅
- Education ✅  
- Finance ✅

## Remaining Sections to Integrate

The following sections need the "Check My Information" button added:

- [ ] Residency Intentions (`residency-intentions.tsx`)
- [ ] Social Security & Pensions (`social-security-pensions.tsx`)
- [ ] Tax Deductions & Credits (`tax-deductions-and-credits.tsx`)
- [ ] Future Financial Plans (`future-financial-plans.tsx`)
- [ ] Additional Information (`additional-information.tsx`)
- [ ] Summary (`summary.tsx`)

## Integration Template

For each remaining section, follow this pattern:

### 1. Add imports
```typescript
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { useSectionInfo } from "@/lib/hooks/use-section-info"
```

### 2. Add hook to component
```typescript
export function SectionName({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, showSectionInfo, closeModal } = useSectionInfo()
  
  // ... rest of component
}
```

### 3. Update the action buttons
Replace the single "Continue" button with:
```typescript
{/* Check My Information Button */}
<div className="flex gap-3">
  <CheckInfoButton
    onClick={() => showSectionInfo("SECTION_TYPE")}
    isLoading={isCheckingInfo}
    className="flex-1"
    variant="secondary"
  />
  <Button
    disabled={!canContinue}
    onClick={handleComplete}
    className="flex-1"
    size="lg"
  >
    Continue to Next Section
  </Button>
</div>
```

### 4. Add modal at end of component
```typescript
{/* Section Info Modal */}
<SectionInfoModal
  isOpen={isModalOpen}
  onClose={closeModal}
  title={modalTitle}
  story={currentStory}
  isLoading={isCheckingInfo}
/>
```

## Section Type Mapping

Use these section types for the `showSectionInfo()` call:

- `"residency"` - Residency Intentions
- `"social-security"` - Social Security & Pensions  
- `"tax-deductions"` - Tax Deductions & Credits
- `"future-plans"` - Future Financial Plans
- `"additional"` - Additional Information
- `"summary"` - Complete Summary

## API Endpoints

All endpoints are available at `http://localhost:5001/api/v1/section/`:

- `/section/personal-information`
- `/section/education`
- `/section/residency-intentions`
- `/section/finance`
- `/section/social-security-pensions`
- `/section/tax-deductions-credits`
- `/section/future-financial-plans`
- `/section/additional-information`
- `/section/summary`

## Environment Setup

Make sure to set the API URL in your environment:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
```

## Testing

1. Start the backend: `cd base_recommender_backend && uvicorn app:app --reload --port 5001`
2. Start the frontend: `cd base_recommender_next_js && npm run dev`
3. Fill out a section and click "Check My Information"
4. Verify the modal shows the generated story
