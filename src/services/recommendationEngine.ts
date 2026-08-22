import {
  Opportunity,
  LifeParticipationGraph,
  RelevanceBasis,
  PurposeType,
} from '../types';
import { OPPORTUNITY_CATALOG } from '../data/opportunities';

export interface ScoredOpportunity {
  opportunity: Opportunity;
  score: number;
  relevanceBasis: RelevanceBasis;
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
 * Deterministic recommendation engine implementing the 6-step pipeline
 * from the Kaki Phase 2 specification.
 */
export function runRecommendationPipeline(
  graph: LifeParticipationGraph,
  catalog: Opportunity[] = OPPORTUNITY_CATALOG,
  activeContextPrompt?: string
): RecommendationPipelineResult {
  const debugReport: string[] = [];
  const scoredList: ScoredOpportunity[] = [];
  let rejectedCount = 0;

  // Normalized graph lookups (lowercase for robust matching)
  const interests = graph.interests.map((i) => i.toLowerCase());
  const barriers = graph.participationBarriers.map((b) => b.toLowerCase());
  const accessibility = graph.accessibilityPreferences.map((a) => a.toLowerCase());
  const purposeDrivers = graph.purposeDrivers.map((p) => p.toLowerCase());
  const contextualSignals = graph.contextualSignals.map((c) => c.toLowerCase());
  const completedTopicKeys = new Set(graph.completedTopicKeys || []);
  const completedOppIds = new Set(graph.completedOpportunityIds || []);
  const dislikes = graph.dislikes.map((d) => d.toLowerCase());
  const userLanguages = graph.profile.languages.map((l) => l.toLowerCase());
  const lifeStage = (graph.profile.lifeStage || '').toLowerCase();
  const contextPrompt = (activeContextPrompt || '').toLowerCase();

  for (const opp of catalog) {
    const oppTitle = opp.titleEn.toLowerCase() + ' ' + opp.titleZh.toLowerCase();
    const oppTopics = opp.topics.map((t) => t.toLowerCase());
    const oppTriggers = opp.contextTriggers.map((c) => c.toLowerCase());
    const oppIntensity = opp.physicalIntensity.toLowerCase();

    // -------------------------------------------------------------
    // STEP 2: HARD FILTER - Unsuitable candidates (Barriers & Dislikes)
    // -------------------------------------------------------------
    let hardFilterReason: string | null = null;

    // Check physical intensity conflicts
    const hasKneeOrLowImpactBarrier =
      barriers.some((b) => b.includes('knee') || b.includes('low impact') || b.includes('strain')) ||
      accessibility.some((a) => a.includes('low impact') || a.includes('gentle') || a.includes('seated'));

    if (
      hasKneeOrLowImpactBarrier &&
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
        (dislike.includes('commercial') && opp.providerType === 'verified_business' && !opp.verifiedProvider)
      ) {
        hardFilterReason = `Matches user dislike: ${dislike}`;
        break;
      }
    }

    if (hardFilterReason) {
      rejectedCount++;
      debugReport.push(`[REJECTED - Filter] ${opp.titleEn}: ${hardFilterReason}`);
      continue;
    }

    // -------------------------------------------------------------
    // STEP 3: HIGH-STAKES BOUNDARY & TRUST RULES
    // -------------------------------------------------------------
    if (opp.purposeType === 'life_stage_learning') {
      const isHighStakes =
        oppTopics.some((t) => t.includes('cpf') || t.includes('estate') || t.includes('lpa') || t.includes('legal') || t.includes('financial')) ||
        oppTriggers.some((tr) => tr.includes('cpf') || tr.includes('legal'));

      if (isHighStakes && !opp.verifiedProvider) {
        rejectedCount++;
        debugReport.push(`[REJECTED - High Stakes Trust] ${opp.titleEn}: Unverified provider for high-stakes topic`);
        continue;
      }
    }

    // -------------------------------------------------------------
    // STEP 4: REPEAT POLICY (Milestone Once, Series, One-Off)
    // -------------------------------------------------------------
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
      debugReport.push(`[REJECTED - Repeat Policy] ${opp.titleEn}: ${repeatStatus}`);
      continue;
    }

