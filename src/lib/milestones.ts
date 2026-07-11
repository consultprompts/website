// Shared six-milestone model for SettingsPanel.tsx (admin checklist) and
// MyProjectsSection.tsx (client tracker).
//
// `milestone_index` counts COMPLETED milestones: milestone k (1-based) is
// complete iff milestone_index >= k. Mirrors the constants in
// agency-service/internal/model/milestone.go — keep the two in sync.

import type { Lead } from './api';

export const MILESTONES = [
  'Meeting Completed',
  'Mockup Completed',
  'Design Approved',
  'Website Completed',
  'Payment Completed',
  'Website is Live',
] as const;

// In-progress labels shown on the client tracker while a milestone is still
// pending; each row switches to its MILESTONES label once completed.
export const MILESTONES_PENDING = [
  'Awaiting Meeting',
  'Designing Mockup',
  'Waiting for Review',
  'Building Website',
  'Awaiting Payment',
  'Preparing for Launch',
] as const;

// 1-based milestone numbers (values of milestone_index once complete).
export const MILESTONE = {
  meeting: 1,
  mockup: 2,
  approved: 3,
  website: 4,
  payment: 5,
  live: 6,
} as const;

export function isMilestoneDone(lead: Lead, milestone: number): boolean {
  return lead.milestone_index >= milestone;
}

/** A mockup has been sent and is waiting on the client's approve/request-changes. */
export function isAwaitingDesignReview(lead: Lead): boolean {
  return (
    lead.milestone_index === MILESTONE.mockup &&
    !!lead.mockup_url &&
    !lead.revision_feedback
  );
}

/**
 * The client-facing status line, derived from the highest completed milestone
 * (plus the in-between mockup-review state, which lives on mockup_url rather
 * than the index — "Mockup Completed" stays unchecked until approval).
 */
export function projectStatusText(lead: Lead): string {
  if (isMilestoneDone(lead, MILESTONE.live)) return 'Website is Live! 🎉';
  if (isMilestoneDone(lead, MILESTONE.payment)) return 'Preparing for Launch';
  if (isMilestoneDone(lead, MILESTONE.website)) return 'Awaiting Final Payment';
  if (isMilestoneDone(lead, MILESTONE.approved)) return 'Website Building';
  if (isMilestoneDone(lead, MILESTONE.meeting)) {
    if (isAwaitingDesignReview(lead)) return 'Awaiting Design Review';
    if (lead.revision_feedback) return 'Redesigning Mockup';
    return 'Mockup Designing';
  }
  return 'Waiting for Meeting';
}
