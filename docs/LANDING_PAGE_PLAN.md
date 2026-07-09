# Landing Page Architecture Plan — JobWeMet

> Status: **Research & Planning only.** No components implemented, no packages
> installed, no frontend modified. This document is the blueprint for the
> implementation phase that follows.

---

## 1. Design Language (extracted from UI UX Pro Max + 21st.dev research)

Source philosophy: `nextlevelbuilder/ui-ux-pro-max-skill` is the design North Star;
21st.dev is the component source. We adapt the *language*, never copy code.

- **Typography** — One neutral sans (Geist, already loaded). Tight tracking on
  large headings (`tracking-tight`), relaxed line-height on body. Clear scale:
  hero `text-5xl/6xl`, section titles `text-3xl/4xl`, body `text-base/lg`.
  Muted secondary text via `text-muted-foreground`.
- **Spacing** — 8px base grid. Sections breathe: vertical rhythm of
  `py-20`–`py-32` (`~96px`–`~128px`). Consistent gutter (`px-6`).
- **Grid** — Centered max-width container `max-w-[1280px]`. 12-column mental
  model; hero and feature layouts use 2-col → 1-col collapse.
- **Section hierarchy** — Navbar → Hero → Stats (proof) → Features → How It Works
  → Testimonials → CTA → Footer. Logical trust-building order.
- **Card hierarchy** — Container card: `rounded-2xl border border-border
  bg-card` + `shadow-sm`, lifting to `shadow-md` on hover. Inner content uses
  whitespace, not borders, to separate.
- **Premium SaaS feel** — Generous white space, monochrome accent (`primary` =
  near-black in our neutral theme), single restrained accent per section,
  no decoration for decoration's sake.
- **Micro-interactions** — Subtle only: hover shadow/translate, focus-visible
  rings, fade/translate-in on scroll (CSS, IntersectionObserver — no
  framer-motion, which is **not installed**).
- **Explicitly avoided** — glassmorphism, neon, heavy gradients, crypto style,
  over-designed startup templates.

---

## 2. Current State Assessment

The **Landing Page Foundation** (from the prior phase) already exists and is
committed on `develop`:

- `src/components/landing/Navbar.tsx` — sticky 72px nav, transparent→blur on
  scroll, mobile drawer. Solid, accessible.
- `src/components/landing/Hero.tsx` + `HeroBadge.tsx` + `HeroButtons.tsx` +
  `HeroVisual.tsx` — two-column hero with a mock dashboard visual.
- `src/pages/Landing/LandingPage.tsx` — assembles `<Navbar/>` + `<Hero/>`.

**Assessment:** It is a competent *first pass*, but it was built **before** the
design language was extracted and **before** any 21st.dev research. Gaps:

1. Missing 6 required sections (Stats, Features, How It Works, Testimonials,
   CTA, Footer).
2. No unified premium system (e.g., Tailark-style) — the hero visual is
   acceptable but not yet at the researched bar.
3. Micro-interactions and responsive polish are minimal.
4. No shared layout primitives (Section/Container/SectionHeading), so the new
   sections would drift in style.

It is a prototype, not the reference. **Decision: PARTIAL REFACTOR.**

---

## 3. Migration Strategy — PARTIAL REFACTOR

**Keep the foundation's architecture and infra; elevate the 5 existing components
to the researched premium patterns; add the 6 missing sections.**

- **Keep** the `components/landing/` convention, the assembler `LandingPage`,
  shadcn `Button`, `cn` util, and all design tokens/theme. These are correct and
  must not be touched (also protected by the "do not modify" constraints).
- **Rewrite** the 5 existing landing components so they match the researched
  component patterns and sit on shared primitives. This is refinement, not
  deletion of intent.
- **Add** 6 new sections on top of shared primitives.

