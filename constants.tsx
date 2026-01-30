
import React from 'react';
import { Position, PositionCategory, Member } from './types';

export const ELECTION_SCHEDULE = {
  OPEN_DATE: '2026-01-23T19:00:00+03:00', // Today 7pm
  CLOSE_DATE: '2026-01-25T19:00:00+03:00', // 48 hours later Sunday 7pm
};

export const VOTING_SCHEDULE = {
  OPEN_DATE: '2026-01-28T20:30:00+03:00', // Today 8:30pm
  CLOSE_DATE: '2026-01-30T20:30:00+03:00', // Friday 8.30pm
};

export const POSITIONS: Position[] = [
  // Executive Board & Directors
  { id: 'sec', title: 'Secretary', category: PositionCategory.EXECUTIVE, description: 'Maintains minutes, membership records, and coordinates club documentation.', isElected: true, status: 'OPEN' },
  { id: 'trs', title: 'Treasurer/Finance Director', category: PositionCategory.EXECUTIVE, description: 'Manages club funds, collects dues, and reports on financial health.', isElected: true, status: 'OPEN' },
  { id: 'com_svc', title: 'Community Service/Projects Director', category: PositionCategory.DIRECTOR, description: 'Responsible for community needs assessments and developing sustainable project plans.', isElected: true, status: 'OPEN' },
  { id: 'club_svc', title: 'Club Service & PLD Director', category: PositionCategory.DIRECTOR, description: 'Focuses on member engagement, welfare, and professional/leadership development (combined for synergy).', isElected: true, status: 'OPEN' },
  { id: 'mem', title: 'Membership Director', category: PositionCategory.DIRECTOR, description: 'Tasked with recruitment, onboarding, and tracking membership data to sustain growth.', isElected: true, status: 'OPEN' },
  { id: 'pr', title: 'Public Relations and Communications Director', category: PositionCategory.DIRECTOR, description: 'Enhances club visibility and ensures adherence to Rotary branding and ethical standards.', isElected: true, status: 'OPEN' },
  { id: 'fund_trf', title: 'Fundraising, TRF Director & SAA', category: PositionCategory.DIRECTOR, description: 'Manages financial needs, corporate partnerships, and The Rotary Foundation (TRF) mobilization while overseeing meeting order.', isElected: true, status: 'OPEN' },
  { id: 'intl', title: 'International Service Director', category: PositionCategory.DIRECTOR, description: 'Establishes and maintains relationships with other local and international Rotary/Rotaract clubs.', isElected: true, status: 'OPEN' },
  { id: 'new_gen', title: 'New Generations Director', category: PositionCategory.DIRECTOR, description: 'Supports current Interact clubs and explores chartering new ones.', isElected: true, status: 'OPEN' },
  { id: 'gov_dei', title: 'Governance, Ethics, and DEI Director', category: PositionCategory.DIRECTOR, description: 'Ensures compliance with bylaws and implements Diversity, Equity, and Inclusion initiatives (combined for consistent policy enforcement).', isElected: true, status: 'OPEN' },

  // Succession
  { id: 'pn', title: 'President Nominee (PN)', category: PositionCategory.SUCCESSION, description: 'To take over as President in the 2028/2029 year.', isElected: true, status: 'OPEN' },
  { id: 'pnd', title: 'President Nominee Designate (PND)', category: PositionCategory.SUCCESSION, description: 'To take over as President in the 2029/2030 year.', isElected: true, status: 'OPEN' }
];

export const MOCK_MEMBERS: Member[] = [];
