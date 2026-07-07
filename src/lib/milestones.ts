// Shared milestone-stage logic for AdminPanel.tsx and MyProjects.tsx.
//
// Leads track progress as a single `milestone_index` int. When a lead opted
// into a 15-minute call, an extra "Discovery Call Completed" stage is prepended,
// shifting every later stage's index by one — `milestoneOffset` is that shift.

const CORE_STAGES = [
  'Designing Your Website',
  'Design Ready for Your Review',
  'Design Approved',
  'Building Your Website',
  'Website Ready',
  'Payment',
  'Waiting for Launch',
  'Website Is Live',
];

export function milestoneOffset(wantsCall: boolean): number {
  return wantsCall ? 1 : 0;
}

export function milestoneStages(wantsCall: boolean): string[] {
  return wantsCall ? ['Discovery Call Completed', ...CORE_STAGES] : CORE_STAGES;
}

// Core stage indices, relative to milestoneOffset(wantsCall).
export const CORE_IDX = {
  designingMockup: 0,
  mockupDelivered: 1,
  revisionsSignedOff: 2,
  siteInDevelopment: 3,
  siteCompleted: 4,
  payment: 5,
  waitingForLaunch: 6,
  launched: 7,
};