### 3.1 Components To Keep (as-is / near-as-is)
| File | Reason |
|------|--------|
| `src/components/ui/button.tsx` (shadcn) | Correct, accessible, theme-aware. Reuse everywhere. |
| `src/lib/utils.ts` (`cn`) | Foundation for all class composition. |
| `src/styles/theme.css`, `src/index.css` | Design tokens; neutral base is the premium monochrome we want. |
| `src/constants/theme.ts`, `src/config/design.ts` | App-level constants. |
| `src/components/landing/` folder + assembler pattern | Right structure; extend, don't replace. |
| Firebase / Auth / Routing / Protected routes | Out of scope; untouched per constraints. |

### 3.2 Components To Replace / Rewrite
| File | Action | Reason |
|------|--------|--------|
| `Navbar.tsx` | **Refine** to `originui` nav-menu pattern | Add clearer active states, keyboard-complete drawer, consistent with researched premium nav; current is good but pre-research. |
| `Hero.tsx` | **Elevate** toward `tailark` hero pattern | Stronger typographic hierarchy, better two-col balance, scroll-reveal. |
| `HeroBadge.tsx` | **Keep** (minor polish) | Already matches the minimal badge pattern. |
| `HeroButtons.tsx` | **Keep** (minor polish) | Already correct shadcn usage. |
| `HeroVisual.tsx` | **Refine** toward `tailark` dashboard aesthetic | Make the mock dashboard tighter, more "product screenshot" credible, less hand-rolled. |
| `LandingPage.tsx` | **Rewrite assembler** | Expand to full 8-section order with shared `<Section>` wrappers. |

> No files are *deleted* — the prototype components are rewritten in place.
> Reason: deleting working, accessible code is wasteful churn; the value is in
> *raising the bar* to the researched standard, not starting over.

---

## 4. 21st.dev MCP Components Selected

All discovered via the connected 21st.dev MCP (`@21st-dev/cli search`, API key
authenticated). Selection prioritized **minimal / premium / professional /
modern / white-space / rounded / clean / responsive** and excluded glassmorphism,
neon, over-designed, and crypto styles.

| # | Section | Selected Component | Author | id | URL | Why selected |
|---|---------|-------------------|--------|----|-----|--------------|
| 1 | Navigation | **Navigation Bar** | `originui` | 3379 | 21st.dev/@originui/components/navigation-menu-4 | Clean, professional shadcn-style nav; perfect keyboard/drawer behavior; no flashy effects. (Alt: `shadcnui-blocks` Default Navigation Menu 18139) |
| 2 | Hero | **Hero Section 9** | `tailark` | 1817 | 21st.dev/@meschacirung/components/hero-section-9 | Tailark is the gold standard for premium minimal SaaS heroes; strong hierarchy, white space, rounded. (Alts: `uimix` Hero Minimalism 6999, `reapollo` Minimal Hero 8328) |
| 3 | Feature Grid | **Feature Section with Grid** | `tommyjepsen` | 1494 | 21st.dev/@tommyjepsen/components/feature-section-with-grid | Balanced 6-card responsive grid, clean spacing, reusable card pattern. (Alt: `lavikatiyar` Feature Grid 8377) |
| 4 | Statistics | **Stats** | `tailark` | 5447 | 21st.dev/@meschacirung/components/stats | Minimal horizontal stat row, no decoration, large numerals, muted labels. (Alt: `tommyjepsen` Stats Section with Text 1195) |
| 5 | Timeline (How It Works) | **Process Timeline** | `YoucefBnm` | 1943 | 21st.dev/@youcefbnm/components/process-timeline | Exactly a connected 4-step process timeline; elegant connectors. (Alts: `reui` Stepper 3733, `anubra266` Steps 6087) |
| 6 | Testimonials | **Testimonials** | `tailark` | 4702 | 21st.dev/@meschacirung/components/testimonials | Premium minimal cards, avatar + name + role + quote; no fake logos. (Alts: `prebuiltui` Testimonial 7343, `reapollo` Testimonials 5461) |
| 7 | CTA | **Call to Action (cta-01)** | `felipemenezes098` | 18475 | 21st.dev/@felipemenezes098/components/cta-01 | Clean centered CTA, primary-brand background, rounded, generous spacing. (Alt: `joshosullivan-au` CTACard 14469). Excluded: `OrcDev` 8bit (over-designed), `YoucefBnm` gallery (heavy). |
| 8 | Footer | **Footer** | `tailark` | 4711 | 21st.dev/@meschacirung/components/footer | Professional multi-column SaaS footer: logo, description, nav columns, social icons, copyright. (Alts: `nevsky118` Footer 646, `reapollo` Footer 5473) |

