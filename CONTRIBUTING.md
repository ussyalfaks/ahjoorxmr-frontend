# Contributing to Ahjoorxmr Frontend

Thank you for your interest in contributing to the Ahjoorxmr Frontend project! We welcome contributions from the community and appreciate your help in making this project better.

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
3. Check existing [issues](https://github.com/jaynomyaks/ahjoorxmr-frontend/issues) and [pull requests](https://github.com/jaynomyaks/ahjoorxmr-frontend/pulls)
4. Join our community discussions if available

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager
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
   git remote add upstream https://github.com/jaynomyaks/ahjoorxmr-frontend.git
   ```

4. **Install dependencies**
   
   ```bash
   npm install
   # or
   yarn install
   ```

5. **Set up environment variables**
   
   Copy the example environment file and configure it:
   
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables in `.env.local`.

6. **Run the development server**
   
   ```bash
   npm run dev
   # or
   yarn dev
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
   git checkout main
   git pull upstream main
   git checkout -b feat/123-your-feature
   ```

2. **Keep your branch up to date**
   
   Regularly sync with the main branch:
   
   ```bash
   git checkout main
   git pull upstream main
   git checkout feat/123-your-feature
   git rebase main
   ```

3. **Push your branch**
   
   ```bash
   git push origin feat/123-your-feature
   ```

## Pull Request Guidelines

### Before Submitting a PR

- [ ] Ensure your code follows the project's code standards
- [ ] Test your changes locally
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
   git branch -d feat/123-your-feature
   git push origin --delete feat/123-your-feature
   ```

2. Update your local main:
   
   ```bash
   git checkout main
   git pull upstream main
   ```

## Code Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing code style and conventions
- Use meaningful variable and function names
- Add comments for complex logic
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
- Ensure all tests pass before submitting PR

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

Thank you for contributing to Ahjoorxmr Frontend! 🚀
