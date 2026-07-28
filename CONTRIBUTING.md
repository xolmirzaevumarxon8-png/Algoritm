# Contributing Guidelines

Thank you for contributing to the Enterprise LMS Platform! To maintain codebase quality and smooth multi-developer collaboration, please follow the guidelines below.

---

## 🌿 Branch Strategy

We follow the standard GitFlow branching model:

- `main` — Production branch. Only contains stable, tested, and released code.
- `develop` — Development integration branch. All feature branches merge here first.
- `feature/<feature-name>` — For new features (e.g. `feature/student-certificates`).
- `fix/<bug-name>` — For bug fixes (e.g. `fix/cashier-receipt-print`).
- `release/<version>` — For preparing a release (e.g. `release/v2.1.0`).

---

## 🚀 Quick Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd oquv-markaz
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```

3. **Start backend and frontend concurrently**:
   ```bash
   npm run dev
   ```

---

## 📝 Commit Conventions

Use Conventional Commits format for clear commit history:

- `feat:` A new feature for the user or system
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Formatting, missing semi-colons, no code change
- `refactor:` Code refactoring without changing behavior
- `test:` Adding or updating unit/integration tests
- `chore:` Updating build tasks, dependencies, gitignore, etc.

*Example*: `feat(cashier): add printable receipt modal`

---

## 🔄 Pull Request Workflow

1. Create a branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-new-feature
   ```
2. Make changes and verify build cleanly:
   ```bash
   npm run build
   ```
3. Commit and push your branch:
   ```bash
   git add .
   git commit -m "feat(module): brief description of change"
   git push origin feature/my-new-feature
   ```
4. Open a Pull Request targeting the `develop` branch.
5. Request review from at least 1 team member before merging.
