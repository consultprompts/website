import React from 'react';
import {
  MousePointer2,
  Rocket,
  CheckCircle,
  Smartphone,
  Zap,
  CloudCog,
  Search,
  MessageCircle,
  MapPin,
  Instagram,
  Brain,
  Calendar,
  MessageSquare,
  BarChart3,
  Send,
  ShieldCheck,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export interface ReviewMetric {
  value: string;
  label: string;
}

export interface Review {
  client: string;
  quote: string;
  image: string;
  business: string;
  author: string;
  role: string;
  siteLabel: string;
  featured?: boolean;
  problem?: string;
  fix: string;
  result: string;
  metrics: ReviewMetric[];
}

export const REVIEWS: Review[] = [
  {
    client: 'Boardwalk Fries',
    quote:
      'The speed is insane. 40% sales lift in the first week. Our regulars now order online while waiting in line.',
    image: '/boardwalk.jpeg',
    business: 'FAST FOOD RESTAURANT',
    author: 'Maria Chen',
    role: 'Maria Chen, Owner · Rehoboth, DE',
    siteLabel: 'boardwalk fries',
    featured: true,
    problem:
      'A dated site with no online ordering — regulars were calling in orders or just walking away during the lunch rush.',
    fix: 'A fast, mobile-first menu page with one-tap ordering built in, live in under three days.',
    result: '40% sales lift in the first week, with regulars now ordering online while they wait in line.',
    metrics: [
      { value: '+40%', label: 'Sales lift' },
      { value: '72h', label: 'To launch' },
    ],
  },
  {
    client: 'Inspire Barber Shop',
    quote:
      'Best $299 I ever spent. The mobile performance is better than my previous $3k site, and it shipped in three days.',
    image: '/inspire.jpeg',
    business: 'BARBER SHOP',
    author: 'James Okafor',
    role: 'James Okafor, Owner · Wilmington, DE',
    siteLabel: 'inspire barber',
    fix: 'Replaced a slow $3k custom build with a lean, high-performance Digital Face-Lift site.',
    result: 'Shipped in three days at a fraction of the previous cost, with better mobile performance.',
    metrics: [
      { value: '3 days', label: 'Turnaround' },
      { value: '10x', label: 'Cheaper' },
    ],
  },
  {
    client: 'Zen Coffee',
    quote:
      'Professional, fast, converts like crazy. Knows exactly what a local business needs to stand out from the chains.',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600',
    business: 'SPECIALTY COFFEE',
    author: 'Sara Liu',
    role: 'Sara Liu, Founder · Newark, DE',
    siteLabel: 'zen coffee',
    fix: 'A Visibility Booster build with local SEO tuned to stand out from nearby chain coffee shops.',
    result: 'Now ranking #1 locally, with a 4.9★ client rating on the finished site.',
    metrics: [
      { value: '4.9★', label: 'Client rating' },
      { value: '#1', label: 'Local rank' },
    ],
  },
  {
    client: 'Boardwalk Fries',
    quote:
      'The speed is insane. 40% sales lift in the first week. Our regulars now order online while waiting in line.',
    image: '/boardwalk.jpeg',
    business: 'FAST FOOD RESTAURANT',
    author: 'Maria Chen',
    role: 'Maria Chen, Owner · Rehoboth, DE',
    siteLabel: 'boardwalk fries',
    featured: true,
    problem:
      'A dated site with no online ordering — regulars were calling in orders or just walking away during the lunch rush.',
    fix: 'A fast, mobile-first menu page with one-tap ordering built in, live in under three days.',
    result: '40% sales lift in the first week, with regulars now ordering online while they wait in line.',
    metrics: [
      { value: '+40%', label: 'Sales lift' },
      { value: '72h', label: 'To launch' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Process steps
// ---------------------------------------------------------------------------

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: '01',
    title: 'Get your Mockup',
    description:
      'We design a high-fidelity visual of your site based on your brand. No guesswork, just results.',
    icon: <MousePointer2 className="w-6 h-6 text-brand-primary" />,
  },
  {
    id: '02',
    title: 'Approve & Launch',
    description:
      'Once you love the design, we build and deploy. Your site goes live on a world-class infrastructure.',
    icon: <Rocket className="w-6 h-6 text-brand-primary" />,
  },
  {
    id: '03',
    title: 'Get more Customers',
    description:
      'Stop losing customers to slow loading times or bad UX. Convert visitors into loyal clients immediately.',
    icon: <CheckCircle className="w-6 h-6 text-brand-primary" />,
  },
];

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export interface Faq {
  question: string;
  answer: string;
}

export const FAQS: Faq[] = [
  {
    question: 'Why is it so cheap?',
    answer:
      "Traditional agencies are slow and bloated. We use AI-assisted design workflows and specialized engineering to strip out the waste. You get high-end results without paying for an agency's fancy office.",
  },
  {
    question: 'How fast is it?',
    answer:
      'We aim for a 72-hour turnaround from the moment we have your core business info. Speed is our competitive advantage.',
  },
  {
    question: 'What if I need more than 5 pages?',
    answer:
      'Our core offer is optimized for efficiency. If you need a more complex site, we can discuss a custom quote, but 99% of local businesses shine with our 3-5 page high-performance setup.',
  },
  {
    question: 'Do you offer maintenance?',
    answer:
      'Yes. For a small monthly fee, we handle all updates, security, and hosting, so you can focus on running your business.',
  },
];

// ---------------------------------------------------------------------------
// Pricing packages
// ---------------------------------------------------------------------------

export interface PackageFeature {
  icon: React.ReactNode;
  label: string;
}

export interface PackageCategoryItem {
  label: string;
  detail: string;
}

export interface PackageCategory {
  label: string;
  items: PackageCategoryItem[];
}

export interface Package {
  id: string;
  name: string;
  tagline: string;
  price: string;
  tier: string;
  featured?: boolean;
  featuresIntro?: string;
  bestFor: string;
  timeline: string;
  features: PackageFeature[];
  categories: PackageCategory[];
  cta: string;
}

export const PACKAGES: Package[] = [
  {
    id: 'facelift',
    name: 'Digital Face-Lift',
    tagline: 'The ultimate hook. High-speed, modern replacement for old sites.',
    price: '$299',
    tier: 'Startup',
    bestFor: 'Best for: brand-new businesses',
    timeline: '48–72 hour turnaround',
    cta: 'Select Package',
    features: [
      { icon: <Smartphone className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: '3-5 Modern Pages' },
      { icon: <Zap className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Speed Optimization' },
      { icon: <CloudCog className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Domain & Hosting Transfer' },
      { icon: <Search className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Basic Global SEO' },
      { icon: <MessageCircle className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Lead Capture Form' },
      { icon: <Rocket className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: '48–72 Hour Turnaround' },
    ],
    categories: [
      { label: 'Design & Build', items: [
        { label: '3-5 Modern Pages', detail: 'Home, services, about and contact — built mobile-first from day one.' },
        { label: 'Speed Optimization', detail: 'Compressed assets and lean code so pages load instantly on any connection.' },
        { label: 'Domain & Hosting Transfer', detail: 'We move your existing domain over or register a new one and host it for you.' },
      ]},
      { label: 'Growth & Support', items: [
        { label: 'Basic Global SEO', detail: 'Proper titles, meta tags and structure so search engines can find you.' },
        { label: 'Lead Capture Form', detail: 'A contact form wired straight to your inbox — no missed inquiries.' },
      ]},
    ],
  },
  {
    id: 'visibility',
    name: 'Visibility Booster',
    tagline: 'The better deal. Not just a site, but a way to get found on Google.',
    price: '$499',
    tier: 'Performance',
    featured: true,
    featuresIntro: 'Everything in DFL, plus:',
    bestFor: 'Best for: businesses that rely on local search',
    timeline: '48–72 hour turnaround',
    cta: 'Go Visibility',
    features: [
      { icon: <MapPin className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Google Business Profile' },
      { icon: <Search className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Local SEO (City/Neighborhood)' },
      { icon: <Instagram className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Social Feed Auto-Sync' },
      { icon: <Brain className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'AI Persuasive Copywriting' },
      { icon: <Zap className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: '1 Month "On-Call" Updates' },
    ],
    categories: [
      { label: 'Local Visibility', items: [
        { label: 'Google Business Profile Fix', detail: 'We audit and correct your GBP listing so it shows up accurately in Maps and Search.' },
        { label: 'Local SEO (City/Neighborhood)', detail: 'Pages and copy tuned to rank for searches in your specific service area.' },
        { label: 'Social Feed Auto-Sync', detail: 'Your latest Instagram posts pull automatically into the site — always current.' },
      ]},
      { label: 'Copy & Care', items: [
        { label: 'AI Persuasive Copywriting', detail: 'Every page written to convert, not just describe — tuned to your industry.' },
        { label: '1 Month "On-Call" Updates', detail: 'Text or photo changes in the first month are handled for you, free.' },
      ]},
    ],
  },
  {
    id: 'growth',
    name: 'Auto-Pilot Growth',
    tagline: 'The premium. Saving the owner 5+ hours a week in admin work.',
    price: '$699',
    tier: 'Enterprise',
    featuresIntro: 'Everything in VB, plus:',
    bestFor: 'Best for: owners ready to automate admin work',
    timeline: '48–72 hour turnaround',
    cta: 'Go Premium',
    features: [
      { icon: <Calendar className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Integrated Booking System' },
      { icon: <MessageSquare className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: '24/7 AI Chatbot Assistant' },
      { icon: <BarChart3 className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Premium Analytics Dashboard' },
      { icon: <Send className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Email/SMS Automation' },
      { icon: <ShieldCheck className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: '3 Months Priority Support' },
    ],
    categories: [
      { label: 'Automation', items: [
        { label: 'Integrated Booking System', detail: 'Customers book appointments or reservations directly on your site.' },
        { label: '24/7 AI Chatbot Assistant', detail: 'Answers common customer questions instantly, even while you sleep.' },
        { label: 'Email/SMS Automation', detail: 'Automatic confirmations, reminders and follow-ups — no manual texting.' },
      ]},
      { label: 'Insight & Support', items: [
        { label: 'Premium Analytics Dashboard', detail: 'See exactly where visitors come from and what they click on.' },
        { label: '3 Months Priority Support', detail: 'Front-of-line access to the team for changes, fixes and questions.' },
      ]},
    ],
  },
];

export const COMPARISON_ROWS: { label: string; included: [boolean, boolean, boolean] }[] = [
  { label: '3-5 Modern Pages (Mobile-First)', included: [true, true, true] },
  { label: 'Speed Optimization', included: [true, true, true] },
  { label: 'Domain & Hosting Transfer', included: [true, true, true] },
  { label: 'Basic Global SEO', included: [true, true, true] },
  { label: 'Lead Capture Form', included: [true, true, true] },
  { label: '48–72 Hour Turnaround', included: [true, true, true] },
  { label: 'Google Business Profile Fix', included: [false, true, true] },
  { label: 'Local SEO (City/Neighborhood)', included: [false, true, true] },
  { label: 'Social Feed Auto-Sync', included: [false, true, true] },
  { label: 'AI Persuasive Copywriting', included: [false, true, true] },
  { label: '1 Month "On-Call" Updates', included: [false, true, true] },
  { label: 'Integrated Booking System', included: [false, false, true] },
  { label: '24/7 AI Chatbot Assistant', included: [false, false, true] },
  { label: 'Premium Analytics Dashboard', included: [false, false, true] },
  { label: 'Email/SMS Automation', included: [false, false, true] },
  { label: '3 Months Priority Support', included: [false, false, true] },
];

// ---------------------------------------------------------------------------
// Company values (About page)
// ---------------------------------------------------------------------------

export interface Value {
  icon: string;
  title: string;
  description: string;
}

export const VALUES: Value[] = [
  {
    icon: '⚡',
    title: 'Speed Over Bureaucracy',
    description: "No discovery calls, no 40-page proposals. We build in days because your business can't wait months.",
  },
  {
    icon: '🎯',
    title: 'Built to Convert',
    description: 'Every page exists to turn a visitor into a customer — not to win a design award.',
  },
  {
    icon: '🤝',
    title: 'No Gatekeepers',
    description: 'You talk directly to the people building your site — no account managers in between.',
  },
];

// ---------------------------------------------------------------------------
// Shared site stats (used on Work, About, etc.)
// ---------------------------------------------------------------------------

export const SITE_STATS = [
  { value: '40%', label: 'Avg. Sales Lift' },
  { value: '4.9', label: 'Client Rating' },
  { value: '34', label: 'Shops Shipped' },
  { value: '72h', label: 'Avg. Turnaround' },
];
