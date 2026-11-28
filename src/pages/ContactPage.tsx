import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SITE_CONFIG } from '../data/site';
import { ArrowUpRight, ChevronDown, Copy } from 'lucide-react';
import { AnimatedCheckIcon, AnimatedSendIcon } from '../components/icons/AnimatedLucide';
import {
  validateContactForm,
  type ContactFormValues,
} from '../utils/portfolio';
import { LocalTimeClock } from '../components/LocalTimeClock';
import { EASE_APPLE } from '../utils/motion';
import { prefersReducedMotion } from '../utils/scroll';
import { playSuccessChime, playTap, playTick } from '../utils/soundEngine';
import { showToast } from '../utils/toast';

const PROJECT_TYPES = [
  'Product Design',
  'UX Architecture',
  'Web & Framer',
  'Design System',
  'Advisory / Prototype',
];

const INITIAL_FORM: ContactFormValues = {
  name: '',
  email: '',
  projectType: 'Product Design',
  timeline: 'Flexible / Exploratory',
  message: '',
};

export function ContactPage() {
  const [values, setValues] = useState<ContactFormValues>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<ContactFormValues | null>(null);
  const [copied, setCopied] = useState(false);
  const confirmationHeadingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (submittedRecord) {
      window.requestAnimationFrame(() => {
        confirmationHeadingRef.current?.focus();
      });
    }
  }, [submittedRecord]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE_CONFIG.email);
      playSuccessChime();
      setCopied(true);
      showToast({ message: `Copied ${SITE_CONFIG.email}`, tone: 'success' });
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleChange = (field: keyof ContactFormValues, nextValue: string) => {
    setValues((prev) => ({ ...prev, [field]: nextValue }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const result = validateContactForm(values);

    if (!result.isValid) {
      playTap();
      setErrors(result.errors);
      const firstInvalidField = result.errors.name
        ? 'contact-name'
        : result.errors.email
          ? 'contact-email'
          : result.errors.message
            ? 'contact-message'
            : null;
      if (firstInvalidField) {
        window.requestAnimationFrame(() => {
          document.getElementById(firstInvalidField)?.focus();
        });
      }
      return;
    }

    setErrors({});
    if (prefersReducedMotion()) {
      playSuccessChime();
      setSubmittedRecord(values);
      showToast({ message: 'Inquiry prepared', tone: 'success' });
      return;
    }

    setIsSubmitting(true);
    const snapshot = { ...values };
    window.setTimeout(() => {
      playSuccessChime();
      setIsSubmitting(false);
      setSubmittedRecord(snapshot);
      showToast({ message: 'Inquiry prepared', tone: 'success' });
    }, 180);
  };

  return (
    <div className="bg-[var(--apple-bg-secondary)]">
      <section className="mx-auto max-w-[1160px] px-5 pb-28 pt-12 sm:px-8 sm:pt-16">
        <div>
          <p className="type-eyebrow text-[var(--apple-link)]">
            Contact
          </p>
          <h1 className="type-title-1 measure-title mt-3">
            Let’s talk about what you are building.
          </h1>
          <p className="type-lead measure-lead mt-5">
            Share a few lines about the product, timeline, or question on your mind. {SITE_CONFIG.responseTime}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Elevated Inquiry Sheet */}
          <div className="lg:col-span-7">
            {submittedRecord ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, ease: EASE_APPLE }}
                className="apple-card-static rounded-[20px] p-8 sm:p-10"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--apple-blue)]/10 text-[var(--apple-blue)]">
                  <AnimatedCheckIcon size={20} />
                </div>

                <h2
                  ref={confirmationHeadingRef}
                  tabIndex={-1}
                  className="type-title-3 mt-5 focus:outline-none"
                >
                  Inquiry prepared, {submittedRecord.name}.
                </h2>
                <p className="type-callout mt-2.5">
                  Thank you for reaching out regarding{' '}
                  <span className="font-semibold text-[var(--apple-label-primary)]">
                    {submittedRecord.projectType}
                  </span>
                  . Your note has been logged locally in this preview—you can open it directly in your email client or send another message below.
                </p>

                <dl className="mt-6 space-y-2.5 border-t border-[var(--apple-separator)] pt-5 text-[15px]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--apple-label-tertiary)]">Reply-to</dt>
                    <dd className="font-medium text-[var(--apple-label-primary)]">{submittedRecord.email}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--apple-label-tertiary)]">Timeline</dt>
                    <dd className="font-medium text-[var(--apple-label-primary)]">{submittedRecord.timeline}</dd>
                  </div>
                </dl>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={`mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent(
                      `${submittedRecord.projectType} inquiry from ${submittedRecord.name}`,
                    )}&body=${encodeURIComponent(submittedRecord.message)}`}
                    className="apple-btn-primary"
                  >
                    <span>Open in Mail</span>
                    <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedRecord(null);
                      setValues(INITIAL_FORM);
                    }}
                    className="apple-btn-tonal"
                  >
                    Send another note
                  </button>
                </div>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="apple-card-static rounded-[20px] p-7 sm:p-9"
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="type-footnote block text-[var(--apple-label-primary)]"
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      disabled={isSubmitting}
                      value={values.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Your name"
                      aria-required="true"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'contact-name-error' : undefined}
                      className="apple-input mt-2 min-h-[46px] rounded-[14px] px-4 py-2.5 text-[15.5px]"
                    />
                    {errors.name && (
                      <p
                        id="contact-name-error"
                        role="alert"
                        className="type-footnote mt-1.5 text-[var(--apple-error)]"
                      >
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="type-footnote block text-[var(--apple-label-primary)]"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      disabled={isSubmitting}
                      value={values.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="you@company.com"
                      aria-required="true"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                      className="apple-input mt-2 min-h-[46px] rounded-[14px] px-4 py-2.5 text-[15.5px]"
                    />
                    {errors.email && (
                      <p
                        id="contact-email-error"
                        role="alert"
                        className="type-footnote mt-1.5 text-[var(--apple-error)]"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rounded iOS Project Type Selector */}
                <div className="mt-6">
                  <span className="type-footnote block text-[var(--apple-label-primary)]">
                    What can I help with?
                  </span>
                  <div
                    role="group"
                    aria-label="Project engagement type"
                    className="mt-2.5 flex flex-wrap gap-2"
                  >
                    {PROJECT_TYPES.map((type) => {
                      const active = values.projectType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          disabled={isSubmitting}
                          aria-pressed={active}
                          onClick={() => {
                            if (!active) {
                              playTick();
                              handleChange('projectType', type);
                            }
                          }}
                          className={`apple-segmented-item min-h-[44px] sm:min-h-[38px] px-4 py-1.5 text-[13.5px] ${
                            active
                              ? 'bg-[var(--editorial-btn-bg)] text-[var(--editorial-btn-fg)]'
                              : 'bg-[var(--apple-bg-secondary)] text-[var(--apple-label-secondary)] hover:bg-[var(--apple-control-tonal)] hover:text-[var(--apple-label-primary)]'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                  {errors.projectType && (
                    <p role="alert" className="type-footnote mt-1.5 text-[var(--apple-error)]">
                      {errors.projectType}
                    </p>
                  )}
                </div>

                {/* Timeline */}
                <div className="mt-6">
                  <label
                    htmlFor="contact-timeline"
                    className="type-footnote block text-[var(--apple-label-primary)]"
                  >
                    Expected timeline
                  </label>
                  <div className="relative mt-2">
                    <select
                      id="contact-timeline"
                      name="timeline"
                      disabled={isSubmitting}
                      value={values.timeline}
                      onChange={(e) => handleChange('timeline', e.target.value)}
                      className="apple-input min-h-[46px] appearance-none rounded-[14px] py-2.5 pl-4 pr-10 text-[15.5px]"
                    >
                      <option value="Flexible / Exploratory">Flexible / Exploratory</option>
                      <option value="Within 1 month">Within 1 month</option>
                      <option value="Next 1–3 months">Next 1–3 months</option>
                      <option value="Q2 2027 or later">Q2 2027 or later</option>
                    </select>
                    <ChevronDown
                      size={15}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--apple-label-secondary)]"
                    />
                  </div>
                </div>

                {/* Project Brief */}
                <div className="mt-6">
                  <label
                    htmlFor="contact-message"
                    className="type-footnote block text-[var(--apple-label-primary)]"
                  >
                    Project context
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    disabled={isSubmitting}
                    value={values.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="Tell me a little about the problem space, goals, and what success looks like..."
                    aria-required="true"
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    className="apple-input mt-2 rounded-[16px] px-4 py-3 text-[15.5px] leading-[1.55]"
                  />
                  {errors.message && (
                    <p
                      id="contact-message-error"
                      role="alert"
                      className="type-footnote mt-1.5 text-[var(--apple-error)]"
                    >
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    data-loading={isSubmitting ? 'true' : undefined}
                    className="apple-btn-primary"
                  >
                    {isSubmitting ? (
                      <span className="apple-spinner" aria-hidden="true" />
                    ) : (
                      <AnimatedSendIcon size={15} />
                    )}
                    <span>{isSubmitting ? 'Preparing inquiry…' : 'Send inquiry'}</span>
                  </button>
                  <p className="type-footnote font-normal text-[var(--apple-label-tertiary)]">
                    {SITE_CONFIG.responseTime}
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Open Hairline-Divided Direct Contact Details */}
          <aside className="divide-y divide-[var(--apple-separator)] border-t border-[var(--apple-separator)] lg:col-span-5">
            <div className="py-7">
              <p className="type-caption text-[var(--apple-label-tertiary)]">Direct email</p>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="type-title-3 mt-2 block transition-colors hover:text-[var(--apple-link)]"
              >
                {SITE_CONFIG.email}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="apple-btn-tonal mt-5 !min-h-[44px] sm:!min-h-[38px] !px-4 !py-1.5 !text-[13.5px]"
              >
                {copied ? (
                  <>
                    <AnimatedCheckIcon size={14} className="text-[var(--apple-blue)]" />
                    <span>Copied to clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} strokeWidth={1.75} className="text-[var(--apple-label-secondary)]" aria-hidden="true" />
                    <span>Copy email address</span>
                  </>
                )}
              </button>
            </div>

            <div className="py-7">
              <p className="type-caption text-[var(--apple-label-tertiary)]">Availability</p>
              <p className="type-headline font-display mt-2 inline-flex items-center gap-2 text-[19px]">
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-[var(--editorial-accent-warm)]"
                  aria-hidden="true"
                />
                <span>{SITE_CONFIG.availabilityShort}</span>
              </p>
              <p className="type-callout mt-2">
                {SITE_CONFIG.availabilityFull}
              </p>
              <p className="type-footnote mt-3 font-normal text-[var(--apple-label-tertiary)]">
                {SITE_CONFIG.location}
              </p>
              <LocalTimeClock variant="card" />
            </div>

            <div className="py-7">
              <p className="type-caption text-[var(--apple-label-tertiary)]">Elsewhere</p>
              <ul className="mt-4 space-y-3">
                {SITE_CONFIG.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between text-[15px] text-[var(--apple-label-secondary)] transition-colors hover:text-[var(--apple-label-primary)]"
                    >
                      <span className="font-medium text-[var(--apple-label-primary)]">{social.label}</span>
                      <span className="inline-flex items-center gap-1 text-[13.5px] text-[var(--apple-label-tertiary)] group-hover:text-[var(--apple-link)]">
                        <span>{social.handle}</span>
                        <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
