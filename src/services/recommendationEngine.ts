import {
  Opportunity,
  LifeParticipationGraph,
  QualifyingRelevanceBasis,
  RelevanceBasis,
  PurposeType,
} from '../types';
import { OPPORTUNITY_CATALOG } from '../data/opportunities';

export interface ScoredOpportunity {
  opportunity: Opportunity;
  score: number;
  qualifyingBases: QualifyingRelevanceBasis[];
  relevanceBasis: RelevanceBasis;
  scoreBeforeFeatured: number;
  featuredAdjustment: string;
  pipelineInsight: {
    relevanceSource: string;
    contextReason: string;
    trustRequirement: string;
    repeatStatus: string;
    accessibilityStatus: string;
    featuredEffect: string;
  };
}

export interface RecommendationPipelineResult {
  topOpportunities: Opportunity[];
  evaluatedCatalog: ScoredOpportunity[];
  rejectedCount: number;
  debugReport: string[];
}

/**
 * Deterministic recommendation engine implementing the strict 6-step pipeline:
 * Step 1 — Determine qualifying relevance (identifies legitimate relevance bases)
 * Step 2 — Hard suitability filters (accessibility conflicts, explicit dislikes)
 * Step 3 — High-stakes trust boundary (verifies accredited providers for financial, legal, medical, health)
 * Step 4 — Repeat-policy suppression (milestone-once, one-off, finished series)
 * Step 5 — Fit scoring and ranking (relevance strength, barrier resolution, accessibility, social fit, proximity, language)
 * Step 6 — Featured adjustment (modest boost applied ONLY among qualifying relevant candidates)
 */
