export type ScreenType = 'home' | 'conversation' | 'understanding' | 'recommendation' | 'my-world';

export type ConversationState = 'listening' | 'thinking' | 'speaking' | 'paused';

export type LiveVoiceMode = 'live' | 'fallback';

export type LiveConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface MemoryConsentPrompt {
  id: string;
  itemEn: string;
  itemZh: string;
  category: 'interest' | 'barrier' | 'goal' | 'preference';
}

export type LanguageMode = 'mixed' | 'en' | 'zh';

export type TextScale = 'normal' | 'large';

export type PurposeType =
  | 'lifestyle_social'
  | 'life_stage_learning'
  | 'contribution_purpose'
  | 'discovery_experience'
  | 'capability_independence';

export type ParticipationPattern =
  | 'recurring'
  | 'series'
  | 'occasional_repeatable'
  | 'one_off'
  | 'milestone_once'
  | 'flexible';

export type ProviderType =
  | 'community'
  | 'government'
  | 'healthcare'
  | 'education'
  | 'verified_business'
  | 'volunteer_organisation';

export type RelevanceBasis =
  | 'expressed_interest'
  | 'life_stage_context'
  | 'participation_barrier'
  | 'purpose_fit'
  | 'discovery'
  | 'capability_need';

export interface OpportunityHistoryItem {
  opportunityId: string;
  topicKey?: string;
  purposeType: PurposeType;
  participationPattern: ParticipationPattern;
  action: 'completed' | 'accepted' | 'declined';
  date: string;
}

export interface LifeParticipationGraph {
  profile: {
    name?: string;
    chineseName?: string;
    salutation?: string;
    chineseSalutation?: string;
    age?: number;
    location?: string;
    neighborhood?: string;
    languages: string[];
    lifeStage?: 'approaching_retirement' | 'recently_retired' | 'active_senior' | 'pre_transition' | string;
    bio?: string;
  };
  interests: string[];
  capabilities: string[];
  purposeDrivers: string[];
  importantRelationships: string[];
  socialPreferences: string[];
  participationBarriers: string[];
  accessibilityPreferences: string[];
  activityPreferences: string[];
  contextualSignals: string[];
  completedOpportunityIds: string[];
  completedTopicKeys: string[];
  currentSeries: {
    seriesId: string;
    status: 'not_started' | 'participating' | 'completed';
  }[];
  recentOpportunityHistory: OpportunityHistoryItem[];
  dislikes: string[];
}

export interface PersonaProfile {
  name: string;
  chineseName: string;
  salutation: string;
  chineseSalutation: string;
  age: number;
  location: string;
  neighborhood: string;
  preferredLanguages: string;
  bio: string;
  interests: string[];
  socialPreferences: string;
  barriers: string;
  physicalPreference: string;
}

export interface UnderstandingItem {
  id: string;
  en: string;
  zh: string;
  detailEn: string;
  detailZh: string;
  iconName: 'music' | 'users' | 'heart-handshake' | 'map-pin' | 'book-open' | 'award' | 'sparkles' | 'shield';
  confirmed: boolean;
  category?: 'interest' | 'barrier' | 'life_stage' | 'purpose' | 'capability';
}

export interface DetailedWhyPoint {
  titleEn: string;
  titleZh: string;
  descEn: string;
  descZh: string;
}

export interface Opportunity {
  id: string;
  titleEn: string;
  titleZh: string;
  purposeType: PurposeType;
  participationPattern: ParticipationPattern;
  topics: string[];
  contextTriggers: string[];
  provider: string;
  providerType: ProviderType;
  verifiedProvider: boolean;
  featured: boolean;
  repeatTopicKey?: string | null;
  languages: string[];
  groupSize: string;
  physicalIntensity: string;
  socialStyle: string[];
  contributionType?: string | null;
  location: string;
  locationDetail: string;
  distanceLabel?: string;
  timing: string;
  languagePill: string;
  intensity: string;
  hostName: string;
  hostRole: string;
  whyChosenEn: string;
  whyChosenZh: string;
  detailedWhyPoints: DetailedWhyPoint[];
  relevanceBasis?: RelevanceBasis;
  pipelineInsight?: {
    relevanceSource: string;
    contextReason: string;
    trustRequirement: string;
    repeatStatus: string;
    accessibilityStatus: string;
    featuredEffect: string;
  };
}

// Alias for backwards compatibility with UI components
export type ActivityRecommendation = Opportunity;

export interface MyWorldStats {
  outingsThisMonth: number;
  peopleConnected: number;
  newExperiences: number;
  peopleHelped: number;
}

export interface MyWorldCategory {
  id: string;
  titleEn: string;
  titleZh: string;
  count: number;
  items: {
    nameEn: string;
    nameZh: string;
    tagEn: string;
    tagZh: string;
    noteEn?: string;
  }[];
}

