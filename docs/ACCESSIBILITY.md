# Accessibility Guidelines (Issue #322)

This document outlines accessibility best practices and standards followed throughout the Ahjoor Frontend project. We aim to make our application usable by everyone, including people with disabilities.

## Overview

We follow the [Web Content Accessibility Guidelines (WCAG) 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/) as our standard. The project uses automated testing with `vitest-axe` and `@axe-core/playwright` to catch common accessibility issues.

---

## 1. Semantic HTML

Always use semantic HTML elements to provide meaningful structure to assistive technologies.

### Good Examples

```tsx
// ✅ GOOD: Semantic elements
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Article Title</h1>
    <p>Content here</p>
  </article>
</main>

<footer>
  <p>&copy; 2024 Ahjoor</p>
</footer>
```

### Bad Examples

```tsx
// ❌ WRONG: Non-semantic divs
<div class="header">
  <div class="nav">
    <div>
      <div><a href="/">Home</a></div>
    </div>
  </div>
</div>
```

---

## 2. ARIA Labels and Attributes

Use ARIA (Accessible Rich Internet Applications) labels and attributes to enhance semantic meaning, especially for interactive components.

### ARIA Label Best Practices

```tsx
// ✅ GOOD: Clear aria-label for icon buttons
<button aria-label="Close dialog">
  <CloseIcon />
</button>

// ✅ GOOD: aria-describedby for additional context
<input
  id="password"
  type="password"
  aria-describedby="pwd-hint"
/>
<small id="pwd-hint">At least 8 characters</small>

// ✅ GOOD: aria-live for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// ❌ WRONG: Vague or missing labels
<button>➖</button>  // Not descriptive

// ❌ WRONG: Redundant aria-label with visible text
<button aria-label="Save changes">Save</button>  // Redundant
```

### Common ARIA Attributes

| Attribute | Purpose | Example |
| --- | --- | --- |
| `aria-label` | Provides accessible name when no visible label | `<button aria-label="Close">×</button>` |
| `aria-labelledby` | Associates element with its label by ID | `<div aria-labelledby="title-id">` |
| `aria-describedby` | Provides additional description | `<input aria-describedby="help-text">` |
| `aria-live` | Announces dynamic content changes | `<div aria-live="polite">` |
| `aria-hidden` | Hides element from screen readers | `<span aria-hidden="true">→</span>` |
| `aria-pressed` | Indicates toggle button state | `<button aria-pressed="true">` |
| `aria-expanded` | Indicates collapsible section state | `<button aria-expanded="false">` |
| `aria-disabled` | Indicates disabled state | `<div aria-disabled="true">` |

---

## 3. Keyboard Navigation

All interactive elements must be keyboard accessible. Users should be able to navigate and interact with the app using only the Tab key.

### Keyboard Navigation Checklist

- [ ] All interactive elements are focusable (buttons, links, inputs)
- [ ] Tab order is logical and predictable
- [ ] Focus indicator is always visible
- [ ] Enter/Space keys activate buttons and links
- [ ] Arrow keys navigate lists and menus when appropriate
- [ ] Escape key closes modals and dropdowns
- [ ] Skip links allow users to jump to main content

### Implementation Example

```tsx
// ✅ GOOD: Modal with keyboard support
export function Modal({ isOpen, onClose, children }) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h2 id="modal-title">Dialog Title</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

---

## 4. Color Contrast

Text must have sufficient contrast against its background to be readable. Minimum WCAG AA contrast ratios:

- **Normal text (< 18pt)**: 4.5:1
- **Large text (≥ 18pt)**: 3:1

### Checking Contrast

- Use browser DevTools contrast checker
- Use online tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Use automated testing with `axe` during development

```tsx
// ✅ GOOD: Sufficient contrast
<p style={{ color: "#000", backgroundColor: "#fff" }}>
  This text has 21:1 contrast ratio
</p>

// ❌ WRONG: Insufficient contrast
<p style={{ color: "#bbb", backgroundColor: "#ccc" }}>
  This text fails contrast requirements
</p>
```

---

## 5. Focus Management

Manage focus properly to help keyboard users and screen reader users navigate your interface.

### Focus Management Patterns

```tsx
// ✅ GOOD: Manage focus on modal open
export function ModalTrigger() {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const openModal = () => {
    setIsOpen(true);
    // Focus moves to modal after render
    setTimeout(() => modalRef.current?.focus(), 0);
  };

  return (
    <>
      <button onClick={openModal}>Open Modal</button>
      {isOpen && (
        <div ref={modalRef} role="dialog" tabIndex={-1}>
          {/* Modal content */}
        </div>
      )}
    </>
  );
}