> Tailark dominates Hero/Stats/Testimonials/Footer → guarantees one coherent
> premium-minimal design language across the page (Linear/Vercel/Clerk feel).

---

## 5. Component Hierarchy

```
LandingPage
├── Navbar                      (originui nav pattern)
└── <main>
    ├── Hero                   (tailark hero)
    │   ├── HeroBadge
    │   ├── HeroButtons
    │   └── HeroVisual
    ├── StatsSection           (tailark stats)
    ├── FeaturesSection        (tommyjepsen grid)
    │   └── FeatureCard ×6
    ├── HowItWorks             (YoucefBnm process timeline)
    │   └── StepCard ×4
    ├── Testimonials           (tailark testimonials)
    │   └── TestimonialCard ×3
    ├── CTASection             (felipemenezes098 cta-01)
    └── Footer                 (tailark footer)
```

### Shared primitives (new, internal — not from 21st.dev)
- `Section` — consistent `max-w-[1280px]` container + vertical padding + optional
  `id` for anchor nav.
- `SectionHeading` — eyebrow + title + subtitle block reused by Features /
  How It Works / Testimonials.
- `Container` — the `mx-auto max-w-[1280px] px-6` wrapper.

---

## 6. Landing Page Hierarchy (scroll order)

1. **Navbar** — sticky, transparent→blur, links + Login/Get Started, drawer <768px
2. **Hero** — badge, H1, two subtitles, CTAs, mock-dashboard visual
3. **Stats** — 4 stats: 15,000+ students, 2,500+ roles, 850+ skills, 96% matches
4. **Features** — 6 cards: AI Skill Analysis, Career Prediction, Skill Gap
   Analysis, Job Matching, Learning Roadmaps, Course Recommendations
5. **How It Works** — 4 steps: Upload Resume → AI extracts skills → Get Career
   Intelligence → Start Learning
6. **Testimonials** — 3 placeholder cards (avatar, name, role, feedback)
7. **CTA** — "Ready to Build Your Future?" + Start Free / Learn More
8. **Footer** — logo, description, nav/company/resources columns, social (GitHub,
   LinkedIn, Twitter), copyright, Privacy/Terms

---

## 7. Reusable Components

- `FeatureCard` — icon + title + description; hover lift; reused later inside the
  Dashboard per the earlier spec ("suitable for reuse inside Dashboard").
- `StepCard` — number + icon + title + description; timeline connector.
- `TestimonialCard` — avatar placeholder + name + role + quote.
- `Section` / `SectionHeading` / `Container` — layout primitives eliminating
  style drift across the 6 new sections.

---

## 8. Folder Structure (after migration)

```
frontend/src/
├── components/
│   ├── landing/
│   │   ├── Navbar.tsx              (refined)
│   │   ├── Hero.tsx                (elevated)
│   │   ├── HeroBadge.tsx           (kept)
│   │   ├── HeroButtons.tsx         (kept)
│   │   ├── HeroVisual.tsx          (refined)
│   │   ├── StatsSection.tsx        (new)
│   │   ├── FeaturesSection.tsx     (new)
│   │   ├── FeatureCard.tsx         (new, reusable)
│   │   ├── HowItWorks.tsx          (new)
│   │   ├── StepCard.tsx            (new)
│   │   ├── Testimonials.tsx        (new)
│   │   ├── TestimonialCard.tsx     (new)
│   │   ├── CTASection.tsx          (new)
│   │   └── Footer.tsx              (new)
│   └── ui/  (shadcn Button — unchanged)
├── pages/Landing/
│   └── LandingPage.tsx             (rewritten assembler)
└── ... (design system, firebase, auth, router — unchanged)
```

