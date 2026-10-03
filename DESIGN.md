# Clinahir dashboard design context

The public landing page uses the existing dark, white, and green palette. Its role and priority fields use custom rounded dropdowns with keyboard navigation, selected states, and a menu that matches the form. The existing appointment creation form uses native date and select controls. The landing form uses browser validity checks with an explicit `noValidate` owner; it reports success only after the same-origin lead API confirms durable capture. Integration delivery status remains private.

The radiology center dashboard is shown inside the existing landscape hero. Changing sidebar pages keeps that hero framing, the translucent shell, its navigation, and the top bar in place.

## Visual language

- Glass surfaces use `bg-white/5`, `border-white/10`, rounded corners, a restrained shadow, and `backdrop-blur-xl`. Dashboard cards, tables, inbox panels, and controls share this treatment.
- Primary text is white with high opacity; secondary text uses `text-white/50` to `text-white/75`. Use compact labels and generous spacing so the background stays visible without reducing legibility.
- Cyan marks general activity, amber calls attention to pending or unread items, and emerald marks completed or read items. Accent areas stay translucent.
- Sidebar page headings align to the left edge of the content column. Summary cards follow a three-column grid when space allows and stack at narrow widths.

## Interaction language

- Use visible selected states on sidebar items, tabs, filters, and list rows. Keyboard focus uses a visible cyan ring.
- Open a record into its detail area without changing the landscape background or dashboard shell.
- Keep English and French labels available through the existing `language` prop used by dashboard pages.
