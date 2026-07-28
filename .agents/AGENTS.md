# AI Language Protocol

The AI assistant (Antigravity and any subagents) must ALWAYS communicate with the user in the **Uzbek language (O'zbek tili)** in this project.
Regardless of the language of the prompt or the tool outputs, the final response presented to the user MUST be exclusively in Uzbek.

Rule ID: UzbekLanguageEnforcement

# Architecture & Coding Standards (Enterprise LMS)

1. **Premium UI/UX**:
   - Avoid plain templates. Use modern SaaS aesthetics: glassmorphism (`bg-white/5 backdrop-blur`), subtle glow effects, and a professional dark palette.
   - Use Skeleton loaders instead of boring spinners.
   - Strict form validation (e.g., phones in +998 format, no negative currencies).

2. **Strict TypeScript & Security**:
   - Absolutely NO `any` types. Everything must be strongly typed (API requests/responses, state interfaces).
   - Secure token storage. Use Axios Interceptors to inject tokens automatically.
   - Use strictly typed Protected Route components for page security.

3. **Backend & Prisma**:
   - Impeccable Error Handling on all API calls (Toast notifications, no white screens on 400/500 errors).
   - Strict relation definitions in Prisma (use `onDelete: Cascade` where appropriate so deletions don't leave orphaned rows).

Rule ID: StrictEnterpriseArchitecture
