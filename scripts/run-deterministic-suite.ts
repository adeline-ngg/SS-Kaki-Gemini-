import { runAllDeterministicTests } from '../src/data/scenarios.ts';

const result = runAllDeterministicTests();

console.log(`Deterministic suite: ${result.passedCount}/${result.totalCount}${result.allPassed ? ' PASS' : ' FAIL'}`);
for (const test of result.results) {
  console.log(`${test.status === 'PASS' ? '✓' : '✗'} ${test.id} — ${test.name}`);
  if (test.status === 'FAIL') {
    console.log(`  expected: ${test.expectedResult}`);
    console.log(`  actual:   ${test.actualResult}`);
    console.log(`  why:      ${test.whyExplanation}`);
  }
}

if (!result.allPassed) {
  process.exit(1);
}