export function runRecommendationPipeline(
  graph: LifeParticipationGraph,
  catalog: Opportunity[] = OPPORTUNITY_CATALOG,
  activeContextPrompt?: string
): RecommendationPipelineResult {
  const debugReport: string[] = [];
  const scoredList: ScoredOpportunity[] = [];
  let rejectedCount = 0;

  // Normalized graph lookups (lowercase for robust deterministic matching)
  const interests = (graph.interests || []).map((i) => i.toLowerCase());
  const barriers = (graph.participationBarriers || []).map((b) => b.toLowerCase());
  const accessibility = (graph.accessibilityPreferences || []).map((a) => a.toLowerCase());
  const purposeDrivers = (graph.purposeDrivers || []).map((p) => p.toLowerCase());
  const contextualSignals = (graph.contextualSignals || []).map((c) => c.toLowerCase());
  const completedTopicKeys = new Set(graph.completedTopicKeys || []);
  const completedOppIds = new Set(graph.completedOpportunityIds || []);
  const dislikes = (graph.dislikes || []).map((d) => d.toLowerCase());
  const userLanguages = (graph.profile?.languages || []).map((l) => l.toLowerCase());
  const lifeStage = (graph.profile?.lifeStage || '').toLowerCase();
  const contextPrompt = (activeContextPrompt || '').toLowerCase();
  const history = graph.recentOpportunityHistory || [];
  const sessionInterests = (graph.sessionInsights?.interests || []).map((i) => i.toLowerCase());
  const sessionBarriers = (graph.sessionInsights?.participationBarriers || []).map((b) => b.toLowerCase());
  const sessionPurpose = (graph.sessionInsights?.purposeDrivers || []).map((p) => p.toLowerCase());
  const sessionSignals = (graph.sessionInsights?.contextualSignals || []).map((c) => c.toLowerCase());
  const hasSessionInterestFocus = sessionInterests.length > 0;
  const sessionTalksRetirement =
    sessionSignals.some(
      (c) => c.includes('retire') || c.includes('cpf') || c.includes('lpa') || c.includes('financial')
    ) ||
    (contextPrompt &&
      (contextPrompt.includes('retire') ||
        contextPrompt.includes('cpf') ||
        contextPrompt.includes('公积金') ||
        contextPrompt.includes('lpa') ||
        contextPrompt.includes('养老金')));
  // When Talk produced new interests, score from those — not the canned demo profile.
  const interestsForMatch = hasSessionInterestFocus ? sessionInterests : interests;
  const barriersForMatch = hasSessionInterestFocus
    ? sessionBarriers.length > 0
      ? sessionBarriers
      : barriers
    : barriers;
  const purposeForMatch = hasSessionInterestFocus
    ? sessionPurpose.length > 0
      ? sessionPurpose
      : purposeDrivers
    : purposeDrivers;
  const signalsForMatch = hasSessionInterestFocus && !sessionTalksRetirement ? sessionSignals : contextualSignals;
  const lifeStageForMatch = hasSessionInterestFocus && !sessionTalksRetirement ? '' : lifeStage;

  for (const opp of catalog) {
    const oppTitle = opp.titleEn.toLowerCase() + ' ' + opp.titleZh.toLowerCase();
    const oppTopics = opp.topics.map((t) => t.toLowerCase());
    const oppTriggers = opp.contextTriggers.map((c) => c.toLowerCase());
    const oppIntensity = opp.physicalIntensity.toLowerCase();

    // =========================================================================
    // STEP 1 — DETERMINE QUALIFYING RELEVANCE
    // An opportunity MUST possess at least one genuine qualifying relevance basis.
    // Language match, proximity, provider trust, and featured status are NOT qualifying bases.
    // =========================================================================
    const qualifyingBases: QualifyingRelevanceBasis[] = [];
    let relevanceSource = '';
    let contextReason = '';

    // 1. Expressed Interest Match
    const matchesExpressedInterest =
      interestsForMatch.some((interest) =>
        oppTopics.some((t) => interest.includes(t) || t.includes(interest)) ||
        oppTitle.includes(interest) ||
        (interest.includes('dance') && oppTopics.includes('ballroom_dancing')) ||
        (interest.includes('garden') && oppTopics.includes('gardening')) ||
        (interest.includes('tea') && oppTopics.includes('tea_gathering')) ||
        (interest.includes('song') && oppTopics.includes('nostalgic_singing'))
      ) ||
      (contextPrompt &&
        (contextPrompt.includes('dance') || contextPrompt.includes('music') || contextPrompt.includes('waltz') || contextPrompt.includes('ballroom') || contextPrompt.includes('dancing') ||
         contextPrompt.includes('跳舞') || contextPrompt.includes('华尔兹') || contextPrompt.includes('国标') || contextPrompt.includes('老歌') || contextPrompt.includes('金曲')) &&
        (oppTopics.includes('ballroom_dancing') || oppTopics.includes('nostalgic_music') || oppTopics.includes('social_dance')));

    if (matchesExpressedInterest && opp.purposeType === 'lifestyle_social') {
      qualifyingBases.push('expressed_interest');
      relevanceSource = 'Direct match with stated interests and lifelong passions';
      contextReason = 'Aligns with familiar comfort, enjoyable melodies, and relaxed social connection';
    }

    // 2. Life-Stage Context Match (Retirement transition, official education, healthcare guidance)
    const isCpfTopic = opp.id === 'opp-cpf-foundations' || oppTopics.includes('cpf_education');
    const isHealthcareTopic = opp.id === 'opp-joint-health-mobility' || oppTopics.includes('joint_health_education') || oppTopics.includes('healthcare_basics');
    
    const matchesCpfLifeStage =
      isCpfTopic &&
      (signalsForMatch.some((c) => c.includes('cpf') || c.includes('financial_safety') || c.includes('retirement_planning_info_potential')) ||
       (contextPrompt &&
        (contextPrompt.includes('cpf') || contextPrompt.includes('payout') || contextPrompt.includes('stock') || contextPrompt.includes('invest') || contextPrompt.includes('insurance') ||
         contextPrompt.includes('公积金') || contextPrompt.includes('股票') || contextPrompt.includes('保险') || contextPrompt.includes('理财') || contextPrompt.includes('养老金') || contextPrompt.includes('退休金') || contextPrompt.includes('领钱'))));

    const matchesHealthcareLifeStage =
      isHealthcareTopic &&
      (signalsForMatch.some((c) => c.includes('joint_care') || c.includes('healthcare')) ||
       (contextPrompt &&
        (contextPrompt.includes('joint') || contextPrompt.includes('knee') || contextPrompt.includes('mobility') || contextPrompt.includes('physiotherapy') || contextPrompt.includes('health talk') ||
         contextPrompt.includes('关节') || contextPrompt.includes('膝盖') || contextPrompt.includes('保养') || contextPrompt.includes('诊所') || contextPrompt.includes('健康讲座'))));

    const matchesGeneralLifeStage =
      !isCpfTopic && !isHealthcareTopic && opp.purposeType === 'life_stage_learning' &&
      (lifeStageForMatch.includes('retire') || signalsForMatch.some((c) => c.includes('retire')));

    const matchesLifeStageContext = matchesCpfLifeStage || matchesHealthcareLifeStage || matchesGeneralLifeStage;

    if (matchesLifeStageContext) {
      qualifyingBases.push('life_stage_context');
      if (!relevanceSource) {
        relevanceSource = isHealthcareTopic
          ? 'Accredited public healthcare education for senior wellbeing'
          : 'Potential: Timely milestone for life-stage learning & planning';
        contextReason = isHealthcareTopic
          ? 'Polyclinic and HPB certified health education without commercial sales'
          : 'Provides structured, accredited non-commercial education for retirement and wellbeing';
      }
    }

    // 3. Purpose Fit Match (Mentorship, Peer Sharing, Contribution)
    const matchesPurposeFit =
      (purposeForMatch.some((driver) =>
        oppTopics.some((t) => driver.includes(t) || t.includes(driver)) ||
        (driver.includes('mentor') && opp.topics.includes('mentoring')) ||
        (driver.includes('help') && opp.socialStyle.includes('supportive'))
      ) ||
      (contextPrompt &&
        (contextPrompt.includes('mentor') || contextPrompt.includes('share') || contextPrompt.includes('youth') || contextPrompt.includes('management') || contextPrompt.includes('staff') ||
         contextPrompt.includes('年轻人') || contextPrompt.includes('分享') || contextPrompt.includes('后辈') || contextPrompt.includes('经验') || contextPrompt.includes('指导')))) &&
      opp.purposeType === 'contribution_purpose';

    if (matchesPurposeFit) {
      qualifyingBases.push('purpose_fit');
      if (!relevanceSource) {
        relevanceSource = 'Taps into desire to give back and share career/life experience';
        contextReason = 'Validates life expertise and creates intergenerational connections';
      }
    }

    // 4. Discovery Need Match (Craving novelty, routine diversification)
    const hasRoutineHistory = history.length >= 2 && history.every((h) => h.purposeType === 'lifestyle_social');
    const matchesDiscoveryNeed =
      (signalsForMatch.some((c) => c.includes('novelty') || c.includes('discovery') || c.includes('craving_variety') || c.includes('something_different')) ||
       hasRoutineHistory ||
       (contextPrompt &&
        (contextPrompt.includes('something different') || contextPrompt.includes('new') || contextPrompt.includes('try') || contextPrompt.includes('craft') || contextPrompt.includes('novelty') ||
         contextPrompt.includes('新鲜') || contextPrompt.includes('手作') || contextPrompt.includes('咖啡') || contextPrompt.includes('拉花') || contextPrompt.includes('新东西') || contextPrompt.includes('不一样的')))) &&
      opp.purposeType === 'discovery_experience';

    if (matchesDiscoveryNeed) {
      qualifyingBases.push('discovery_need');
      if (!relevanceSource) {
        relevanceSource = 'Curated discovery outing for creative variety and fresh experiences';
        contextReason = 'Introduces refreshing hands-on craft outside daily routine';
      }
    }

    // 5. Capability Need Match (Digital confidence, practical everyday independence)
    const matchesCapabilityNeed =
      (signalsForMatch.some((c) => c.includes('digital_struggle') || c.includes('scam_safety') || c.includes('smartphone') || c.includes('capability_need')) ||
       barriersForMatch.some((b) => b.includes('digital') || b.includes('technology') || b.includes('phone')) ||
       (contextPrompt &&
        (contextPrompt.includes('phone') || contextPrompt.includes('digital') || contextPrompt.includes('whatsapp') || contextPrompt.includes('scam') ||
         contextPrompt.includes('手机') || contextPrompt.includes('数码') || contextPrompt.includes('防诈') || contextPrompt.includes('扫码') || contextPrompt.includes('用手机')))) &&
      opp.purposeType === 'capability_independence';

    if (matchesCapabilityNeed) {
      qualifyingBases.push('capability_need');
      if (!relevanceSource) {
        relevanceSource = 'Practical digital confidence and everyday independence clinic';
        contextReason = 'Empowers independent living in the neighborhood with patient 1-on-1 guidance';
      }
    }

    // 6. Participation Barrier Resolution Fit (Doorway welcome buddy)
    const matchesBarrierResolution =
      barriersForMatch.some((b) => b.includes('unfamiliar') || b.includes('alone') || b.includes('isolated') || b.includes('hesitant')) &&
      opp.socialStyle.includes('welcoming_buddy');

    if (matchesBarrierResolution) {
      qualifyingBases.push('participation_barrier');
      contextReason += ' + Includes doorway greeter to eliminate entrance anxiety';
    }

    const natureInterestTokens = ['horse', 'horses', 'animal', 'animals', 'pet', 'pets', 'bird', 'birds', 'nature', 'zoo', 'farm', '马', '动物', '宠物', '鸟', '自然'];
    const isNatureInterest =
      interestsForMatch.some((interest) => natureInterestTokens.some((token) => interest.includes(token))) ||
      (contextPrompt && natureInterestTokens.some((token) => contextPrompt.includes(token)));

    if (
      isNatureInterest &&
      opp.purposeType === 'lifestyle_social' &&
      (oppTopics.includes('gardening') || oppTopics.includes('morning_walk') || oppTopics.includes('tea_gathering')) &&
      !qualifyingBases.includes('expressed_interest')
    ) {
      qualifyingBases.push('expressed_interest');
      if (!relevanceSource) {
        relevanceSource = 'Direct match with stated interests in animals, nature, or outdoor life';
        contextReason = 'A gentle garden setting close to home that fits a love of animals and the outdoors';
      }
    }

    if (
      isNatureInterest &&
      opp.purposeType === 'discovery_experience' &&
      (oppTopics.includes('nature_discovery') || oppTopics.includes('soundscape') || oppTopics.includes('heritage_trees') || opp.id === 'opp-botanic-soundwalk') &&
      !qualifyingBases.includes('discovery_need')
    ) {
      qualifyingBases.push('discovery_need');
      if (!relevanceSource) {
        relevanceSource = 'Nature discovery outing matching a love of animals and the outdoors';
        contextReason = 'A calm guided walk among trees, birdsong, and open green space';
      }
    }

    // Eligibility check: Candidate must possess at least one qualifying relevance basis
    if (qualifyingBases.length === 0) {
      rejectedCount++;
      debugReport.push(`[REJECTED - Step 1 Ineligible: No qualifying relevance basis] ${opp.titleEn}`);
      continue;
    }

    const primaryRelevanceBasis = qualifyingBases[0];

    // =========================================================================
    // STEP 2 — HARD SUITABILITY FILTERS (Barriers & Explicit Dislikes)
    // =========================================================================
    let hardFilterReason: string | null = null;

    // Check physical intensity conflicts with stated mobility constraints
    const hasKneeOrLowImpactConstraint =
      barriers.some((b) => b.includes('knee') || b.includes('low impact') || b.includes('strain') || b.includes('tired')) ||
      accessibility.some((a) => a.includes('low impact') || a.includes('gentle') || a.includes('seated'));

    if (
      hasKneeOrLowImpactConstraint &&
      (oppIntensity.includes('high intensity') ||
        oppIntensity.includes('fast running') ||
        oppIntensity.includes('jumping') ||
        opp.topics.includes('competitive_sports') ||
        opp.topics.includes('badminton'))
    ) {
      hardFilterReason = 'Physical intensity conflicts with knee/low-impact accessibility preference';
    }

    // Check explicit dislikes
    for (const dislike of dislikes) {
      if (
        oppTitle.includes(dislike) ||
        oppTopics.some((t) => t.includes(dislike)) ||
        (dislike.includes('jumping') && oppIntensity.includes('jumping')) ||
        (dislike.includes('commercial') && (!opp.verifiedProvider || opp.socialStyle.includes('aggressive_sales')))
      ) {
        hardFilterReason = `Matches explicit user dislike: ${dislike}`;
        break;
      }
    }

    if (hardFilterReason) {
      rejectedCount++;
      debugReport.push(`[REJECTED - Step 2 Hard Filter] ${opp.titleEn}: ${hardFilterReason}`);
      continue;
    }

    // =========================================================================
    // STEP 3 — HIGH-STAKES TRUST BOUNDARY (Financial, Legal, Medical, Healthcare)
    // High-stakes topics strictly require verified, accredited public providers.
    // =========================================================================
    const isHighStakes =
      oppTopics.some((t) =>
        t.includes('cpf') ||
        t.includes('estate') ||
        t.includes('lpa') ||
        t.includes('legal') ||
        t.includes('financial') ||
        t.includes('medical') ||
        t.includes('healthcare') ||
        t.includes('diagnosis') ||
        t.includes('treatment') ||
        t.includes('medication') ||
        t.includes('supplement') ||
        t.includes('chronic_disease') ||
        t.includes('joint_health')
      ) ||
      oppTriggers.some((tr) =>
        tr.includes('cpf') ||
        tr.includes('legal') ||
        tr.includes('financial') ||
        tr.includes('healthcare') ||
        tr.includes('joint_care')
      );

    if (isHighStakes && !opp.verifiedProvider) {
      rejectedCount++;
      debugReport.push(`[REJECTED - Step 3 High Stakes Trust] ${opp.titleEn}: Unverified provider for high-stakes topic`);
      continue;
    }

    // =========================================================================
    // STEP 4 — REPEAT-POLICY SUPPRESSION (Milestone Once, One-Off, Completed Series)
    // =========================================================================
    let repeatStatus = 'Eligible (New/Repeatable)';
    let isSuppressedByRepeat = false;

    if (opp.participationPattern === 'milestone_once' && opp.repeatTopicKey) {
      if (completedTopicKeys.has(opp.repeatTopicKey)) {
        isSuppressedByRepeat = true;
        repeatStatus = `Suppressed: Milestone topic '${opp.repeatTopicKey}' already completed`;
      }
    } else if (opp.participationPattern === 'one_off') {
      if (completedOppIds.has(opp.id)) {
        isSuppressedByRepeat = true;
        repeatStatus = `Suppressed: One-off event '${opp.id}' already completed`;
      }
    } else if (opp.participationPattern === 'series' && opp.repeatTopicKey) {
      const activeSeries = graph.currentSeries?.find((s) => s.seriesId === opp.repeatTopicKey);
      if (activeSeries?.status === 'completed') {
        isSuppressedByRepeat = true;
        repeatStatus = `Suppressed: Series '${opp.repeatTopicKey}' already finished`;
      }
    }

    if (isSuppressedByRepeat) {
      rejectedCount++;
      debugReport.push(`[REJECTED - Step 4 Repeat Policy] ${opp.titleEn}: ${repeatStatus}`);
      continue;
    }

    // =========================================================================
    // STEP 5 — FIT SCORING AND RANKING
    // Score based on relevance strength, barrier resolution, accessibility, social fit, proximity, language.
    // =========================================================================
    let fitScore = 0;

    // Primary qualifying basis weight
    if (primaryRelevanceBasis === 'life_stage_context') fitScore += 70;
    else if (primaryRelevanceBasis === 'expressed_interest') fitScore += 65;
    else if (primaryRelevanceBasis === 'purpose_fit') fitScore += 65;
    else if (primaryRelevanceBasis === 'discovery_need') fitScore += 60;
    else if (primaryRelevanceBasis === 'capability_need') fitScore += 60;
    else if (primaryRelevanceBasis === 'participation_barrier') fitScore += 50;

    // Additional points for secondary qualifying bases
    if (qualifyingBases.length > 1) {
      fitScore += (qualifyingBases.length - 1) * 15;
    }

    // Direct Spoken Context Prompt Alignment Boost
    if (contextPrompt) {
      if (
        (contextPrompt.includes('dance') || contextPrompt.includes('dancing') || contextPrompt.includes('waltz') || contextPrompt.includes('ballroom') ||
         contextPrompt.includes('跳舞') || contextPrompt.includes('华尔兹') || contextPrompt.includes('国标') || contextPrompt.includes('老歌') || contextPrompt.includes('金曲')) &&
        (opp.topics.includes('ballroom_dancing') || opp.topics.includes('nostalgic_music') || opp.topics.includes('social_dance'))
      ) {
        fitScore += 20;
        // Specific weekend trigger match
        if ((contextPrompt.includes('周末') || contextPrompt.includes('weekend')) && (opp.contextTriggers.includes('weekend') || opp.timing.toLowerCase().includes('saturday') || opp.timing.toLowerCase().includes('sunday'))) {
          fitScore += 15;
        }
      } else if (
        (contextPrompt.includes('cpf') || contextPrompt.includes('公积金') || contextPrompt.includes('payout') || contextPrompt.includes('股票') || contextPrompt.includes('保险') || contextPrompt.includes('理财') || contextPrompt.includes('养老金')) &&
        (opp.topics.includes('cpf_education') || opp.id === 'opp-cpf-foundations')
      ) {
        fitScore += 25;
      } else if (
        (contextPrompt.includes('joint') || contextPrompt.includes('knee') || contextPrompt.includes('mobility') || contextPrompt.includes('关节') || contextPrompt.includes('膝盖') || contextPrompt.includes('保养') || contextPrompt.includes('健康讲座')) &&
        (opp.topics.includes('joint_health_education') || opp.id === 'opp-joint-health-mobility')
      ) {
        fitScore += 25;
      } else if (
        (contextPrompt.includes('mentor') || contextPrompt.includes('年轻人') || contextPrompt.includes('分享') || contextPrompt.includes('带过') || contextPrompt.includes('新人') || contextPrompt.includes('经验') || contextPrompt.includes('指导')) &&
        opp.purposeType === 'contribution_purpose'
      ) {
        fitScore += 20;
        // Specific youth/career guidance match
        if (
          (contextPrompt.includes('年轻人') || contextPrompt.includes('青年') || contextPrompt.includes('youth') || contextPrompt.includes('career') || contextPrompt.includes('公司') || contextPrompt.includes('新人')) &&
          (opp.topics.includes('youth_development') || opp.topics.includes('career_experience') || opp.id === 'opp-youth-mentor')
        ) {
          fitScore += 15;
        }
      } else if (
        (contextPrompt.includes('different') || contextPrompt.includes('新鲜') || contextPrompt.includes('手作') || contextPrompt.includes('不一样')) &&
        opp.purposeType === 'discovery_experience'
      ) {
        fitScore += 20;
      } else if (
        (contextPrompt.includes('phone') || contextPrompt.includes('手机') || contextPrompt.includes('数码') || contextPrompt.includes('whatsapp') || contextPrompt.includes('诈骗')) &&
        opp.purposeType === 'capability_independence'
      ) {
        fitScore += 20;
      }
    }

    if (
      isNatureInterest &&
      (opp.topics.includes('nature_discovery') || opp.id === 'opp-botanic-soundwalk' || opp.topics.includes('gardening'))
    ) {
      fitScore += opp.id === 'opp-botanic-soundwalk' ? 28 : 8;
    }

    // Barrier resolution fit (e.g. Doorway greeter for alone/unfamiliar barrier)
    if (
      barriers.some((b) => b.includes('unfamiliar') || b.includes('alone') || b.includes('isolated')) &&
      opp.socialStyle.includes('welcoming_buddy')
    ) {
      fitScore += 18;
    }

    // Accessibility & physical comfort fit
    if (
      opp.physicalIntensity.toLowerCase().includes('gentle') ||
      opp.physicalIntensity.toLowerCase().includes('seated') ||
      opp.physicalIntensity.toLowerCase().includes('stroll')
    ) {
      fitScore += 14;
    }

    // Proximity / Neighborhood Fit (Heartland location)
    if (opp.location.toLowerCase().includes('toa payoh')) {
      fitScore += 12;
    } else if (opp.location.toLowerCase().includes('bishan')) {
      fitScore += 8;
    }

    // Language Comfort Fit
    const matchesLanguage = opp.languages.some((l) =>
      userLanguages.some((ul) => ul.includes(l.toLowerCase()) || l.toLowerCase().includes(ul))
    );
    if (matchesLanguage) {
      fitScore += 8;
    }

    const scoreBeforeFeatured = fitScore;

    // =========================================================================
    // STEP 6 — FEATURED ADJUSTMENT (INTEGRITY RULE)
    // Modest boost (+18%) applied ONLY to qualifying relevant candidates.
    // =========================================================================
    let featuredEffect = 'None (Standard catalog item)';
    let finalScore = fitScore;

    if (opp.featured) {
      finalScore = Math.round(fitScore * 1.18);
      featuredEffect = `Boosted (+18%): Modest boost applied to qualifying relevant candidate (Base: ${scoreBeforeFeatured} -> Final: ${finalScore})`;
    }

    const trustRequirement =
      isHighStakes
        ? `Verified ${opp.providerType.toUpperCase()} provider · High-Stakes Educational Resource (No Commercial/Financial/Medical Claims)`
        : `Community Verified: ${opp.provider}`;

    const accessibilityStatus =
      opp.physicalIntensity.toLowerCase().includes('gentle') ||
      opp.physicalIntensity.toLowerCase().includes('seated') ||
      opp.physicalIntensity.toLowerCase().includes('stroll')
        ? 'Passed: Low impact & seated rest-friendly'
        : 'Standard physical requirement';

    const evaluatedOpp: Opportunity = {
      ...opp,
      relevanceBasis: primaryRelevanceBasis,
      pipelineInsight: {
        relevanceSource: relevanceSource || 'Algorithmic contextual fit',
        contextReason: contextReason || 'Matches active life participation preferences',
        trustRequirement,
        repeatStatus,
        accessibilityStatus,
        featuredEffect,
      },
    };

    scoredList.push({
      opportunity: evaluatedOpp,
      score: finalScore,
      qualifyingBases,
      relevanceBasis: primaryRelevanceBasis,
      scoreBeforeFeatured,
      featuredAdjustment: featuredEffect,
      pipelineInsight: evaluatedOpp.pipelineInsight!,
    });
  }

  // Sort descending by score
  scoredList.sort((a, b) => b.score - a.score);

  const topOpportunities = scoredList.map((s) => s.opportunity);

  return {
    topOpportunities,
    evaluatedCatalog: scoredList,
    rejectedCount,
    debugReport,
  };
}

