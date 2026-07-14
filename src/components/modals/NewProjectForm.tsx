import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, MessageCircle, Phone, Mail, Upload, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { submitLead, updateLeadSubmit, type Lead } from '../../lib/api';
import { PACKAGES } from '../../data/content';
import Notification from '../ui/Notification';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 10;

const STEP_TITLES = [
  'Business Basics',
  'Location',
  'About Your Business',
  'Site Goal',
  'Pages Needed',
  'Style Direction',
  'Branding',
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

const STYLE_DIRECTIONS = [
  'Modern & Minimal',
  'Bold & Colorful',
  'Luxury & Elegant',
  'Playful & Fun',
  'Corporate & Professional',
];

const CONTACT_METHODS = ['Email', 'Phone', 'WhatsApp'];

const TIMELINES = [
  'ASAP (within a week)',
  'No rush (within a month)',
  'Just exploring',
];

// CTA on the post-submit confirmation popup — matches whichever contact
// method the client picked, instead of always pointing at WhatsApp.
const CONTACT_CTA: Record<string, { href: string; label: string; icon: React.ReactNode; external?: boolean }> = {
  WhatsApp: { href: 'https://wa.me/13026622736', label: 'Chat on WhatsApp', icon: <MessageCircle className="w-5 h-5" />, external: true },
  Phone: { href: 'tel:+13026622736', label: 'Call Us', icon: <Phone className="w-5 h-5" /> },
  Email: { href: 'mailto:consultprompts@gmail.com', label: 'Email Us', icon: <Mail className="w-5 h-5" /> },
};

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
    case 6: return !!form.styleDirection;
    case 7: return true;
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
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
          !value ? 'bg-brand-primary text-bg-base' : 'text-ink-muted hover:text-white'
        }`}
      >
        No
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
          value ? 'bg-brand-primary text-bg-base' : 'text-ink-muted hover:text-white'
        }`}
      >
        Yes
      </button>
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
    <button
      type="button"
      onClick={onClick}
      className={`w-full py-4 px-5 rounded-xl border text-left text-sm font-medium transition-all cursor-pointer ${
        selected
          ? 'border-brand-primary bg-brand-primary/10 text-white'
          : 'border-white/10 text-ink-muted hover:border-white/30 hover:text-white'
      }`}
    >
      {children}
    </button>
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
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 py-3 px-4 rounded-xl border text-sm font-medium transition-all cursor-pointer text-left ${
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
    </button>
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
  const [submitted, setSubmitted] = useState(false);
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
      setSubmitted(true);
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
          <div className="space-y-3">
            {STYLE_DIRECTIONS.map(style => (
              <OptionBtn
                key={style}
                selected={form.styleDirection === style}
                onClick={() => patch({ styleDirection: style })}
              >
                {style}
              </OptionBtn>
            ))}
          </div>
        );

      case 7:
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
              <button
                type="button"
                key={pkg.id}
                onClick={() => patch({ selectedPackage: pkg.id })}
                className={`w-full rounded-xl border p-5 text-left transition-all cursor-pointer ${
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
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <Notification
        isOpen={submitted}
        onClose={onBack}
        icon={<CheckCircle className="w-10 h-10 text-brand-primary" />}
        title={initialLead ? 'Submission Updated' : 'Transmission Received'}
        description={initialLead ? 'Your project details have been updated.' : "We're already analyzing your business DNA. Expect your mockup within 24–48 hours."}
      >
        {(() => {
          const cta = CONTACT_CTA[form.contactMethod] ?? CONTACT_CTA.WhatsApp;
          return (
            <a
              href={cta.href}
              {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="w-full py-4 bg-green-500 text-bg-base font-black uppercase tracking-widest hover:bg-green-400 transition-colors flex items-center justify-center gap-2 rounded-xl cursor-pointer"
            >
              {cta.icon}
              {cta.label}
            </a>
          );
        })()}
        <button
          onClick={onBack}
          className="w-full py-4 border border-brand-primary text-brand-primary font-black uppercase tracking-widest hover:bg-brand-primary hover:text-bg-base transition-colors flex items-center justify-center gap-2 rounded-xl cursor-pointer bg-transparent"
        >
          Back to My Projects
        </button>
      </Notification>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6">
        <div className="max-w-2xl mx-auto w-full text-white">
          <button
            onClick={onBack}
            className="hidden md:flex items-center gap-1.5 text-ink-muted text-[15px] font-bold cursor-pointer bg-transparent border-none hover:text-white transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
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
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex-1 py-4 border border-white/10 text-ink-muted font-bold uppercase tracking-widest text-sm rounded-xl hover:border-white/30 hover:text-white transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  {step < TOTAL_STEPS ? (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!isStepValid(step, form)}
                      className={`flex-1 py-4 font-black uppercase tracking-widest text-sm rounded-xl transition-all ${
                        isStepValid(step, form)
                          ? 'bg-brand-primary text-bg-base hover:bg-brand-primary/90 cursor-pointer'
                          : 'bg-white/5 text-ink-muted cursor-not-allowed'
                      }`}
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || !isStepValid(step, form)}
                      className={`flex-1 py-4 font-black uppercase tracking-widest text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
                        !isSubmitting && isStepValid(step, form)
                          ? 'bg-brand-primary text-bg-base hover:bg-brand-primary/90 cursor-pointer'
                          : 'bg-white/5 text-ink-muted cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Submit →'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
