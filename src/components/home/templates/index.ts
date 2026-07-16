import type React from 'react';
import { Home, UtensilsCrossed, Scissors, Dumbbell, type LucideIcon } from 'lucide-react';
import LumiereTemplate from './LumiereTemplate';
import RosalieTemplate from './RosalieTemplate';
import IroncoreTemplate from './IroncoreTemplate';
import HarborviewTemplate from './HarborviewTemplate';

// ---------------------------------------------------------------------------
// Live Template Showcase registry. Each entry is a completely separate,
// self-contained mini-site component — different layout, palette, fonts and
// copy, not a reskin. Adding a template = build the component, add a row.
//
// NOTE for template authors: don't use the site's remapped utilities
// (text-white, border-white/10, bg-white/5, …) inside a template —
// index.css re-colors those under html.light, which would visibly corrupt
// a template's fixed palette when the host site is in light mode. Use
// arbitrary-value classes (text-[#FFF]) or inline styles instead.
// ---------------------------------------------------------------------------

export interface ShowcaseTemplateEntry {
  slug: string;
  name: string;
  /** Dot color shown next to the template's name in the switcher. */
  accent: string;
  /** Fake domain shown in the mock browser's URL bar. */
  domain: string;
  /** Business-type icon shown in the template switcher button. */
  icon: LucideIcon;
  Component: React.ComponentType;
}

// First entry is the default template shown on load.
export const SHOWCASE_TEMPLATES: ShowcaseTemplateEntry[] = [
  { slug: 'harborview', name: 'Harborview', accent: '#F59E0B', domain: 'harborview-realty.mysite.com', icon: Home, Component: HarborviewTemplate },
  { slug: 'rosalie', name: 'Rosalie', accent: '#DC2626', domain: 'rosalie-eats.mysite.com', icon: UtensilsCrossed, Component: RosalieTemplate },
  { slug: 'lumiere', name: 'Lumière', accent: '#A855F7', domain: 'lumiere-studio.mysite.com', icon: Scissors, Component: LumiereTemplate },
  { slug: 'ironcore', name: 'Ironcore', accent: '#3B82F6', domain: 'ironcore-fitness.mysite.com', icon: Dumbbell, Component: IroncoreTemplate },
];