    // -------------------------------------------------------------
    // STEP 1: ESTABLISH GENUINE RELEVANCE BASIS
    // -------------------------------------------------------------
    let rawScore = 0;
    let relevanceBasis: RelevanceBasis = 'expressed_interest';
    let relevanceSource = '';
    let contextReason = '';

    // Check Context Prompt overrides (if user specifically asked or spoke in turn)
    if (contextPrompt) {
      if (
        (contextPrompt.includes('cpf') || contextPrompt.includes('retire') || contextPrompt.includes('money') || contextPrompt.includes('payout')) &&
        (opp.topics.includes('cpf_education') || opp.purposeType === 'life_stage_learning')
      ) {
        rawScore += 45;
        relevanceBasis = 'life_stage_context';
        relevanceSource = 'User explicitly inquired about CPF & retirement in conversation';
        contextReason = 'Directly answers current life-stage milestone need';
      } else if (
        (contextPrompt.includes('mentor') || contextPrompt.includes('share') || contextPrompt.includes('youth') || contextPrompt.includes('management') || contextPrompt.includes('staff')) &&
        opp.purposeType === 'contribution_purpose'
      ) {
        rawScore += 45;
        relevanceBasis = 'purpose_fit';
        relevanceSource = 'User expressed wanting to mentor younger generation and share life wisdom';
        contextReason = 'Channels management background into high-value youth mentorship';
      } else if (
        (contextPrompt.includes('something different') || contextPrompt.includes('new') || contextPrompt.includes('try') || contextPrompt.includes('craft') || contextPrompt.includes('novelty')) &&
        opp.purposeType === 'discovery_experience'
      ) {
        rawScore += 45;
        relevanceBasis = 'discovery';
        relevanceSource = 'User requested a novel discovery experience';
        contextReason = 'Introduces refreshing hands-on craft outside daily routine';
      } else if (
        (contextPrompt.includes('phone') || contextPrompt.includes('digital') || contextPrompt.includes('whatsapp') || contextPrompt.includes('scam')) &&
        opp.purposeType === 'capability_independence'
      ) {
        rawScore += 45;
        relevanceBasis = 'capability_need';
        relevanceSource = 'User expressed interest in smartphone confidence';
        contextReason = 'Practical hands-on clinics for digital ease';
      } else if (
        (contextPrompt.includes('dance') || contextPrompt.includes('music') || contextPrompt.includes('waltz') || contextPrompt.includes('ballroom')) &&
        (oppTopics.includes('ballroom_dancing') || oppTopics.includes('nostalgic_music'))
      ) {
        rawScore += 45;
        relevanceBasis = 'expressed_interest';
        relevanceSource = 'User mentioned fond memories of ballroom dancing';
        contextReason = 'Rekindles lifelong passion with comfortable low-impact music';
      }
    }

    // Graph-based relevance matching
    // A. Expressed Interest Match
    const matchesInterest = interests.some((interest) =>
      oppTopics.some((t) => interest.includes(t) || t.includes(interest)) ||
      opp.titleEn.toLowerCase().includes(interest) ||
      (interest.includes('dance') && oppTopics.includes('ballroom_dancing')) ||
      (interest.includes('garden') && oppTopics.includes('gardening')) ||
      (interest.includes('tea') && oppTopics.includes('tea_gathering')) ||
      (interest.includes('song') && oppTopics.includes('nostalgic_singing'))
    );
    if (matchesInterest) {
      rawScore += 30;
      if (!relevanceSource) {
        relevanceBasis = 'expressed_interest';
        relevanceSource = 'Direct match with stated lifelong interests';
        contextReason = 'Aligns with familiar comfort and joyful memories';
      }
    }

    // B. Life Stage Context Match
    const matchesLifeStage =
      (lifeStage.includes('retire') || contextualSignals.some((c) => c.includes('retire'))) &&
      opp.purposeType === 'life_stage_learning';
    if (matchesLifeStage) {
      rawScore += 25;
      if (!relevanceSource) {
        relevanceBasis = 'life_stage_context';
        relevanceSource = 'Timely milestone for retirement transition';
        contextReason = 'Provides structured, non-commercial clarity on CPF and retirement';
      }
    }

