
import React from 'react';
import { Position, PositionCategory, Member } from './types';

export const POSITIONS: Position[] = [
  { id: 'sec', title: 'Secretary', category: PositionCategory.EXECUTIVE, description: 'Maintain records and documentation.', isElected: true, status: 'OPEN' },
  { id: 'trs', title: 'Treasurer', category: PositionCategory.EXECUTIVE, description: 'Financial management and reporting.', isElected: true, status: 'OPEN' },
  { id: 'csd', title: 'Club Service Director', category: PositionCategory.DIRECTOR, description: 'Welfare and engaging meetings.', isElected: true, status: 'OPEN' },
  { id: 'com', title: 'Community Service Director', category: PositionCategory.DIRECTOR, description: 'Identify and lead sustainable projects.', isElected: true, status: 'OPEN' },
  { id: 'pdd', title: 'Professional Development Director', category: PositionCategory.DIRECTOR, description: 'Member learning and guest speakers.', isElected: true, status: 'OPEN' },
  { id: 'isd', title: 'International Service Director', category: PositionCategory.DIRECTOR, description: 'Global club partnerships.', isElected: true, status: 'OPEN' },
  { id: 'mem', title: 'Membership Director', category: PositionCategory.DIRECTOR, description: 'Recruitment and retention.', isElected: true, status: 'OPEN' },
  { id: 'prd', title: 'Public Relations Director', category: PositionCategory.DIRECTOR, description: 'Visibility and branding.', isElected: true, status: 'OPEN' },
  { id: 'pn', title: 'President-Nominee', category: PositionCategory.SUCCESSION, description: 'Future President (2028/29).', isElected: true, status: 'OPEN' },
  { id: 'pnd', title: 'President-Nominee Designate', category: PositionCategory.SUCCESSION, description: 'Future President (2029/30).', isElected: true, status: 'OPEN' }
];

export const MOCK_MEMBERS: Member[] = [
  { id: 'm1', name: 'John Doe', rotaryId: '1234567', email: 'john@rotaract.org', phone: '+254700000001', isGoodStanding: true, role: 'MEMBER' },
  { id: 'm2', name: 'Jane Smith', rotaryId: '2345678', email: 'jane@rotaract.org', phone: '+254700000002', isGoodStanding: true, role: 'MEMBER' },
  { id: 'm3', name: 'Peter Omondi', rotaryId: '3456789', email: 'peter@rotaract.org', phone: '+254700000003', isGoodStanding: true, role: 'MEMBER' },
  { id: 'm4', name: 'Mary Wanjiru', rotaryId: '4567890', email: 'mary@rotaract.org', phone: '+254700000004', isGoodStanding: true, role: 'MEMBER' },
  { id: 'm5', name: 'Sarah Njeri', rotaryId: '5678901', email: 'sarah@rotaract.org', phone: '+254700000005', isGoodStanding: true, role: 'MEMBER' },
  { id: 'm6', name: 'David Kamau', rotaryId: '6789012', email: 'david@rotaract.org', phone: '+254700000006', isGoodStanding: true, role: 'COMMITTEE' }
];
