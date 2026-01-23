
export enum PositionCategory {
  EXECUTIVE = 'EXECUTIVE',
  DIRECTOR = 'DIRECTOR',
  SUCCESSION = 'SUCCESSION'
}

export type UserRole = 'MEMBER' | 'COMMITTEE';

export interface Position {
  id: string;
  title: string;
  category: PositionCategory;
  description: string;
  isElected: boolean;
  status: 'OPEN' | 'FILLED' | 'APPOINTED';
}

export interface Member {
  id: string;
  name: string;
  rotaryId: string;
  email: string;
  phone: string;
  isGoodStanding: boolean;
  role: UserRole;
}

export interface Nomination {
  id: string;
  nominatorId: string;
  nomineeId: string;
  positionId: string;
  statement?: string;
  timestamp: number;
  isSelfNomination: boolean;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface DashboardStats {
  totalMembers: number;
  totalNominations: number;
  participationRate: number;
  qualifiedCandidates: number;
}
