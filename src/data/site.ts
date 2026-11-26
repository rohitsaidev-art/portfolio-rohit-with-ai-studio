export interface Capability {
  id: string;
  name: string;
  summary: string;
  focus: string;
}

export interface CollaborationContext {
  title: string;
  scope: string;
  description: string;
}

export interface ExperimentItem {
  id: string;
  title: string;
  year: string;
  discipline: string;
  summary: string;
  notes: string;
  stack: string;
}

export interface SocialLink {
  label: string;
  href: string;
  handle: string;
}

export interface PhilosophyPrinciple {
  index: string;
  title: string;
  body: string;
}

/**
 * Centralized editable profile and site content.
 * Update copy, contact details, or availability here without touching page layouts.
 */
export const SITE_CONFIG = {
  name: 'Aarav Sen',
  roleTitle: 'Independent UX & Product Designer',
  location: 'Bengaluru, India · Working globally',
  availabilityShort: 'Available for Q1 2027',
  availabilityFull: 'Currently booking select product and web design collaborations for early 2027.',
  email: 'hello@aaravsen.design',
  responseTime: 'Usually replies within two business days.',
  hero: {
    headline: 'Designing thoughtful digital products, from first concept to final interaction.',
    intro:
      'I partner with founders, product teams, and engineers to shape clear interfaces, resilient design systems, and tactile web experiences.',
    primaryCta: 'Explore selected work',
    secondaryCta: 'Get in touch',
  },
  aboutPreview: {
    heading: 'Design as clarity, structure, and restraint.',
    paragraphs: [
      'My work sits between product architecture and interaction craft. Before touching visual styling, I spend time untangling how a system behaves—where people hesitate, what information earns attention, and how small transitions make complex tools feel calm.',
      'Across web platforms, experimental interfaces, and enterprise workflows, I care about details that rarely announce themselves: legible typographic hierarchy, dependable component foundations, and motion that responds like a physical object rather than an ornament.',
    ],
    ctaLabel: 'Read more about my practice',
  },
  contactClosing: {
    heading: 'Have a product taking shape?',
    body: 'Whether you are defining a zero-to-one interface, refining an existing product workflow, or building an interactive web experience, I would be glad to hear what you are working on.',
  },
  socials: [
    { label: 'LinkedIn', href: 'https://linkedin.com', handle: '/in/aaravsen' },
    { label: 'X / Twitter', href: 'https://x.com', handle: '@aaravsen_ux' },
    { label: 'Read.cv', href: 'https://read.cv', handle: 'read.cv/aaravsen' },
    { label: 'GitHub', href: 'https://github.com', handle: 'github.com/aaravsen' },
  ] as SocialLink[],
};

export const CAPABILITIES: Capability[] = [
  {
    id: 'ux-design',
    name: 'UX Design',
    summary: 'Information architecture, user flows, and workflow simplification for complex software.',
    focus: 'Discovery & Architecture',
  },
  {
    id: 'product-design',
    name: 'Product Design',
    summary: 'End-to-end feature definition spanning early exploration through engineering handoff.',
    focus: '0 → 1 & Iteration',
  },
  {
    id: 'ui-design',
    name: 'UI Design',
    summary: 'Quiet visual hierarchy, disciplined typography, and light-first surface craftsmanship.',
    focus: 'Visual Systems',
  },
  {
    id: 'interaction-design',
    name: 'Interaction Design',
    summary: 'Responsive micro-interactions, deliberate timing curves, and physical state transitions.',
    focus: 'Motion & Feedback',
  },
  {
    id: 'web-design',
    name: 'Web Design',
    summary: 'Editorial marketing websites, product launches, and narrative-driven digital flagships.',
    focus: 'Editorial Web',
  },
  {
    id: 'framer-development',
    name: 'Framer Development',
    summary: 'Production builds in Framer with custom interactions, responsive grids, and clean CMS architecture.',
    focus: 'Interactive Publishing',
  },
  {
    id: 'design-systems',
    name: 'Design Systems',
    summary: 'Scalable token foundations, accessible component libraries, and practical documentation.',
    focus: 'Foundations',
  },
  {
    id: 'prototyping',
    name: 'Prototyping',
    summary: 'Interactive Figma and code prototypes built to test real timing, edge cases, and usability.',
    focus: 'Validation',
  },
];

export const COLLABORATION_CONTEXTS: CollaborationContext[] = [
  {
    title: 'Early-stage founders',
    scope: '0 → 1 Product Definition',
    description:
      'Translating rough product theses into coherent interaction models, clickable prototypes, and launch-ready core flows.',
  },
  {
    title: 'Engineering-led teams',
    scope: 'Systems & Craft Elevation',
    description:
      'Working directly inside pull requests and component libraries to align visual polish, accessibility, and interaction feel.',
  },
  {
    title: 'Independent studios & R&D labs',
    scope: 'Experimental & Editorial Work',
    description:
      'Exploring unfamiliar input modalities, gesture interfaces, and narrative web experiences where off-the-shelf UI patterns fall short.',
  },
];

