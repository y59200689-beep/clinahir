# Clinahir prospects workspace

Direction: Forest directory. Inspired by the supplied hotel directory and order queue references: dense readable rows, quiet boundaries, compact summaries, aligned filters. Keep the existing forest brand, without charts or invented signals.

Tokens: canvas #f5f7f6; surface #ffffff; ink #1c2d26; muted #617069; line #dfe6e2; primary #18543c; navigation #12372b. Existing system sans font; titles 28px/600, body 14px, secondary 12px. Space scale 4/8/12/16/24/32. Control radius 8px, panels 12px, no decorative gradients. Content left aligned.

Hierarchy: 64px topbar, title and context, compact four summary filters, directory header/actions, search and three explicit filter labels, results count, sticky-header table, pagination. Use full available content width. Sidebar 224px desktop, drawer below 900px. On narrow screens keep filter controls in two columns and contain horizontal scrolling within the table; retain center identity while scrolling.

Interactions: visible focus ring, 44px touch controls, semantic pressed states on summaries, readable review status text, busy status and stable table while refreshing, explicit retry on failure, clear filters on empty search. Preserve APIs, auth, imports, review updates and pagination. Development verification uses local fixture data only, with no production writes.