// ✅ GOOD: Skip to main content link
export function SkipLink() {
  return (
    <a href="#main-content" className="sr-only focus:not-sr-only">
      Skip to main content
    </a>
  );
}
```

---

## 6. Form Accessibility

Forms must be fully accessible for users with assistive technologies.

### Form Best Practices

```tsx
// ✅ GOOD: Accessible form
<form>
  <fieldset>
    <legend>Contact Information</legend>
    
    <label htmlFor="email">Email Address *</label>
    <input
      id="email"
      type="email"
      name="email"
      required
      aria-required="true"
      aria-describedby="email-help"
    />
    <small id="email-help">We'll never share your email</small>

    <label htmlFor="message">Message</label>
    <textarea
      id="message"
      name="message"
      rows={5}
    />

    <button type="submit">Send Message</button>
  </fieldset>
</form>

// ❌ WRONG: Inaccessible form
<form>
  <input placeholder="Email" />
  <textarea placeholder="Message" />
  <button>Send</button>
</form>
```

---

## 7. Images and Alt Text

All meaningful images must have descriptive alt text. Decorative images should have empty alt text.

### Alt Text Guidelines

```tsx
// ✅ GOOD: Descriptive alt text for meaningful images
<img
  src="circle-members.png"
  alt="Profile photos of 5 circle members: Ahmed, Maria, Kofi, Aisha, and James"
/>

// ✅ GOOD: Empty alt for decorative images
<img src="decorative-divider.svg" alt="" aria-hidden="true" />

// ✅ GOOD: Alt text for infographics
<img
  src="savings-chart.png"
  alt="Monthly savings growth chart showing increase from $500 in January to $2500 in December"
/>

// ❌ WRONG: Generic or missing alt text
<img src="chart.png" alt="Chart" />
<img src="logo.png" alt="Ahjoor" />
```

---

## 8. Testing for Accessibility

### Automated Testing

Add accessibility checks to component tests using `jest-axe`:

```tsx
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("Button Component - Accessibility", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(
      <button onClick={() => {}}>Click me</button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Testing

- **Screen Reader Testing**: Use NVDA (Windows), JAWS, or VoiceOver (Mac) to test navigation
- **Keyboard Navigation**: Tab through the entire application
- **Zoom Testing**: Zoom to 200% and verify layout remains usable
- **Color Blindness**: Use tools like [Coblis](https://www.color-blindness.com/coblis-color-blindness-simulator/) to simulate color vision deficiency

### Running E2E Accessibility Tests

```bash
pnpm test:e2e
# Tests include @axe-core/playwright checks on main routes
```

---

## 9. Common Accessibility Issues & Fixes

| Issue | Impact | Fix |
| --- | --- | --- |
| Missing alt text on images | Screen readers can't describe images | Add descriptive `alt` attribute |
| Keyboard traps | Users can't navigate away | Ensure Escape key or other escape mechanism works |
| Poor color contrast | Low vision users can't read text | Use WebAIM checker, ensure 4.5:1 ratio minimum |
| Non-semantic markup | Screen readers misinterpret structure | Use `<header>`, `<nav>`, `<main>`, `<footer>` tags |
| Missing form labels | Screen readers can't associate labels with inputs | Use `<label htmlFor="id">` with matching `id` |
| Unlabeled buttons with icons | Icon-only buttons aren't descriptive | Add `aria-label` or combine with text |
| Inaccessible modals | Keyboard users can't close modals | Trap focus, handle Escape key |

---

## 10. Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Axe DevTools](https://www.deque.com/axe/devtools/)
- [WebAIM Articles](https://webaim.org/articles/)
- [A11y Checklist](https://www.a11yproject.com/checklist/)

---

## Contributing Accessible Code

When submitting PRs:

1. Run `pnpm test` to ensure no accessibility violations
2. Test with keyboard navigation
3. Test with a screen reader (at least manually for complex components)
4. Include alt text for all images
5. Use semantic HTML and ARIA attributes appropriately
6. Maintain minimum 4.5:1 color contrast ratio

