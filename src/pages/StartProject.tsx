import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Loader2, CheckCircle, MessageCircle, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitLead } from '../lib/api';
import { PACKAGES } from '../data/content';
import logoSrc from '../logo.png';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 8;

const STEP_TITLES = [
  'Business Basics',
  'About Your Business',
  'Site Goal',
  'Pages Needed',
  'Style Direction',
  'Branding',
  'Inspiration & Contact',
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  businessName: string;
  businessType: string;
  message: string;
  hasExistingWebsite: boolean;
  existingWebsiteUrl: string;
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
    case 2: return true;
    case 3: return !!form.siteGoal;
    case 4: return true;
    case 5: return !!form.styleDirection;
    case 6: return true;
    case 7: return !!form.phoneNumber.trim() && !!form.contactMethod && !!form.timeline;
    case 8: return !!form.selectedPackage;
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

// ─── Step animation variants ──────────────────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
};

// ─── Page component ───────────────────────────────────────────────────────────

export default function StartProject() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialPackage =
    (location.state as { package?: string } | null)?.package ?? 'visibility';

  const [step, setStep] = useState(1);
  const [stepDir, setStepDir] = useState(1);

  const [form, setForm] = useState<FormState>({
    businessName: '',
    businessType: '',
    message: '',
    hasExistingWebsite: false,
    existingWebsiteUrl: '',
    siteGoal: '',
    pagesNeeded: [],
    styleDirection: '',
    hasLogo: false,
    logoFile: null,
    hasBrandColors: false,
    primaryColor: '#00F0FF',
    secondaryColor: '#7000FF',
    inspirationUrl1: '',
    inspirationUrl2: '',
    phoneNumber: '',
    contactMethod: '',
    timeline: '',
    wantsCall: false,
    selectedPackage: initialPackage,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/?auth=login&next=/start-project', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.displayName) {
      setForm(f => ({ ...f, businessName: f.businessName || user.displayName! }));
    }
  }, [user?.displayName]);

  const patch = (partial: Partial<FormState>) => setForm(f => ({ ...f, ...partial }));

  const goNext = () => {
    setStepDir(1);
    setStep(s => s + 1);
  };

  const goBack = () => {
    setStepDir(-1);
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const urls = [form.inspirationUrl1, form.inspirationUrl2].filter(Boolean);
      await submitLead({
        name: form.businessName,
        email: user?.email ?? '',
        business: form.businessType,
        message: form.message.trim() || undefined,
        existing_website: form.hasExistingWebsite,
        existing_website_url: form.hasExistingWebsite ? form.existingWebsiteUrl : undefined,
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
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
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
            <AnimatePresence>
              {form.hasExistingWebsite && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FieldLabel>Current Website URL</FieldLabel>
                  <TextInput
                    type="url"
                    value={form.existingWebsiteUrl}
                    onChange={v => patch({ existingWebsiteUrl: v })}
                    placeholder="https://yourbusiness.com"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 2:
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

      case 3:
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

      case 4:
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

      case 5:
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

      case 6:
        return (
          <div className="space-y-8">
            <div>
              <FieldLabel>Do you have a logo?</FieldLabel>
              <Toggle
                value={form.hasLogo}
                onChange={v => patch({ hasLogo: v, logoFile: v ? form.logoFile : null })}
              />
              <AnimatePresence>
                {form.hasLogo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <FieldLabel>Do you have brand colors?</FieldLabel>
              <Toggle
                value={form.hasBrandColors}
                onChange={v => patch({ hasBrandColors: v })}
              />
              <AnimatePresence>
                {form.hasBrandColors && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 grid grid-cols-2 gap-4"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
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

      case 8:
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base font-sans">
      <div className="border-b border-white/5 bg-bg-base/95 backdrop-blur-md sticky top-0 z-50 py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-ink-muted hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Back</span>
          </Link>
          <div className="flex items-center gap-3 ml-2">
            <img src={logoSrc} alt="Consult Prompts" className="h-7 w-auto object-contain" />
            <span className="font-display font-bold uppercase tracking-tight text-base">
              Consult Prompts
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="liquid-glass rounded-xl p-8 md:p-12 text-center"
            >
              <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-brand-primary" />
              </div>
              <h2 className="font-display text-3xl font-bold italic mb-4">
                Transmission Received
              </h2>
              <p className="text-ink-muted leading-relaxed font-light mb-8 max-w-sm mx-auto">
                We're already analyzing your business DNA. Expect your mockup within 24–48 hours.
              </p>
              <div className="flex flex-col gap-4 items-center max-w-xs mx-auto">
                <a
                  href="https://wa.me/13026622736"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-green-500 text-bg-base font-black uppercase tracking-widest hover:bg-green-400 transition-colors flex items-center justify-center gap-2 rounded-xl cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
                <Link
                  to="/"
                  className="text-xs font-bold uppercase tracking-widest border-b border-brand-primary pb-1 hover:text-brand-primary hover:border-white transition-colors"
                >
                  Back Home
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
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
                  <motion.div
                    className="h-full bg-brand-primary rounded-full"
                    animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>

              {/* Form card */}
              <div className="liquid-glass rounded-xl p-8 md:p-10">
                <h2 className="font-display text-2xl md:text-3xl font-bold italic mb-8">
                  {STEP_TITLES[step - 1]}
                </h2>

                <AnimatePresence mode="wait" custom={stepDir}>
                  <motion.div
                    key={step}
                    custom={stepDir}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>

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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
