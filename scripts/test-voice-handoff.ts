import {
  resolveLiveNavigateTarget,
  shouldConsumeLiveSessionEvent,
  shouldApplyLiveGraphUpdate,
} from '../src/services/voiceHandoff.ts';
import {
  createFreshGraph,
  mergeConversationInsights,
  understandingItemsFromGraph,
  lockGraphFromReview,
  inferConversationInterests,
  OPPORTUNITY_CATALOG,
} from '../src/data/opportunities.ts';
import { runRecommendationPipeline } from '../src/services/recommendationEngine.ts';

let failed = 0;

function assert(name: string, condition: boolean) {
  if (condition) {
    console.log(`✓ ${name}`);
    return;
  }
  failed += 1;
  console.log(`✗ ${name}`);
}

assert(
  'spoken yes / navigate my-world from Talk opens Understanding, not My World',
  resolveLiveNavigateTarget('my-world', 'conversation') === 'understanding'
);
assert(
  'navigate recommendation from Talk opens Understanding, not event details',
  resolveLiveNavigateTarget('recommendation', 'conversation') === 'understanding'
);
assert(
  'navigate understanding from Talk stays on Understanding',
  resolveLiveNavigateTarget('understanding', 'conversation') === 'understanding'
);
assert(
  'navigate my-world from Understanding cannot skip to Step confirmed',
  resolveLiveNavigateTarget('my-world', 'understanding') === 'understanding'
);
assert(
  'navigate recommendation from Understanding cannot skip the confirm tap',
  resolveLiveNavigateTarget('recommendation', 'understanding') === 'understanding'
);
assert(
  'navigate my-world from event details still cannot auto-complete',
  resolveLiveNavigateTarget('my-world', 'recommendation') === 'understanding'
);
assert(
  'home from Live is allowed',
  resolveLiveNavigateTarget('home', 'conversation') === 'home'
);
assert(
  'unknown screens are ignored',
  resolveLiveNavigateTarget('settings', 'conversation') === null
);
assert(
  'screen navigation from Live only applies during Talk',
  shouldConsumeLiveSessionEvent('conversation', false) === true
);
assert(
  'screen navigation stops after handoff lock',
  shouldConsumeLiveSessionEvent('conversation', true) === false
);
assert(
  'screen navigation stops on My World',
  shouldConsumeLiveSessionEvent('my-world', false) === false
);
assert(
  'late graph updates can still lock onto Understanding',
  shouldApplyLiveGraphUpdate('understanding') === true
);
assert(
  'graph updates do not keep rewriting My World',
  shouldApplyLiveGraphUpdate('my-world') === false
);

const horseGraph = mergeConversationInsights(createFreshGraph(), {
  interests: ['horses', 'animals'],
});
const horseCards = understandingItemsFromGraph(horseGraph, 'I like horses and animals');
assert(
  'Understanding locks horses/animals ahead of canned dancing cards',
  horseCards.some((item) => /horse|animal/i.test(item.en)) &&
    !horseCards[0].en.toLowerCase().includes('ballroom')
);

const horseRecs = runRecommendationPipeline(
  horseGraph,
  OPPORTUNITY_CATALOG,
  'I like horses and animals'
);
const horseTopIds = horseRecs.topOpportunities.slice(0, 3).map((opp) => opp.id);
assert(
  'Horse/animal talk ranks nature/garden, not only this-week LPA/retirement cards',
  horseTopIds.includes('opp-botanic-soundwalk') || horseTopIds.includes('opp-garden-tea')
);
assert(
  'Horse/animal talk does not pin LPA as the first card',
  horseRecs.topOpportunities[0]?.id !== 'opp-lpa-basics'
);
assert(
  'Horse/animal talk prefers the Botanic Gardens nature walk as the top card',
  horseRecs.topOpportunities[0]?.id === 'opp-botanic-soundwalk'
);

const spokenOnlyGraph = createFreshGraph();
const spokenCards = understandingItemsFromGraph(spokenOnlyGraph, 'I like horses and animals');
const lockedFromCards = lockGraphFromReview(spokenOnlyGraph, 'I like horses and animals', spokenCards);
const lockedRecs = runRecommendationPipeline(
  lockedFromCards,
  OPPORTUNITY_CATALOG,
  'I like horses and animals'
);
assert(
  'inferConversationInterests extracts horses from spoken text',
  inferConversationInterests('I like horses and animals').includes('horses')
);
assert(
  'Confirming spoken insight cards ranks nature, not the default LPA/today card',
  lockedRecs.topOpportunities[0]?.id === 'opp-botanic-soundwalk' &&
    lockedFromCards.sessionInsights?.interests.some((item) => /horse|animal/i.test(item))
);

if (failed > 0) {
  console.log(`Voice handoff tests: FAIL (${failed} assertion(s))`);
  process.exit(1);
}

console.log('Voice handoff tests: PASS');
