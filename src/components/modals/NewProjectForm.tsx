import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, ChevronLeft, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { submitLead, updateLeadSubmit, type Lead } from '../../lib/api';
import { PACKAGES } from '../../data/content';
import { SHOWCASE_TEMPLATES } from '../home/templates';
import CustomButton from '../ui/CustomButton';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 10;

const STEP_TITLES = [
  'Business Basics',
  'Location',
  'About Your Business',
  'Site Goal',
  'Pages Needed',
  'Branding',
  'Style Direction',
  'Inspiration',
  'Contact',
  'Package',
];

const SITE_GOALS = [
  'Get more phone calls / bookings',
  'Sell products online',
  'Showcase menu / services',
  'Build credibility / portfolio',
  'Collect leads / quote requests',
];

const PAGES = [
  'Home',
  'About',
  'Services / Menu',
  'Gallery / Portfolio',
  'Booking / Reservations',
  'Contact',
  'Shop / Store',
  'Blog',
];

// Style Direction step config. Each showcase template contributes aesthetic
// tags plus a preview recipe mirroring its real design DNA — font stacks,
// palette, corner shapes and copy tone — used to render sample components
// (text, button, badge, card) inside the browser-chrome mock. Fixed
// palettes/inline styles on purpose — same reason as the templates
// themselves: they must not be re-colored by the html.light utility remaps.
const RECIPE_TAGS: Record<string, string[]> = {
  rosalie:    ['Moody Bistro', 'Italic Serif', 'Forest & Terracotta', 'Dotted Menus'],
  harborview: ['Luxury Minimalist', 'Serif Typography', 'Cream & Charcoal', 'Wide Grids'],
  lumiere:    ['High-Fashion', 'Bold Typography', 'Blush & Black', 'Asymmetric Gallery'],
  ironcore:   ['Athletic Dark Mode', 'Condensed Type', 'Black & Neon', 'Sharp Cards'],
};

const PREVIEW_SERIF = 'Georgia, "Times New Roman", serif';
const PREVIEW_CONDENSED = '"Arial Narrow", "Helvetica Neue Condensed", ui-sans-serif, sans-serif';

interface TemplatePreview {
  bg: string; surface: string; border: string; heading: string; body: string;
  accent: string; accent2: string;
  headingFont: string; headingClass: string;
  buttonClass: string; buttonLabel: string; buttonText: string;
  cardClass: string; cardTitle: string; cardMeta: string; cardBody: string; cardLink: string;
  navLinks: [string, string];
  headline: string; bodyCopy: string;
}

const TEMPLATE_PREVIEWS: Record<string, TemplatePreview> = {
  // Bistro — moody forest green/terracotta, italic serif, candlelit.
  rosalie: {
    bg: '#1C2B23', surface: '#141F19', border: '#2E4034', heading: '#F2E9DC', body: '#9DB0A3',
    accent: '#C4602F', accent2: '#D97748',
    headingFont: PREVIEW_SERIF, headingClass: 'italic leading-tight',
    buttonClass: 'rounded-full px-5 py-2.5 text-sm font-semibold', buttonLabel: 'Reserve a Table', buttonText: '#F2E9DC',
    cardClass: 'rounded-xl', cardTitle: 'Duck Confit', cardMeta: '$34', cardBody: 'Crisped leg, puy lentils, cherry gastrique — dishes list with elegant dotted leaders.', cardLink: 'See the carte →',
    navLinks: ['Menu', 'Reservations'],
    headline: 'Dinner in the deep green', bodyCopy: 'Candlelight, old-world wine and plates that take their time.',
  },
  // Realty — luxury minimalist: cream/charcoal, square edges, wide-tracked caps.
  harborview: {
    bg: '#F5F1E8', surface: '#FAF8F3', border: '#E3DDCE', heading: '#26241F', body: '#8A8478',
    accent: '#26241F', accent2: '#A89F8C',
    headingFont: PREVIEW_SERIF, headingClass: 'leading-tight',
    buttonClass: 'px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em]', buttonLabel: 'View Portfolio', buttonText: '#F5F1E8',
    cardClass: 'rounded-none', cardTitle: '14 Marina Point', cardMeta: '$2.45M', cardBody: 'Five beds on the water, hairline-ruled and unhurried — the way a luxury listing should read.', cardLink: 'View listing →',
    navLinks: ['Portfolio', 'Contact'],
    headline: 'Quiet homes on loud water', bodyCopy: 'A small portfolio of exceptional coastal properties, sold well.',
  },
  // Salon — high-fashion editorial: blush/black, oversized caps, square edges.
  lumiere: {
    bg: '#F6E4DE', surface: '#EFD2C9', border: '#E2C7BD', heading: '#141011', body: '#6E5A56',
    accent: '#141011', accent2: '#8C6B62',
    headingFont: 'ui-sans-serif, system-ui, sans-serif', headingClass: 'font-black uppercase tracking-tight leading-[0.95]',
    buttonClass: 'px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.25em]', buttonLabel: 'Book a Chair', buttonText: '#F6E4DE',
    cardClass: 'rounded-none', cardTitle: 'Cut & Go', cardMeta: 'from $95', cardBody: 'Precision cut, glass gloss and an editorial blowout — services read as numbered rows.', cardLink: 'Full price list →',
    navLinks: ['Lookbook', 'Services'],
    headline: 'Hair is the outfit', bodyCopy: 'Cut, colour and finish — photographed, not just styled.',
  },
  // Gym — athletic dark mode: black/neon green, condensed caps, sharp cards.
  ironcore: {
    bg: '#070907', surface: '#10140F', border: '#1E241C', heading: '#F2F5EE', body: '#8A9385',
    accent: '#B4FF39', accent2: '#8BCC22',
    headingFont: PREVIEW_CONDENSED, headingClass: 'font-black uppercase tracking-tighter leading-[0.95]',
    buttonClass: 'rounded-sm px-5 py-3 text-xs font-black uppercase tracking-[0.2em]', buttonLabel: 'Start Free Week', buttonText: '#070907',
    cardClass: 'rounded-sm', cardTitle: 'Unlimited', cardMeta: '$99/mo', cardBody: 'All classes, open gym 24/7 and the recovery zone — plans render as sharp neon-edged cards.', cardLink: 'Choose plan →',
    navLinks: ['Programs', 'Membership'],
    headline: 'Earn every rep', bodyCopy: 'Iron, engine work and cold water. First week free.',
  },
};