    // C. Purpose Fit Match (Mentorship, Giving Back)
    const matchesPurpose = purposeDrivers.some((driver) =>
      oppTopics.some((t) => driver.includes(t) || t.includes(driver)) ||
      (driver.includes('mentor') && opp.topics.includes('mentoring')) ||
      (driver.includes('help') && opp.socialStyle.includes('supportive'))
    );
    if (matchesPurpose && opp.purposeType === 'contribution_purpose') {
      rawScore += 28;
      if (!relevanceSource) {
        relevanceBasis = 'purpose_fit';
        relevanceSource = 'Taps into desire to give back and share career/life experience';
        contextReason = 'Validates life expertise and creates intergenerational connections';
      }
    }

    // D. Barrier Resolution Fit (e.g. Doorway Buddy for unfamiliar rooms)
    if (
      barriers.some((b) => b.includes('unfamiliar') || b.includes('alone') || b.includes('isolated')) &&
      opp.socialStyle.includes('welcoming_buddy')
    ) {
      rawScore += 18;
      contextReason += ' + Includes doorway greeter to eliminate entrance anxiety';
    }

    // E. Proximity / Neighborhood Fit
    if (opp.location.toLowerCase().includes('toa payoh')) {
      rawScore += 12;
    }

    // F. Language Comfort Fit
    const matchesLanguage = opp.languages.some((l) =>
      userLanguages.some((ul) => ul.includes(l.toLowerCase()) || l.toLowerCase().includes(ul))
    );
    if (matchesLanguage) {
      rawScore += 8;
    }

    // Discovery experience baseline if user has active routine
    if (opp.purposeType === 'discovery_experience' && !relevanceSource) {
      relevanceBasis = 'discovery';
      relevanceSource = 'Curated discovery outing for creative variety';
      contextReason = 'Low-friction step into a fresh community craft';
      rawScore += 15;
    }

    // Capability independence baseline
    if (opp.purposeType === 'capability_independence' && !relevanceSource) {
      relevanceBasis = 'capability_need';
      relevanceSource = 'Practical digital confidence clinic';
      contextReason = 'Empowers independent living in the neighborhood';
      rawScore += 14;
    }

    // -------------------------------------------------------------
    // STEP 6: FEATURED WEIGHTING (INTEGRITY RULE)
    // -------------------------------------------------------------
    let featuredEffect = 'None (Standard catalog item)';
    if (opp.featured) {
      if (rawScore > 0) {
        // Legitimate boost for genuine candidate
        rawScore = Math.round(rawScore * 1.18);
        featuredEffect = 'Boosted (+18%): Candidate possesses genuine relevance basis';
      } else {
        // Strict integrity: featured flag NEVER manufactures relevance
        featuredEffect = 'Zero effect: Candidate has 0 baseline relevance';
      }
    }

    if (rawScore > 0) {
      const trustRequirement =
        opp.purposeType === 'life_stage_learning'
          ? `Verified ${opp.providerType.toUpperCase()} provider · High-Stakes Educational Routing (No Commercial/Financial Advice)`
          : `Community Verified: ${opp.provider}`;

      const accessibilityStatus =
        opp.physicalIntensity.toLowerCase().includes('gentle') ||
        opp.physicalIntensity.toLowerCase().includes('seated') ||
        opp.physicalIntensity.toLowerCase().includes('stroll')
          ? 'Passed: Low impact & rest-friendly certified'
          : 'Standard physical requirement';

      const evaluatedOpp: Opportunity = {
        ...opp,
        relevanceBasis,
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
        score: rawScore,
        relevanceBasis,
        pipelineInsight: evaluatedOpp.pipelineInsight!,
      });
    } else {
      rejectedCount++;
      debugReport.push(`[REJECTED - Zero Relevance] ${opp.titleEn}: Score = 0`);
    }
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
        headlineEn: 'This may be useful for you right now',
        headlineZh: '现阶段适合的实用讲座与规划',
        badgeEn: 'Life-Stage Learning',
        badgeZh: '人生阶段学习',
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
