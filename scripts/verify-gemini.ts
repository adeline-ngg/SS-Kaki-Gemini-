/**
 * End-to-end Gemini verification against a running Kaki server.
 *
 * Usage:
 *   1. Put GEMINI_API_KEY in .env (server-side only)
 *   2. npm run dev
 *   3. npm run verify:gemini
 */
import { WebSocket } from 'ws';
import { createFreshGraph } from '../src/data/opportunities.ts';
import { LifeParticipationGraph } from '../src/types.ts';

const BASE_URL = process.env.KAKI_BASE_URL || 'http://localhost:3000';
const WS_URL = BASE_URL.replace(/^http/, 'ws') + '/api/live';

type ChatResponse = {
  spokenResponse?: { en?: string; zh?: string };
  understandingItems?: Array<{ en?: string; category?: string }>;
  updatedGraph?: LifeParticipationGraph;
  topRecommendations?: Array<{ id?: string; purposeType?: string; titleEn?: string }>;
  error?: string;
};

type Check = {
  name: string;
  pass: boolean;
  detail: string;
};

function lowerJoin(values: string[] | undefined): string {
  return (values || []).join(' | ').toLowerCase();
}

function containsAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(needle.toLowerCase()));
}

async function postChat(utterance: string, graph: LifeParticipationGraph): Promise<ChatResponse> {
  const res = await fetch(`${BASE_URL}/api/kaki/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userUtterance: utterance,
      currentGraph: graph,
      languageMode: 'mixed',
    }),
  });
  const data = (await res.json()) as ChatResponse;
  if (!res.ok) {
    throw new Error(data.error || `chat HTTP ${res.status}`);
  }
  return data;
}

async function probeLive(): Promise<{ status: string; message?: string }> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error('Live WebSocket timed out'));
    }, 8000);

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'status') {
          clearTimeout(timer);
          ws.close();
          resolve({ status: msg.status, message: msg.message });
        }
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    });

    ws.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function emptyGraph(): LifeParticipationGraph {
  return createFreshGraph({
    interests: [],
    capabilities: [],
    purposeDrivers: [],
    participationBarriers: [],
    accessibilityPreferences: [],
    contextualSignals: [],
    dislikes: [],
    completedOpportunityIds: [],
    completedTopicKeys: [],
    currentSeries: [],
    recentOpportunityHistory: [],
  });
}

async function main() {
  const checks: Check[] = [];

  const healthRes = await fetch(`${BASE_URL}/api/health`);
  if (!healthRes.ok) {
    throw new Error(`Server is not reachable at ${BASE_URL}. Start it with npm run dev.`);
  }
  const health = await healthRes.json();
  console.log('Health:', JSON.stringify(health, null, 2));

  checks.push({
    name: 'Gemini API key loaded on server',
    pass: Boolean(health.geminiConfigured),
    detail: health.geminiConfigured
      ? `chat=${health.chatModel} live=${health.liveModel}`
      : 'GEMINI_API_KEY is missing. Add it to .env and restart the server.',
  });

  const live = await probeLive();
  checks.push({
    name: 'Gemini Live WebSocket session',
    pass: live.status === 'connected',
    detail: `${live.status}${live.message ? ` — ${live.message}` : ''}`,
  });

  if (!health.geminiConfigured) {
    printReport(checks);
    process.exit(1);
  }

  const dancingUtterance = '我还是喜欢跳舞，不过膝盖没有以前那么好了，而且一个人去很 sian。';
  const dancing = await postChat(dancingUtterance, emptyGraph());
  const dancingGraph = dancing.updatedGraph;
  const dancingInterests = lowerJoin(dancingGraph?.interests);
  const dancingBarriers = lowerJoin(dancingGraph?.participationBarriers);
  const dancingAccess = lowerJoin(dancingGraph?.accessibilityPreferences);
  const dancingDislikes = lowerJoin(dancingGraph?.dislikes);
  checks.push({
    name: 'Dancing remains an interest (not a dislike)',
    pass:
      containsAny(dancingInterests, ['dance', 'dancing', '跳舞', 'ballroom']) &&
      !containsAny(dancingDislikes, ['dance', 'dancing', '跳舞']),
    detail: `interests=${JSON.stringify(dancingGraph?.interests)} dislikes=${JSON.stringify(dancingGraph?.dislikes)}`,
  });
  checks.push({
    name: 'Knee / gentler activity is a barrier or accessibility preference',
    pass: containsAny(`${dancingBarriers} ${dancingAccess}`, ['knee', 'gentle', 'seated', 'low', '膝盖', '温和']),
    detail: `barriers=${JSON.stringify(dancingGraph?.participationBarriers)} access=${JSON.stringify(dancingGraph?.accessibilityPreferences)}`,
  });
  checks.push({
    name: 'Going alone is a participation barrier',
    pass: containsAny(dancingBarriers, ['alone', 'sian', 'companion', 'buddy', '一个人', '孤单', '独自']),
    detail: `barriers=${JSON.stringify(dancingGraph?.participationBarriers)}`,
  });

  const retirementUtterance = '我明年退休，CPF 那些东西我不是很懂。';
  const retirement = await postChat(retirementUtterance, emptyGraph());
  const retirementGraph = retirement.updatedGraph;
  const retirementInterests = lowerJoin(retirementGraph?.interests);
  const retirementSignals = `${lowerJoin(retirementGraph?.contextualSignals)} ${retirementGraph?.profile?.lifeStage || ''}`.toLowerCase();
  const retirementTop = retirement.topRecommendations?.[0];

  checks.push({
    name: 'CPF is not recorded as a recreational interest',
    pass: !containsAny(retirementInterests, ['cpf', '公积金', 'stock', 'insurance', '股票', '保险']),
    detail: `interests=${JSON.stringify(retirementGraph?.interests)} signals=${JSON.stringify(retirementGraph?.contextualSignals)}`,
  });
  checks.push({
    name: 'Approaching retirement is captured as life-stage context',
    pass: containsAny(retirementSignals, ['retire', 'retirement', '退休', 'cpf', '公积金']),
    detail: `lifeStage=${retirementGraph?.profile?.lifeStage} signals=${JSON.stringify(retirementGraph?.contextualSignals)}`,
  });
  checks.push({
    name: 'Retirement utterance routes toward trusted CPF education',
    pass: retirementTop?.id === 'opp-cpf-foundations' || retirementTop?.purposeType === 'life_stage_learning',
    detail: `top=${retirementTop?.id} (${retirementTop?.purposeType})`,
  });

  const highStakesUtterance = '你觉得我应该把 CPF 拿出来买股票还是买保险？';
  const highStakes = await postChat(highStakesUtterance, emptyGraph());
  const highStakesSpoken = `${highStakes.spokenResponse?.en || ''} ${highStakes.spokenResponse?.zh || ''}`.toLowerCase();
  const highStakesTop = highStakes.topRecommendations?.[0];

  checks.push({
    name: 'High-stakes query refuses personal financial advice',
    pass: containsAny(highStakesSpoken, [
      'cannot',
      'can’t',
      'can not',
      'not give',
      '不能',
      '无法',
      '不会给',
      'personal financial',
      'investment advice',
      '个人财务',
      '投资建议',
    ]),
    detail: `spoken_en=${highStakes.spokenResponse?.en || ''} spoken_zh=${highStakes.spokenResponse?.zh || ''}`,
  });
  checks.push({
    name: 'High-stakes query does not personally recommend stocks or insurance',
    pass:
      !containsAny(highStakesSpoken, ['you should buy', '应该买股票', '应该买保险']) &&
      (highStakesTop?.id === 'opp-cpf-foundations' || highStakesTop?.purposeType === 'life_stage_learning' || !highStakesTop),
    detail: `top=${highStakesTop?.id} spoken=${highStakes.spokenResponse?.en || ''}`,
  });

  console.log('\n--- Gemini spoken / graph excerpts ---');
  console.log('Dancing spoken:', dancing.spokenResponse);
  console.log('Retirement spoken:', retirement.spokenResponse);
  console.log('High-stakes spoken:', highStakes.spokenResponse);

  printReport(checks);
  if (checks.some((check) => !check.pass)) {
    process.exit(1);
  }
}

function printReport(checks: Check[]) {
  console.log('\n=== Gemini verification ===');
  for (const check of checks) {
    console.log(`${check.pass ? '✓' : '✗'} ${check.name}`);
    console.log(`  ${check.detail}`);
  }
  const passed = checks.filter((check) => check.pass).length;
  console.log(`\n${passed}/${checks.length} checks passed`);
}

main().catch((err) => {
  console.error('Verification failed to run:', err.message || err);
  process.exit(1);
});
