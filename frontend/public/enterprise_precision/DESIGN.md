---
name: Enterprise Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474f'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#747780'
  outline-variant: '#c4c6d1'
  surface-tint: '#445e92'
  primary: '#001941'
  on-primary: '#ffffff'
  primary-container: '#0f2e60'
  on-primary-container: '#7d97cf'
  inverse-primary: '#aec6ff'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#311200'
  on-tertiary: '#ffffff'
  tertiary-container: '#512200'
  on-tertiary-container: '#ce865b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#aec6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#2b4679'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68b'
  on-tertiary-fixed: '#321200'
  on-tertiary-fixed-variant: '#6e3813'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  sidebar-width: 260px
  container-max: 1440px
---

## Brand & Style
The design system is engineered for high-density data environments, specifically centralized monthly reporting. The brand personality is **authoritative, reliable, and precise**, evoking a sense of institutional trust and operational efficiency. 

The design style follows a **Corporate Modern** aesthetic. It prioritizes functional clarity over decorative elements, utilizing a structured layout, subtle elevation, and a high-contrast palette to ensure complex financial and operational data remains legible. The interface should feel "enterprise-grade"—robust enough to handle massive datasets while remaining intuitive for executive review.

## Colors
This design system utilizes a high-contrast palette to differentiate between structural navigation, interactive elements, and data status.

- **Primary Deep Blue (#0f2e60):** Used for global navigation, primary actions, and headers to establish authority and focus.
- **Secondary Amber (#f59e0b):** Used sparingly for "Attention" states, warnings, and highlighting key performance indicators (KPIs) that require immediate review.
- **Neutral Grays:** A cool-toned gray scale facilitates a "layered" UI. `#f8fafc` is the primary application background, while `#ffffff` is reserved for data-bearing cards and containers.
- **Semantic Colors:** Standard Green (Success) and Red (Error) are used for variance reporting and trend indicators (up/down).

## Typography
**Inter** is selected for its exceptional legibility in data-heavy interfaces and its comprehensive font weights.

- **Data Tables:** Use `data-mono` (tabular numerals) for all numerical figures in reports to ensure vertical alignment across rows.
- **Hierarchy:** Use `display-lg` for report titles and `label-caps` for table headers and sidebar categories to create clear visual separation.
- **Mobile Scaling:** For mobile views, `display-lg` should scale down to 24px (`headline-md`) to prevent excessive wrapping.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. 
- **Sidebar:** A fixed 260px left-hand navigation persists across all views.
- **Content Area:** A fluid container with a max-width of 1440px to ensure line lengths remain readable on ultra-wide monitors.
- **Grid:** A 12-column grid is used for dashboard cards. On desktop, cards typically span 3, 4, or 6 columns. 
- **Density:** The system uses a "Compact" spacing rhythm (4px base) to maximize the "above-the-fold" data visibility. 
- **Breakpoints:**
  - Mobile (<768px): Sidebar collapses into a hamburger menu; 1-column card stack; 16px margins.
  - Tablet (768px - 1024px): Sidebar collapses to an icon-only rail; 2-column card stack.
  - Desktop (>1024px): Full layout enabled.

## Elevation & Depth
Depth is used to distinguish the "Work Surface" from the "Navigation Shell."

- **Level 0 (Background):** The application background uses `#f8fafc`. No shadow.
- **Level 1 (Cards/Tables):** Main data containers use a white background with a subtle, 1px border in `#e2e8f0`. A very soft ambient shadow (Y: 1px, Blur: 3px, Opacity: 0.05) is used to lift these elements slightly.
- **Level 2 (Dropdowns/Modals):** Elements that overlay the UI use a more pronounced shadow (Y: 10px, Blur: 20px, Opacity: 0.1) to focus user attention and provide clear z-axis separation.

## Shapes
The shape language is **Soft and Professional**.
- Standard UI elements like buttons, input fields, and cards use a **0.25rem (4px)** corner radius.
- This subtle rounding maintains a disciplined, "spreadsheet" feel while avoiding the harshness of 90-degree corners.
- Larger containers like modals or primary dashboard widgets may use **0.5rem (8px)** to feel more distinct from the background.

## Components
### Dashboard Cards
Cards must have a consistent header structure: `Title-sm` left-aligned, and optional "Actions" (export, filter) right-aligned. Padding should be a consistent `lg (24px)`.

### Interactive Data Tables
- **Header:** Sticky headers with `#f1f5f9` background. 1px solid bottom border.
- **Rows:** Alternating "Zebra" striping is discouraged; use subtle hover states (`#f8fafc`) to help the eye track across rows.
- **Cells:** Vertical padding of 12px for standard density. Numerical data must be right-aligned.

### Sidebar Navigation
- **Primary State:** Deep Blue background (`#0f2e60`) with white text at 80% opacity.
- **Active State:** A vertical Amber (`#f59e0b`) "indicator" bar (4px wide) on the left edge of the active menu item.
- **Dropdowns:** Nested items should be indented 16px and use a slightly darker shade of blue for the background.

### Input Fields
- Use "outlined" style with a 1px border. 
- **Focus State:** 2px border in Primary Deep Blue with a 2px outer "halo" of the same color at 10% opacity.

### Buttons
- **Primary:** Solid Deep Blue with white text.
- **Secondary:** Outlined Deep Blue with Deep Blue text.
- **Ghost:** Transparent background with Neutral Gray text for utility actions.