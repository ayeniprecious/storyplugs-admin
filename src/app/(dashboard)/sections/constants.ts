import type { CuratedSectionPage, CuratedSectionStyle } from "@/lib/database.types";

// Named positions rather than a raw sort number -- these map 1:1 to real section
// boundaries in storyplugs-mobile's src/app/(app)/index.tsx and search.tsx.
export const ANCHORS: Record<CuratedSectionPage, { value: string; label: string }[]> = {
  home: [
    { value: "home_after_continue_reading", label: 'After "Continue Reading"' },
    { value: "home_after_recommended", label: 'After "Recommended for You"' },
    { value: "home_before_browse_by_category", label: 'Before "Browse by Category"' },
    { value: "home_end", label: "At the end of the page" },
  ],
  search: [
    { value: "search_after_featured", label: "After the Featured carousel" },
    { value: "search_after_suggestions", label: "After the search suggestions" },
    { value: "search_after_new_this_week", label: 'After "New This Week"' },
    { value: "search_end", label: "At the end of the page" },
  ],
};

export const ANCHOR_LABELS: Record<string, string> = Object.fromEntries(
  [...ANCHORS.home, ...ANCHORS.search].map((a) => [a.value, a.label])
);

export const STYLES: { value: CuratedSectionStyle; label: string; description: string }[] = [
  {
    value: "poster",
    label: "Poster Carousel",
    description: "Horizontal scroll of tall poster cards, like Browse by Category.",
  },
  {
    value: "row",
    label: "Row List",
    description: "Vertical list of cards with a background fill, like the Library screen.",
  },
  {
    value: "ranked",
    label: "Ranked List",
    description: 'Numbered vertical list with tags, like "Recommended for You" (max 5 shown).',
  },
];

export const STYLE_LABELS: Record<CuratedSectionStyle, string> = Object.fromEntries(
  STYLES.map((s) => [s.value, s.label])
) as Record<CuratedSectionStyle, string>;
