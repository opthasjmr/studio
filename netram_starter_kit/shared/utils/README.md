# Netram Shared Utilities Library

This directory is intended to host shared utility functions, constants, types, and helper modules that can be used across different applications and services within the Netram monorepo.

## Purpose

-   **DRY (Don't Repeat Yourself):** Avoid duplicating common logic across different parts of the platform.
-   **Consistency:** Ensure that common tasks (e.g., date formatting, validation, API calls) are handled consistently.
-   **Maintainability:** Centralize utility code for easier updates and bug fixes.

## Potential Contents

-   **Date/Time Utilities:** Functions for formatting, parsing, and manipulating dates and times (e.g., using `date-fns`).
-   **Validation Utilities:** Schemas and helper functions for data validation (e.g., using `zod`).
-   **API Client/Helpers:** A common wrapper for making API calls to backend services, handling errors, authentication tokens, etc.
-   **Type Definitions:** Shared TypeScript interfaces and types used across frontend and backend.
-   **Constants:** Application-wide constants (e.g., role names, status codes, API endpoints if not configured via .env).
-   **Formatting Helpers:** Functions for formatting currency, numbers, etc.
-   **String Manipulation Utilities.**
-   **Error Handling Utilities.**

## Structure (Example)

```
/shared/utils/
├── src/
│   ├── date-utils.ts
│   ├── validation-schemas.ts
│   ├── api-client.ts
│   ├── types.ts
│   ├── constants.ts
│   └── index.ts          # Exports all utilities
├── package.json
├── tsconfig.json
└── README.md
```

## Development

-   Write unit tests for all utility functions to ensure reliability.
-   Keep utilities small, focused, and well-documented.

## Usage

Applications and services within the monorepo can import utilities from this shared library:

```typescript
// Example in apps/web-client/src/components/SomeComponent.tsx
import { formatDate } from '@netram/utils/date-utils'; // Assuming @netram scope
import type { Patient } from '@netram/utils/types';

function DisplayPatientInfo({ patient }: { patient: Patient }) {
  return (
    <div>
      <p>DOB: {formatDate(patient.dob)}</p>
    </div>
  );
}

// Example in services/patient-service/src/handlers.ts
import { PatientSchema } from '@netram/utils/validation-schemas';

function createPatient(data: unknown) {
  const validatedData = PatientSchema.parse(data);
  // ... proceed with creating patient
}
```

This is a placeholder. The actual implementation will depend on the chosen monorepo tooling and the specific needs of the applications and services.
```