const CONTACT_METHODS = ['Email', 'Phone', 'WhatsApp'];

const TIMELINES = [
  'ASAP (within a week)',
  'No rush (within a month)',
  'Just exploring',
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  businessName: string;
  businessType: string;
  message: string;
  hasExistingWebsite: boolean;
  existingWebsiteUrl: string;
  location: string;
  siteGoal: string;
  pagesNeeded: string[];
  styleDirection: string;
  hasLogo: boolean;
  logoFile: File | null;
  hasBrandColors: boolean;
  primaryColor: string;
  secondaryColor: string;
  inspirationUrl1: string;
  inspirationUrl2: string;
  phoneNumber: string;
  contactMethod: string;
  timeline: string;
  wantsCall: boolean;
  selectedPackage: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function isStepValid(step: number, form: FormState): boolean {
  switch (step) {
    case 1: return !!form.businessName.trim() && !!form.businessType.trim();
    case 2: return !!form.location.trim();
    case 3: return true;
    case 4: return !!form.siteGoal;
    case 5: return true;
    case 6: return true;
    case 7: return !!form.styleDirection;
    case 8: return true;
    case 9: return !!form.phoneNumber.trim() && !!form.contactMethod && !!form.timeline;
    case 10: return !!form.selectedPackage;
    default: return true;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-primary block mb-2">
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 p-4 font-light focus:border-brand-primary outline-none transition-colors rounded-xl text-white placeholder:text-white/25"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-white/5 border border-white/10 p-4 font-light focus:border-brand-primary outline-none transition-colors rounded-xl text-white placeholder:text-white/25 resize-none"
    />
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-white/10 w-fit">
      <CustomButton
        type="button"
        onClick={() => onChange(false)}
        variant="ghost"
        size="none"
        className={`px-6 py-3 text-xs uppercase tracking-widest transition-colors ${
          !value ? 'bg-brand-primary text-bg-base' : 'text-ink-muted hover:text-white'
        }`}
      >
        No
      </CustomButton>
      <CustomButton
        type="button"
        onClick={() => onChange(true)}
        variant="ghost"
        size="none"
        className={`px-6 py-3 text-xs uppercase tracking-widest transition-colors ${
          value ? 'bg-brand-primary text-bg-base' : 'text-ink-muted hover:text-white'
        }`}
      >
        Yes
      </CustomButton>
    </div>
  );
}

function OptionBtn({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <CustomButton
      type="button"
      onClick={onClick}
      variant="outline"
      size="none"
      className={`w-full py-2 px-5 rounded-xl text-left text-sm font-medium transition-all ${
        selected
          ? 'border-brand-primary bg-brand-primary/10 text-white'
          : 'border-white/10 text-ink-muted hover:border-white/30 hover:text-white'
      }`}
    >
      {children}
    </CustomButton>
  );
}

function CheckBtn({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <CustomButton
      type="button"
      onClick={onClick}
      variant="outline"
      size="none"
      className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all text-left ${
        selected
          ? 'border-brand-primary bg-brand-primary/10 text-white'
          : 'border-white/10 text-ink-muted hover:border-white/30 hover:text-white'
      }`}
    >
      <div
        className={`w-4 h-4 flex-shrink-0 rounded border flex items-center justify-center transition-colors ${
          selected ? 'bg-brand-primary border-brand-primary' : 'border-white/30'
        }`}
      >
        {selected && (
          <span className="text-bg-base text-[9px] font-black leading-none">✓</span>
        )}
      </div>
      {children}
    </CustomButton>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NewProjectFormProps {
  /** Back to the My Projects list — also called after a successful submission. */
  onBack: () => void;
  /** Fully exits Settings (the header's ✕, same as every other section). */
  onClose: () => void;
  /** When provided the form pre-fills and submits a PATCH instead of POST. */
  initialLead?: Lead;
}

export default function NewProjectForm({ onBack, onClose, initialLead }: NewProjectFormProps) {
  const { user } = useAuth();
  const location = useLocation();

  const initialPackage = (location.state as { package?: string } | null)?.package ?? 'visibility';

  const [step, setStep] = useState(1);

  // Which template the Style Direction step is previewing. Starts on the
  // style already saved on the lead (edit mode), else the first one.
  const [styleIdx, setStyleIdx] = useState(() => {
    const i = SHOWCASE_TEMPLATES.findIndex(t => t.name === initialLead?.style_direction);
    return i >= 0 ? i : 0;
  });

  const [form, setForm] = useState<FormState>(() => {
    if (initialLead) {
      const urls = initialLead.inspiration_urls ?? [];
      return {
        businessName: initialLead.name,
        businessType: initialLead.business,
        message: initialLead.message ?? '',
        hasExistingWebsite: initialLead.existing_website ?? false,
        existingWebsiteUrl: initialLead.existing_website_url ?? '',
        location: initialLead.location ?? '',
        siteGoal: initialLead.site_goal ?? '',
        pagesNeeded: initialLead.pages_needed ?? [],
        styleDirection: initialLead.style_direction ?? '',
        hasLogo: initialLead.has_logo ?? false,
        logoFile: null,
        hasBrandColors: initialLead.has_brand_colors ?? false,
        primaryColor: initialLead.primary_color ?? 'var(--color-brand-primary)',
        secondaryColor: initialLead.secondary_color ?? '#7000FF',
        inspirationUrl1: urls[0] ?? '',
        inspirationUrl2: urls[1] ?? '',
        phoneNumber: initialLead.phone_number ?? '',
        contactMethod: initialLead.contact_method ?? '',
        timeline: initialLead.timeline ?? '',
        wantsCall: initialLead.wants_call,
        selectedPackage: initialLead.package ?? initialPackage,
      };
    }
    return {
      businessName: user?.displayName ?? '',
      businessType: '',
      message: '',
      hasExistingWebsite: false,
      existingWebsiteUrl: '',
      location: '',
      siteGoal: '',
      pagesNeeded: [],
      styleDirection: '',
      hasLogo: false,
      logoFile: null,
      hasBrandColors: false,
      primaryColor: 'var(--color-brand-primary)',
      secondaryColor: '#7000FF',
      inspirationUrl1: '',
      inspirationUrl2: '',
      phoneNumber: '',
      contactMethod: '',
      timeline: '',
      wantsCall: false,
      selectedPackage: initialPackage,
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (partial: Partial<FormState>) => setForm(f => ({ ...f, ...partial }));

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => s - 1);

  const normalizeUrl = (url: string) => {
    const t = url.trim();
    if (!t) return '';
    return /^https?:\/\//i.test(t) ? t : `https://${t}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const urls = [form.inspirationUrl1, form.inspirationUrl2]
        .map(normalizeUrl)
        .filter(Boolean);
      const payload = {
        name: form.businessName,
        email: user?.email ?? '',
        business: form.businessType,
        message: form.message.trim() || undefined,
        existing_website: form.hasExistingWebsite,
        existing_website_url: form.hasExistingWebsite ? normalizeUrl(form.existingWebsiteUrl) || undefined : undefined,
        location: form.location.trim() || undefined,
        site_goal: form.siteGoal || undefined,
        pages_needed: form.pagesNeeded.length ? form.pagesNeeded : undefined,
        style_direction: form.styleDirection || undefined,
        has_logo: form.hasLogo,
        logo_file: form.logoFile ?? undefined,
        has_brand_colors: form.hasBrandColors,
        primary_color: form.hasBrandColors ? form.primaryColor : undefined,
        secondary_color: form.hasBrandColors ? form.secondaryColor : undefined,
        inspiration_urls: urls.length ? urls : undefined,
        phone_number: form.phoneNumber,
        contact_method: form.contactMethod || undefined,
        timeline: form.timeline || undefined,
        wants_call: form.wantsCall,
        package: form.selectedPackage || undefined,
      };
      if (initialLead) {
        await updateLeadSubmit(initialLead.id, payload);
      } else {
        await submitLead(payload);
      }
      // Straight back to My Projects — the freshly submitted (or updated)
      // project appearing in the list is the confirmation.
      onBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <FieldLabel>Business Name *</FieldLabel>
              <TextInput
                value={form.businessName}
                onChange={v => patch({ businessName: v })}
                placeholder="e.g. Maria's Nail Salon"
              />
            </div>
            <div>
              <FieldLabel>Business Type / Industry *</FieldLabel>
              <TextInput
                value={form.businessType}
                onChange={v => patch({ businessType: v })}
                placeholder="e.g. Nail Salon, Local Restaurant"
              />
            </div>
            <div>
              <FieldLabel>Do you have an existing website?</FieldLabel>
              <Toggle
                value={form.hasExistingWebsite}
                onChange={v => patch({ hasExistingWebsite: v })}
              />
            </div>
            {form.hasExistingWebsite && (
              <div>
                <FieldLabel>Current Website URL</FieldLabel>
                <TextInput
                  type="url"
                  value={form.existingWebsiteUrl}
                  onChange={v => patch({ existingWebsiteUrl: v })}
                  placeholder="https://yourbusiness.com"
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <FieldLabel>Business Location *</FieldLabel>
            <TextInput
              value={form.location}
              onChange={v => patch({ location: v })}
              placeholder="e.g. Austin, TX or 123 Main St, Austin, TX"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <FieldLabel>Tell us about your business (a couple of sentences)</FieldLabel>
            <TextArea
              value={form.message}
              onChange={v => patch({ message: v })}
              placeholder="What do you do, who are your customers, and what makes you different?"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            {SITE_GOALS.map(goal => (
              <OptionBtn
                key={goal}
                selected={form.siteGoal === goal}
                onClick={() => patch({ siteGoal: goal })}
              >
                {goal}
              </OptionBtn>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PAGES.map(page => (
              <CheckBtn
                key={page}
                selected={form.pagesNeeded.includes(page)}
                onClick={() =>
                  patch({
                    pagesNeeded: form.pagesNeeded.includes(page)
                      ? form.pagesNeeded.filter(p => p !== page)
                      : [...form.pagesNeeded, page],
                  })
                }
              >
                {page}
              </CheckBtn>
            ))}
          </div>
        );

      case 6:
        return (
          <div className="space-y-8">
            <div>
              <FieldLabel>Do you have a logo?</FieldLabel>
              <Toggle
                value={form.hasLogo}
                onChange={v => patch({ hasLogo: v, logoFile: v ? form.logoFile : null })}
              />
              {form.hasLogo && (
                <div className="mt-4">
                  <label className="cursor-pointer">
                    <div className="inline-flex items-center gap-3 py-3 px-4 rounded-xl border border-white/10 hover:border-white/30 transition-colors text-sm text-ink-muted">
                      <Upload className="w-4 h-4 flex-shrink-0" />
                      <span>{form.logoFile ? form.logoFile.name : 'Upload logo file'}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => patch({ logoFile: e.target.files?.[0] ?? null })}
                    />
                  </label>
                </div>
              )}
            </div>

            <div>
              <FieldLabel>Do you have brand colors?</FieldLabel>
              <Toggle
                value={form.hasBrandColors}
                onChange={v => patch({ hasBrandColors: v })}
              />
              {form.hasBrandColors && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Primary Color</FieldLabel>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl">
                      <input
                        type="color"
                        value={form.primaryColor}
                        onChange={e => patch({ primaryColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-sm font-mono text-ink-muted">{form.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Secondary Color</FieldLabel>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl">
                      <input
                        type="color"
                        value={form.secondaryColor}
                        onChange={e => patch({ secondaryColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-sm font-mono text-ink-muted">{form.secondaryColor}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 7: {
        const activeTemplate = SHOWCASE_TEMPLATES[styleIdx];
        const preview = TEMPLATE_PREVIEWS[activeTemplate.slug];
        const primary = preview.accent;
        const secondary = preview.accent2;

        return (
          <div className="space-y-5">
            <FieldLabel>This isn't your final design — it's a direction we use as the starting point.</FieldLabel>
            {/* ── Top: template selector + tags ───────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SHOWCASE_TEMPLATES.map((t, i) => (
                <OptionBtn
                  key={t.slug}
                  selected={form.styleDirection === t.name}
                  onClick={() => { setStyleIdx(i); patch({ styleDirection: t.name }); }}
                >
                  <span className="flex items-center gap-2">
                    <t.icon className="w-4 h-4 flex-shrink-0" style={{ color: t.accent }} />
                    {t.name}
                  </span>
                </OptionBtn>
              ))}
            </div>

            {/* ── Bottom: component samples inside a browser mock ─────── */}
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              {/* Chrome bar */}
              {/* Same dimensions as the showcase section's ChromeBar so every
                  browser mock across the site reads identically. */}
              <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#E8E8E8' }}>
                <div className="flex gap-1.5 flex-shrink-0" aria-hidden="true">
                  <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <div className="flex-1 flex justify-center min-w-0">
                  <div className="flex items-center gap-1.5 px-4 py-1 rounded-full text-[11px] font-medium max-w-[240px] truncate" style={{ background: '#FFFFFF', color: '#6B7280' }}>
                    <Lock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{activeTemplate.domain}</span>
                  </div>
                </div>
                <div className="w-[52px] flex-shrink-0" aria-hidden="true" />
              </div>

              {/* One mini landing page in the template's design language:
                  navbar, then hero (title / subtitle / button) beside a card. */}
              <div style={{ background: preview.bg }}>
                {/* Mini navbar — business name left, two nav options right */}
                <div className="flex items-center justify-between px-6 py-6 border-b" style={{ borderColor: preview.border }}>
                  <span
                    className={`text-lg ${preview.headingClass}`}
                    style={{ color: preview.heading, fontFamily: preview.headingFont }}
                  >
                    {form.businessName || activeTemplate.name}
                  </span>
                  <div className="flex items-center gap-5 text-xs" style={{ color: preview.body }}>
                    {preview.navLinks.map(l => <span key={l}>{l}</span>)}
                  </div>
                </div>

                {/* Hero — text + CTA left, big card right */}
                <div className="grid grid-cols-1 sm:grid-cols-[1.15fr_1fr] gap-8 pb-10 items-center px-6 py-2">
                  <div>
                    <h4
                      className={`text-4xl sm:text-5xl mb-3 ${preview.headingClass}`}
                      style={{ color: preview.heading, fontFamily: preview.headingFont }}
                    >
                      {preview.headline}
                    </h4>
                    <p className="text-lg sm:text-lg font-light leading-relaxed mb-6" style={{ color: preview.body }}>
                      {preview.bodyCopy}
                    </p>
                    <span
                      className={`inline-block ${preview.buttonClass}`}
                      style={{ background: primary, color: preview.buttonText }}
                    >
                      {preview.buttonLabel}
                    </span>
                  </div>

                  <div
                    className={`w-full border p-6 ${preview.cardClass}`}
                    style={{ background: preview.surface, borderColor: preview.border }}
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-2.5">
                      <p
                        className={`text-3xl ${preview.headingClass}`}
                        style={{ color: preview.heading, fontFamily: preview.headingFont }}
                      >
                        {preview.cardTitle}
                      </p>
                    </div>
                    <p className="text-sm font-light leading-relaxed mb-4" style={{ color: preview.body }}>
                      {preview.cardBody}
                    </p>
                    <p className="text-lg font-bold flex-shrink-0" style={{ color: primary }}>{preview.cardMeta}</p>
                    <p className="text-sm font-bold" style={{ color: secondary }}>{preview.cardLink}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active template's aesthetic tags */}
            <div className="flex flex-wrap gap-1.5">
              {RECIPE_TAGS[activeTemplate.slug].map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-transparent border border-white/10 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
      }

      case 8:
        return (
          <div className="space-y-3">
            <FieldLabel>Links to websites you like (optional)</FieldLabel>
            <TextInput
              type="url"
              value={form.inspirationUrl1}
              onChange={v => patch({ inspirationUrl1: v })}
              placeholder="https://example.com"
            />
            <TextInput
              type="url"
              value={form.inspirationUrl2}
              onChange={v => patch({ inspirationUrl2: v })}
              placeholder="https://another-example.com"
            />
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div>
              <FieldLabel>Do you want a 15-minute call?</FieldLabel>
              <Toggle
                value={form.wantsCall}
                onChange={v => patch({ wantsCall: v })}
              />
            </div>
            <div>
              <FieldLabel>Best Phone Number *</FieldLabel>
              <TextInput
                value={form.phoneNumber}
                onChange={v => patch({ phoneNumber: v })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <FieldLabel>Preferred Contact Method *</FieldLabel>
              <div className="grid grid-cols-3 gap-3">
                {CONTACT_METHODS.map(m => (
                  <OptionBtn
                    key={m}
                    selected={form.contactMethod === m}
                    onClick={() => patch({ contactMethod: m })}
                  >
                    {m}
                  </OptionBtn>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Timeline *</FieldLabel>
              <div className="space-y-3">
                {TIMELINES.map(t => (
                  <OptionBtn
                    key={t}
                    selected={form.timeline === t}
                    onClick={() => patch({ timeline: t })}
                  >
                    {t}
                  </OptionBtn>
                ))}
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-4">
            {PACKAGES.map(pkg => (
              <CustomButton
                type="button"
                key={pkg.id}
                onClick={() => patch({ selectedPackage: pkg.id })}
                variant="outline"
                size="none"
                className={`w-full rounded-xl p-5 text-left transition-all ${
                  form.selectedPackage === pkg.id
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {pkg.featured && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-2 block">
                    Best Value
                  </span>
                )}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className={`font-display font-bold text-lg italic ${
                        form.selectedPackage === pkg.id ? 'text-white' : 'text-ink-muted'
                      }`}
                    >
                      {pkg.name}
                    </p>
                    <p className="text-ink-muted text-xs font-light mt-1">{pkg.tagline}</p>
                  </div>
                  <p
                    className={`font-display text-2xl font-black flex-shrink-0 ${
                      form.selectedPackage === pkg.id ? 'text-brand-primary' : 'text-ink-muted'
                    }`}
                  >
                    {pkg.price}
                  </p>
                </div>
              </CustomButton>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6">
        <div className="max-w-2xl mx-auto w-full text-white">
          <CustomButton
            onClick={onBack}
            variant="ghost"
            size="none"
            className="hidden md:flex items-center gap-1.5 text-ink-muted text-[15px] border-none hover:text-white transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </CustomButton>
          <div>
            {/* Progress indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">
                    Step {step} of {TOTAL_STEPS}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
                    {STEP_TITLES[step - 1]}
                  </span>
                </div>
                <div className="h-px bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full"
                    style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                  />
                </div>
              </div>

              {/* Form card */}
              <div className="liquid-glass rounded-xl p-8 md:p-10">
                <h2 className="font-display text-2xl md:text-3xl font-bold italic mb-8">
                  {STEP_TITLES[step - 1]}
                </h2>

                {renderStep()}

                {error && (
                  <p className="mt-6 text-red-400 text-xs font-bold uppercase tracking-widest text-center">
                    {error}
                  </p>
                )}

                {/* Navigation */}
                <div className="flex gap-4 mt-8">
                  {step > 1 && (
                    <CustomButton
                      type="button"
                      onClick={goBack}
                      variant="outline"
                      size="none"
                      className="flex-1 py-4 border-white/10 text-ink-muted uppercase tracking-widest text-sm rounded-xl hover:border-white/30 hover:text-white transition-colors"
                    >
                      Back
                    </CustomButton>
                  )}
                  {step < TOTAL_STEPS ? (
                    <CustomButton
                      type="button"
                      onClick={goNext}
                      disabled={!isStepValid(step, form)}
                      arrow
                      size="none"
                      className="flex-1 py-4 uppercase tracking-widest text-sm rounded-xl flex items-center justify-center gap-2"
                    >
                      Next
                    </CustomButton>
                  ) : (
                    <CustomButton
                      type="button"
                      onClick={handleSubmit}
                      disabled={!isStepValid(step, form)}
                      loading={isSubmitting}
                      arrow
                      size="none"
                      className="flex-1 py-4 uppercase tracking-widest text-sm rounded-xl flex items-center justify-center gap-2"
                    >
                      Submit
                    </CustomButton>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
