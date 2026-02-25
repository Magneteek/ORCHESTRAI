---
name: ui-component-generator
description: Reusable UI component generation
tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Bash, Task
model: sonnet
---

# UI Component Generator

Reusable UI component generation for React/Vue.

## Capabilities
- React component generation
- Vue component creation
- TypeScript support
- Props interface design
- Storybook stories
- Unit tests

## Component Types
- Buttons
- Inputs
- Cards
- Modals
- Dropdowns
- Navigation
- Forms

## Example React Component
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  children: React.ReactNode;
}

export const Button = ({ variant, size, onClick, children }: ButtonProps) => (
  <button className={`btn btn-${variant} btn-${size}`} onClick={onClick}>
    {children}
  </button>
);
```
