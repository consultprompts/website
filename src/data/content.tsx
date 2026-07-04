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

export interface Review {
  client: string;
  quote: string;
  image: string;
  business: string;
  author: string;
  role: string;
  siteLabel: string;
}

export const REVIEWS: Review[] = [
  {
    client: 'Boardwalk Fries',
    quote:
      'The speed is insane. 40% sales lift in the first week. Our regulars now order online while waiting in line.',
    image: '/boardwalk.jpeg',
    business: 'FAST FOOD RESTAURANT',
    author: 'Maria Chen',
    role: 'Owner, Boardwalk Fries · Rehoboth, DE',
    siteLabel: 'boardwalk fries',
  },
  {
    client: 'Inspire',
    quote:
      'Best $299 I ever spent. The mobile performance is better than my previous $3k site, and it shipped in three days.',
    image: '/inspire.jpeg',
    business: 'BARBER SHOP',
    author: 'James Okafor',
    role: 'Owner, Inspire Barber Shop · Wilmington, DE',
    siteLabel: 'inspire barber',
  },
  {
    client: 'Zen Coffee',
    quote:
      'Professional, fast, converts like crazy. Knows exactly what a local business needs to stand out from the chains.',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600',
    business: 'Specialty Coffee',
    author: 'Sara Liu',
    role: 'Founder, Zen Coffee · Newark, DE',
    siteLabel: 'zen coffee',
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
    title: 'Get more Sales',
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

export interface Package {
  id: string;
  name: string;
  tagline: string;
  price: string;
  tier: string;
  featured?: boolean;
  featuresIntro?: string;
  features: PackageFeature[];
  cta: string;
}

export const PACKAGES: Package[] = [
  {
    id: 'facelift',
    name: 'Digital Face-Lift',
    tagline: 'The ultimate hook. High-speed, modern replacement for old sites.',
    price: '$299',
    tier: 'Startup',
    cta: 'Select Package',
    features: [
      { icon: <Smartphone className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: '3-5 Modern Pages (Mobile-First)' },
      { icon: <Zap className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Speed Optimization' },
      { icon: <CloudCog className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Domain & Hosting Transfer' },
      { icon: <Search className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Basic Global SEO' },
      { icon: <MessageCircle className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Lead Capture Form' },
      { icon: <Rocket className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: '48–72 Hour Turnaround' },
    ],
  },
  {
    id: 'visibility',
    name: 'Visibility Booster',
    tagline: 'The better deal. Not just a site, but a way to get found on Google.',
    price: '$499',
    tier: 'Performance',
    featured: true,
    featuresIntro: 'Everything in $299 Plus:',
    cta: 'Go Visibility',
    features: [
      { icon: <MapPin className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Google Business Profile (GBP) Fix' },
      { icon: <Search className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Local SEO (City/Neighborhood)' },
      { icon: <Instagram className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Social Feed Auto-Sync' },
      { icon: <Brain className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'AI Persuasive Copywriting' },
      { icon: <Zap className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: '1 Month "On-Call" Updates' },
    ],
  },
  {
    id: 'growth',
    name: 'Auto-Pilot Growth',
    tagline: 'The premium. Saving the owner 5+ hours a week in admin work.',
    price: '$699',
    tier: 'Enterprise',
    featuresIntro: 'Everything in $499 Plus:',
    cta: 'Go Premium',
    features: [
      { icon: <Calendar className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Integrated Booking System' },
      { icon: <MessageSquare className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: '24/7 AI Chatbot Assistant' },
      { icon: <BarChart3 className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Premium Analytics Dashboard' },
      { icon: <Send className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: 'Email/SMS Automation' },
      { icon: <ShieldCheck className="w-4 h-4 text-brand-primary flex-shrink-0" />, label: '3 Months Priority Support' },
    ],
  },
];