---

## 9. Files To Be Created (implementation phase)
- `StatsSection.tsx`
- `FeaturesSection.tsx`
- `FeatureCard.tsx`
- `HowItWorks.tsx`
- `StepCard.tsx`
- `Testimonials.tsx`
- `TestimonialCard.tsx`
- `CTASection.tsx`
- `Footer.tsx`
- (internal primitives `Section.tsx` / `SectionHeading.tsx` / `Container.tsx`
  if extracted)

## 10. Files To Be Modified (implementation phase)
- `LandingPage.tsx` — assemble all 8 sections.
- `Navbar.tsx`, `Hero.tsx`, `HeroVisual.tsx` — refined to researched patterns.

---

## 11. Expected User Experience
A visitor lands on a calm, confident hero explaining "AI Career Intelligence,"
sees credible proof stats, scans six clear capability cards, follows a 4-step
"how it works" timeline, reads three short testimonials, hits a strong brand CTA,
and finds a tidy footer. Everything is monochrome-premium, generously spaced, and
fully responsive (stacks cleanly at tablet/mobile). Keyboard and screen-reader
users navigate without friction.

## 12. Animation Ideas (subtle, CSS-only — no framer-motion)
- Hover: card `shadow-sm`→`shadow-md` + `translate-y-[-2px]`, 200ms ease.
- Focus: visible `focus-visible:ring` on all interactive elements.
- Scroll reveal: `opacity-0 translate-y-4` → `opacity-100 translate-y-0` via
  IntersectionObserver toggling a class (respect `prefers-reduced-motion`).
- Stat numbers: static (per spec) unless a tiny count-up is trivial; default
  static to avoid flashy motion.
- Navbar: background/blur transition on scroll (already implemented).

## 13. Accessibility Notes
- Single `h1` (hero); one `h2` per section; `h3` for cards.
- Semantic landmarks: `<header>`/`<nav>`, `<main>`, `<section>` with
  `aria-labelledby`, `<footer>`.
- Mobile drawer: `role="dialog"` `aria-modal`, focus trap, `Escape` to close,
  `aria-expanded` on the toggle, `aria-controls`.
- Decorative SVGs `aria-hidden`. Progress bars use `role="progressbar"`.
- Color contrast meets WCAG AA (neutral theme already compliant).
- Icons from Lucide only; each interactive control has an accessible name.

## 14. Performance Notes
- Reusable `FeatureCard`/`StepCard`/`TestimonialCard` eliminate duplication.
- No new runtime dependencies (no framer-motion). Animations are CSS +
  one tiny IntersectionObserver hook.
- Keep sections as plain components (React.lazy only if bundle grows; not
  needed at this size).
- `lucide-react` tree-shakes per-icon imports.

---

## 15. Estimated Implementation Phases
1. **Primitives** — `Section` / `SectionHeading` / `Container`.
2. **Refine foundation** — Navbar, Hero, HeroVisual to researched patterns.
3. **Stats + Features** — `StatsSection`, `FeaturesSection` + `FeatureCard`.
4. **How It Works** — `HowItWorks` + `StepCard` (timeline connectors).
5. **Testimonials + CTA + Footer** — cards, CTASection, Footer.
6. **Assemble & polish** — rewrite `LandingPage.tsx`, add scroll-reveal, run
   `npm run build` + `npm run lint`, commit.

> This plan deliberately does **not** include code. Implementation follows in a
> separate phase after sign-off.