/**
 * Returns dynamic recommendation title / framing based on purpose type.
 */
export function getPurposeFraming(purposeType: PurposeType): {
  headlineEn: string;
  headlineZh: string;
  badgeEn: string;
  badgeZh: string;
} {
  switch (purposeType) {
    case 'lifestyle_social':
      return {
        headlineEn: 'I found something you may enjoy',
        headlineZh: '为你挑选的舒适活动',
        badgeEn: 'Lifestyle & Social',
        badgeZh: '社交与生活',
      };
    case 'life_stage_learning':
      return {
        headlineEn: 'Potential: Understanding relevant information for retirement & wellbeing',
        headlineZh: '潜在建议：了解退休规划与健康常识客观资讯',
        badgeEn: 'Potential · Life-Stage Learning',
        badgeZh: '潜在建议 · 人生阶段学习',
      };
    case 'contribution_purpose':
      return {
        headlineEn: 'I found somewhere your experience could be useful',
        headlineZh: '发挥宝贵阅历的经验分享与互助',
        badgeEn: 'Contribution & Purpose',
        badgeZh: '奉献与价值',
      };
    case 'discovery_experience':
      return {
        headlineEn: 'I found something different you could try',
        headlineZh: '为你推荐的全新体验',
        badgeEn: 'Discovery & Novelty',
        badgeZh: '探索与新体验',
      };
    case 'capability_independence':
      return {
        headlineEn: 'This could make everyday things a little easier',
        headlineZh: '让日常生活更轻松的实用技能',
        badgeEn: 'Capability & Independence',
        badgeZh: '独立与技能掌握',
      };
  }
}
