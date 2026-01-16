---
description: Standard styling rules for ensuring visual consistency across themes (Light, Dark, Sepia).
---
# UI Standardization Guide

This guide documents the standard styling rules for the application to ensure visual consistency across all themes (Light, Dark, Sepia).

## 1. Typography Standards

We use a strict hierarchy to distinguish between section titles and content labels.

### Card Title (Heading)
Used for the main headers of sidebar sections (e.g., "TEXT & TRANSLATION", "DEVICE MOCKUP").

- **Class**: `text-xs font-bold uppercase`
- **Color**: `text-[var(--app-text-secondary)]`
- **Size**: 12px

```jsx
<h3 className="text-xs uppercase text-[var(--app-text-secondary)] font-bold mb-4 flex items-center gap-2">
  <Icon className="w-3 h-3" /> {title}
</h3>
```

### Content Label (Secondary Text)
Used for control labels, input descriptions, and sub-headers (e.g., "Alignment", "Opacity", "Font").

- **Class**: `text-[10px]`
- **Color**: `text-[var(--app-text-secondary)]`
- **Size**: 10px

```jsx
<label className="text-[10px] text-[var(--app-text-secondary)] mb-1">
  {label}
</label>
```

## 3. Slider Standards

Visual hierarchy for range inputs (sliders).

- **Thumb (Dot)**: Must use the accent color `var(--app-accent)` (Vibrant/Darker).
- **Track (Bar)**: Must use the track color `var(--app-control-track)` with **NO progress fill**.
- **Implementation**: strict use of `.app-slider` class is required to ensure consistent behavior across browsers.

```jsx
// Use the .app-slider utility class defined in index.css
<input
  type="range"
  className="flex-1 app-slider"
  // ... other props
/>
```

```css
/* Standard Implementation (in index.css) */
.app-slider {
  -webkit-appearance: none;
  background: var(--app-control-track); /* Uniform Track */
  height: 4px;
}
.app-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  background: var(--app-accent); /* Accent Thumb */
  width: 14px; height: 14px;
}
```

## 4. Button Standards

Standard styles for action buttons (e.g., "Apply to All", "Reset", "Import").

### Secondary Action Button (Light Accent)
Used for secondary actions that arguably need to stand out but not dominate (e.g., "Apply to all").

- **Container**: `bg-[var(--app-accent-light)] border border-[var(--app-accent)]/30`
- **Text**: `text-[var(--app-accent)] text-xs`
- **Hover**: `hover:text-[var(--app-accent-hover)] hover:bg-[var(--app-accent)]/20`
- **Icon**: `w-3 h-3` (consistent with text size)

```jsx
<button className="text-xs flex items-center gap-1 text-[var(--app-accent)] hover:text-[var(--app-accent-hover)] bg-[var(--app-accent-light)] hover:bg-[var(--app-accent)]/20 px-2 py-1 rounded transition border border-[var(--app-accent)]/30">
  <Icon className="w-3 h-3" /> {label}
</button>
```

## 5. Reset Button Standards

Small icon button appearing next to inputs/sliders to reset to default value.

- **Container**: `opacity-0 group-hover:opacity-100 transition p-1` (Auto-hides)
- **Icon**: `w-3 h-3 text-[var(--app-text-muted)] hover:text-[var(--app-accent)]`
- **Behavior**: Should only appear when hovering the container group.

```jsx
<div className="group ...">
  <input ... />
  <button onClick={reset} className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] opacity-0 group-hover:opacity-100 transition">
    <RotateCcw className="w-3 h-3" />
  </button>
</div>
```

## 6. Color Standardization

Avoid hardcoded colors like `text-gray-400`, `text-gray-500`, or `text-white`. Always use semantic theme variables.

| Usage | Theme Variable | Description |
| :--- | :--- | :--- |
| **Primary Text** | `var(--app-text-primary)` | Main content, values, input text (Dark in Sepia/Light, White in Dark) |
| **Secondary Text** | `var(--app-text-secondary)` | Labels, headers, descriptions (Muted color) |
| **Muted/Disabled** | `var(--app-text-muted)` | Disabled states, placeholders |
| **Accent** | `var(--app-accent)` | Active states, primary buttons, highlights |

### Checklist for Refactoring
1.  **Identify**: Find elements using `text-xs`, `text-sm`, `text-gray-*`.
2.  **Replace Size**: Standardize to `text-xs` (Headers) or `text-[10px]` (Content).
3.  **Replace Color**: Change `text-gray-*` to `text-[var(--app-text-secondary)]`.
4.  **Verify**: Check across all themes (especially Sepia) to ensure visibility and contrast.
