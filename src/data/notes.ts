export type NoteTopic =
  | 'Product Thinking'
  | 'Interaction Design'
  | 'UX & Systems'
  | 'Experimentation';

export interface JournalSection {
  id: string;
  num: string;
  heading: string;
  paragraphs: string[];
  callout?: string;
}

export interface JournalArticle {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  topic: NoteTopic;
  /**
   * Explicit publication status. Seed essays remain 'draft' until reviewed and
   * intentionally published by the portfolio owner.
   */
  status: 'draft' | 'published';
  updatedLabel: string;
  tags: string[];
  sections: JournalSection[];
}

export const NOTE_TOPICS: readonly NoteTopic[] = [
  'Product Thinking',
  'Interaction Design',
  'UX & Systems',
  'Experimentation',
] as const;

/**
 * Seed working essays for the Design Journal (/notes).
 * Every seed essay is explicitly marked status: 'draft' so unpublished working
 * notes are never presented as finished published articles or client projects.
 */
export const JOURNAL_NOTES: readonly JournalArticle[] = [
  {
    slug: 'calm-density-in-operational-software',
    title: 'Calm Density in Operational Software',
    subtitle:
      'Why dense professional tools feel overwhelming—and how spatial grouping, restrained color, and honest defaults restore clarity without hiding capability.',
    excerpt:
      'Operational tools rarely fail because they show too much information. They fail when every metric, status badge, and button shouts at the exact same visual volume.',
    topic: 'Product Thinking',
    status: 'draft',
    updatedLabel: 'Working draft',
    tags: ['Information Architecture', 'Enterprise UX', 'Visual Hierarchy'],
    sections: [
      {
        id: 'density-vs-noise',
        num: '01',
        heading: 'Density is not the enemy; undifferentiated noise is',
        paragraphs: [
          'When product teams redesign complex operational tools, the first instinct is often to strip fields away and wrap whatever survives inside oversized cards. That approach looks tidy in a slide deck, yet it usually slows down the people who rely on the tool every day.',
          'Experienced operators actually appreciate density when the page has predictable structure. What causes fatigue is not the number of data points on screen—it is forcing the eye to re-parse inconsistent typography, competing border weights, and saturated status pills on every row.',
        ],
        callout:
          'Quiet baselines make real exceptions unmistakable. When normal states sit calmly in neutral ink, a single escalation carries immediate weight.',
      },
      {
        id: 'spatial-anchors',
        num: '02',
        heading: 'Anchor workflows around a stable mental map',
        paragraphs: [
          'Whether someone is assigning physical exhibition stalls, reviewing trust signals, or tracking cultivation batches, orientation matters before action. Jumping between nested modals forces people to hold spatial context in short-term memory.',
          'Pairing a steady primary canvas—a floor grid, triage ledger, or stage timeline—with a predictable detail inspector lets users explore freely without ever wondering where they are in the system.',
        ],
      },
      {
        id: 'tabular-discipline',
        num: '03',
        heading: 'Let typography and alignment do the heavy lifting',
        paragraphs: [
          'Before adding another divider or shaded container, check whether spacing, tabular numerals, and clear weight contrast already solve the grouping problem. Every box you remove lowers visual friction across an eight-hour workday.',
          'Good operational design rarely announces itself with dramatic chrome. It earns trust quietly by making the next sensible decision obvious.',
        ],
      },
    ],
  },
  {
    slug: 'interruptible-motion-and-physical-trust',
    title: 'Interruptible Motion and Physical Trust',
    subtitle:
      'Notes on velocity-preserving springs, sub-200ms feedback budgets, and why interfaces feel calmer when animation explains rather than performs.',
    excerpt:
      'People rarely notice great interface motion directly. They notice its absence—the small stall when a drawer resists being closed mid-flight, or a sudden jump with no spatial cue.',
    topic: 'Interaction Design',
    status: 'draft',
    updatedLabel: 'Working draft',
    tags: ['Motion Physics', 'Micro-interactions', 'Accessibility'],
    sections: [
      {
        id: 'motion-as-explanation',
        num: '01',
        heading: 'Motion should answer a spatial question',
        paragraphs: [
          'Every transition in a product interface should answer a simple physical question: where did this come from, what just changed, and where did it go? When animation exists solely to decorate an arrival, it quickly feels sluggish on the tenth visit.',
          'Restrained easing curves that decelerate cleanly into place mimic real physical inertia. A fast start confirms immediately that the interface heard the gesture, while a composed settle avoids mechanical harshness.',
        ],
      },
      {
        id: 'interruptibility',
        num: '02',
        heading: 'Design for people changing their mind mid-gesture',
        paragraphs: [
          'Real interaction is messy. Visitors open a navigation menu and dismiss it halfway through, drag an audio scrubber across three chapters in a second, or switch filter tabs rapidly before the first transition finishes.',
          'Duration-locked choreography often traps the user for a fraction of a second while a previous animation unwinds. Spring-driven states and immediate pointer tracking preserve responsiveness even under rapid reversals.',
        ],
        callout:
          'Routine feedback belongs under 200ms. If a user feels they are waiting for an animation to finish before clicking again, the motion is too slow.',
      },
      {
        id: 'respecting-reduced-motion',
        num: '03',
        heading: 'Reduced motion is a baseline design mode, not an afterthought',
        paragraphs: [
          'Designing with prefers-reduced-motion from the start forces clarity. When sliding displacements and parallax offsets collapse cleanly to instant state switches or gentle opacity changes, the underlying layout hierarchy has to stand on its own.',
          'If a screen becomes confusing without animation, that is usually a signal that the layout needs stronger visual anchors rather than more motion.',
        ],
      },
    ],
  },
  {
    slug: 'designing-for-probabilistic-inputs',
    title: 'Designing for Probabilistic Inputs',
    subtitle:
      'Lessons from building webcam gesture interfaces: handling confidence thresholds, sensor jitter, and forgiving timing windows.',
    excerpt:
      'A mouse click is binary—either it fired or it did not. Camera vision, voice, and ambient sensors live on a continuous spectrum of certainty, which changes how feedback must work.',
    topic: 'Experimentation',
    status: 'draft',
    updatedLabel: 'Working draft',
    tags: ['Computer Vision UX', 'Prototyping', 'Input Modality'],
    sections: [
      {
        id: 'beyond-binary-clicks',
        num: '01',
        heading: 'Sensors whisper; interfaces need to translate honestly',
        paragraphs: [
          'When designing around real-time hand tracking or audio sampling, raw model output fluctuates frame by frame. Room lighting shifts, wrists rotate naturally, and brief occlusions happen even when the user is doing everything right.',
          'Exposing raw jitter directly makes the interface feel broken. Hiding uncertainty completely makes missed inputs feel arbitrary. The right middle ground is continuous, calm feedback that shows recognition building toward confirmation.',
        ],
      },
      {
        id: 'forgiveness-windows',
        num: '02',
        heading: 'Hold thresholds and debounce as ergonomic craft',
        paragraphs: [
          'A short lock-in window—roughly 250 to 300 milliseconds with a visible progressive indicator—transforms mid-air gestures from fragile tricks into deliberate actions. Players can pass through intermediate finger shapes naturally without triggering accidental casts.',
          'Equally important is designing fewer, unmistakably distinct poses rather than an ambitious catalog that collapses under real laptop webcams.',
        ],
        callout:
          'Prototype unfamiliar input modalities with real hardware latency as early as possible. Static mockups hide the exact friction that defines the experience.',
      },
      {
        id: 'graceful-recovery',
        num: '03',
        heading: 'Make recovery effortless when tracking drops',
        paragraphs: [
          'Permission prompts, framing calibration, and low-light warnings are not edge cases in camera-based products—they are the opening chapter of the user experience.',
          'Explaining clearly that processing runs locally in the browser and offering calm peripheral cues when hands drift out of frame preserves both trust and flow.',
        ],
      },
    ],
  },
  {
    slug: 'type-measure-and-reading-comprehension',
    title: 'Why Type Measure and Spacing Shape Comprehension',
    subtitle:
      'Practical observations on line length, dynamic type scales, and unboxed metadata in editorial product interfaces.',
    excerpt:
      'Before adjusting colors or adding visual flourishes, tightening line length and calibrating vertical rhythm often accounts for most of what makes a page feel composed.',
    topic: 'UX & Systems',
    status: 'draft',
    updatedLabel: 'Working draft',
    tags: ['Typography', 'Design Systems', 'Editorial Web'],
    sections: [
      {
        id: 'comfortable-measure',
        num: '01',
        heading: 'The quiet physics of a 60-character line',
        paragraphs: [
          'On wide desktop monitors, unconstrained paragraphs stretch effortlessly past 110 characters per line. As the eye finishes a line and sweeps back to the left edge, long horizontal travel introduces tiny tracking errors that compound into reading fatigue.',
          'Constraining narrative prose to roughly 58 to 68 characters—paired with generous line height around 1.6—gives long case studies and technical notes an immediate editorial calm.',
        ],
      },
      {
        id: 'unboxed-metadata',
        num: '02',
        heading: 'Keep metadata typographic instead of boxing every label',
        paragraphs: [
          'Wrapping every date, category, reading estimate, and tag inside a bordered capsule adds dozens of tiny rectangles that compete with the headline itself. Static metadata reads faster when set as quiet inline text separated by typographic mid-dots.',
          'Reserve elevated containers and tactile pills strictly for controls a visitor can actually press, toggle, or filter.',
        ],
        callout:
          'When you remove decorative containers around static metadata, interactive controls become immediately easier to recognize.',
      },
      {
        id: 'vertical-rhythm',
        num: '03',
        heading: 'Proximity communicates structure faster than borders',
        paragraphs: [
          'A heading should sit noticeably closer to the paragraph it introduces than to the section that ended above it. Respecting that simple ratio lets readers scan an entire case study effortlessly without relying on heavy divider lines between every block.',
        ],
      },
    ],
  },
] as const;