export const EXPERIMENTS: ExperimentItem[] = [
  {
    id: 'optical-shadow-study',
    title: 'Optical Shadow Layering Study',
    year: '2026',
    discipline: 'CSS & Surface Craft',
    summary: 'A small calibration bench for composing multi-layer contact and ambient light shadows on light surfaces.',
    notes:
      'Standard single-layer box shadows flatten elevation hierarchy. This exploration tests three-stop luminance curves—tight contact darkening paired with wide atmospheric diffusion—so surfaces read naturally on high-density displays.',
    stack: 'CSS Custom Properties · TypeScript',
  },
  {
    id: 'spring-interruptibility',
    title: 'Interruptible Sheet Physics',
    year: '2026',
    discipline: 'Interaction Study',
    summary: 'Comparing velocity-preserving spring transitions against fixed-duration bezier curves during rapid gesture cancellation.',
    notes:
      'Focused on what happens when a user changes their mind mid-transition. Preserving pointer velocity on release eliminates the mechanical stall common in duration-based drawers.',
    stack: 'Motion · Pointer Events',
  },
  {
    id: 'spatial-audio-index',
    title: 'Tactile Waveform Scrubber',
    year: '2025',
    discipline: 'Audio UI Exploration',
    summary: 'Minimalist acoustic timeline exploration built around subtle haptic-like visual resistance at chapter boundaries.',
    notes:
      'Tested how restrained visual density—hairline amplitude bars and tabular timecodes—can make audio navigation legible without resorting to neon spectrum visualizers.',
    stack: 'Web Audio API · Canvas',
  },
  {
    id: 'mudra-latency-bench',
    title: 'Webcam Gesture Debounce Notes',
    year: '2025',
    discipline: 'Computer Vision UX',
    summary: 'Interface patterns for communicating hand-tracking confidence and lighting drift without breaking immersion.',
    notes:
      'Born alongside The Curse of the Mudradhaar. Explores calm peripheral feedback cues when hand landmarks momentarily occlude or drop below recognition confidence.',
    stack: 'MediaPipe · React',
  },
];

export const ABOUT_CONTENT = {
  eyebrow: 'About',
  headline: 'Thoughtful interfaces come from paying attention to how people actually work.',
  lead: 'I am an independent UX and product designer focused on software clarity, interactive systems, and editorial web craft. My background spans product workflows, interactive prototyping, and front-end implementation—allowing me to stay close to the finished experience rather than handing off static artifacts.',
  storyParagraphs: [
    'Good digital products rarely feel loud. The tools we return to every day earn trust through predictable structure, honest typography, and interactions that respond immediately without getting in the way.',
    'Over the course of independent projects and product collaborations, I have worked across varied domains—from event logistics and enterprise trust tooling to music discovery and camera-driven gesture play. Switching contexts keeps my assumptions honest: every domain teaches a different lesson about cognitive load, speed, and restraint.',
    'Because I prototype directly in code alongside Figma and Framer, I treat layout rhythm, responsive behavior, and motion physics as core design materials rather than engineering afterthoughts.',
  ],
  philosophy: [
    {
      index: '01',
      title: 'Clarity before decoration',
      body: 'Every border, surface shift, and label should clarify hierarchy or state. If removing an element makes a screen calmer without losing meaning, it should be removed.',
    },
    {
      index: '02',
      title: 'Systems that hold up under real data',
      body: 'Clean mockups are easy with curated text. I design for long names, empty states, error recovery, narrow viewports, and keyboard navigation from the beginning.',
    },
    {
      index: '03',
      title: 'Motion as spatial explanation',
      body: 'Animation should help someone understand where an element came from and what just changed. Fast, interruptible transitions respect attention far more than theatrical flourishes.',
    },
    {
      index: '04',
      title: 'Close collaboration with engineering',
      body: 'Design finishes when the shipped build feels right in a browser. Sharing token naming, edge-case specs, and interactive prototypes removes translation loss.',
    },
  ] as PhilosophyPrinciple[],
  tools: [
    {
      group: 'Design & Systems',
      items: ['Figma', 'Variables & Design Tokens', 'Interactive Prototyping', 'Editorial Typography'],
    },
    {
      group: 'Web & Motion',
      items: ['Framer', 'React & TypeScript', 'Tailwind CSS', 'Motion (Framer Motion)'],
    },
    {
      group: 'Exploration & Research',
      items: ['Usability Testing', 'Information Architecture', 'Web Audio & MediaPipe', 'Accessibility Audits'],
    },
  ],
  interests: [
    'Industrial design monographs and Dieter Rams product archives',
    'Acoustic audio hardware and tactile physical controls',
    'Independent type foundries and book typography',
    'Walking photography and quiet architectural spaces',
  ],
};
