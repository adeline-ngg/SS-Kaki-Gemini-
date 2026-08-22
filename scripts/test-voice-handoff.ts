import {
  resolveLiveNavigateTarget,
  shouldConsumeLiveSessionEvent,
} from '../src/services/voiceHandoff.ts';

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
  'graph updates apply during Talk',
  shouldConsumeLiveSessionEvent('conversation', false) === true
);
assert(
  'graph updates stop after handoff lock',
  shouldConsumeLiveSessionEvent('conversation', true) === false
);
assert(
  'graph updates stop on My World even if lock was missed',
  shouldConsumeLiveSessionEvent('my-world', false) === false
);
assert(
  'graph updates stop on Understanding',
  shouldConsumeLiveSessionEvent('understanding', false) === false
);

if (failed > 0) {
  console.log(`Voice handoff tests: FAIL (${failed} assertion(s))`);
  process.exit(1);
}

console.log('Voice handoff tests: PASS');
