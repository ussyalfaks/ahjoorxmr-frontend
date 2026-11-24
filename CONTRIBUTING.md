# Contributing to Ahjoor Frontend

Thank you for your interest in contributing to Ahjoor! We welcome contributions from the community and appreciate your help in making the project better.

## Table of Contents

- [Getting Started](#getting-started)
- [Setup Instructions](#setup-instructions)
- [Branching Strategy](#branching-strategy)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Standards](#code-standards)
- [Commit Message Guidelines](#commit-message-guidelines)

## Getting Started

Before you begin contributing, please:

1. Read through this contributing guide
2. Review the [README.md](./README.md) for project overview
3. Check existing [issues](https://github.com/nikkybel/ahjoorxmr-frontend/issues) and [pull requests](https://github.com/nikkybel/ahjoorxmr-frontend/pulls)
4. Join our community discussions if available

## Setup Instructions

### Prerequisites

- Node.js 20 or later
- pnpm 9 (the version used by CI)
- Git

### Local Development Setup

1. **Fork the repository**
   
   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**
   
   ```bash
   git clone https://github.com/YOUR_USERNAME/ahjoorxmr-frontend.git
   cd ahjoorxmr-frontend
   ```

3. **Add upstream remote**
   
   ```bash
   git remote add upstream https://github.com/nikkybel/ahjoorxmr-frontend.git
   ```

4. **Install dependencies**
   
   ```bash
   pnpm install --frozen-lockfile
   ```

5. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and adjust values if needed. The variables are optional for local development; see the [README environment-variable reference](./README.md#environment-variables).

6. **Run the development server**
   
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Branching Strategy

We follow a structured branching strategy to keep the codebase organized:

### Branch Naming Convention

- **Feature branches**: `feat/issue-number-short-description`
  - Example: `feat/123-add-user-authentication`
  
- **Bug fix branches**: `fix/issue-number-short-description`
  - Example: `fix/456-resolve-login-error`
  
- **Documentation branches**: `docs/issue-number-short-description`
  - Example: `docs/789-update-readme`
  
- **Refactor branches**: `refactor/issue-number-short-description`
  - Example: `refactor/234-optimize-api-calls`

### Working with Branches

1. **Always branch from the latest main**
   
   ```bash
   git switch main
   git pull upstream main
   git switch -c feat/123-your-feature
   ```

2. **Keep your branch up to date**
   
   Regularly sync with the main branch:
   
   ```bash
   git switch main
   git pull upstream main
   git switch feat/123-your-feature
   git rebase main
   ```

3. **Push your branch**
   
   ```bash
   git push origin feat/123-your-feature
   ```

## Pull Request Guidelines

### Before Submitting a PR

- [ ] Ensure your code follows the project's code standards
- [ ] Run the relevant checks locally (see [Testing](#testing))
- [ ] Update documentation if needed
- [ ] Ensure all tests pass
- [ ] Rebase your branch on the latest main
- [ ] Write clear, descriptive commit messages

### Creating a Pull Request

1. **Push your changes** to your fork
   
   ```bash
   git push origin feat/123-your-feature
   ```

2. **Open a Pull Request** on GitHub
   
   - Navigate to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template completely

3. **PR Title Format**
   
   Use the format: `type: brief description`
   
   Examples:
   - `feat: Add user authentication system`
   - `fix: Resolve login redirect issue`
   - `docs: Update setup instructions`

4. **PR Description**
   
   Your PR description should include:
   - Summary of changes
   - Issue references (e.g., `Closes #123`)
   - Testing steps
   - Screenshots (if UI changes)
   - Breaking changes (if any)

### PR Review Process

- At least one maintainer review is required
- Address all review comments
- Keep the PR scope focused and manageable
- Be responsive to feedback
- Once approved, a maintainer will merge your PR

### After Your PR is Merged

1. Delete your feature branch:
   
   ```bash
   git switch main
   git branch -d feat/123-your-feature
   git push origin --delete feat/123-your-feature
   ```

2. Update your local main:
   
   ```bash
   git switch main
   git pull upstream main
   ```

## Code Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing code style and conventions
- Use meaningful variable and function names
- Add comments only where they clarify non-obvious logic
- Keep functions small and focused

### React Components

- Use functional components with hooks
- Follow the project's component structure
- Implement proper prop types
- Handle loading and error states
- Make components reusable when possible

### Styling

- Follow the existing styling approach (Tailwind CSS/CSS Modules)
- Maintain responsive design principles
- Ensure accessibility standards (WCAG)

### Testing

- Write tests for new features
- Update existing tests when modifying code
- Ensure relevant checks pass before submitting a PR:
  ```bash
  pnpm run lint
  pnpm run typecheck
  pnpm run test
  pnpm run build
  ```
- For end-to-end tests, run `pnpm run test:e2e`. Install the Playwright browser first with `pnpm exec playwright install chromium`.

## Commit Message Guidelines

We follow conventional commit messages:

### Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add social login support

Implemented OAuth authentication for Google and GitHub.
Closes #123

fix(ui): resolve mobile navigation overlay issue

The navigation menu was not closing properly on mobile devices.
This fix ensures proper z-index stacking.

Closes #456
```

## Questions or Need Help?

- Open an issue for bugs or feature requests
- Join our community chat (if available)
- Reach out to maintainers

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment for all contributors.

---

Thank you for contributing to Ahjoor! 🚀
