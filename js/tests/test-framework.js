// 輕量測試框架（純 Vanilla JS，無需 npm / build，直接在瀏覽器執行）

const TestRunner = (() => {
  const suites = [];
  let currentSuite = null;

  function describe(name, fn) {
    currentSuite = { name, tests: [] };
    suites.push(currentSuite);
    fn();
    currentSuite = null;
  }

  function it(name, fn) {
    if (!currentSuite) throw new Error('it() 必須寫在 describe() 內部呼叫');
    currentSuite.tests.push({ name, fn });
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `期望為 ${JSON.stringify(expected)}，實際為 ${JSON.stringify(actual)}`);
    }
  }

  function assertDeepEqual(actual, expected, message) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) {
      throw new Error(message || `期望為 ${e}，實際為 ${a}`);
    }
  }

  function assertTrue(value, message) {
    if (!value) throw new Error(message || `期望為真值，實際為 ${JSON.stringify(value)}`);
  }

  function assertFalse(value, message) {
    if (value) throw new Error(message || `期望為假值，實際為 ${JSON.stringify(value)}`);
  }

  function assertThrows(fn, message) {
    let threw = false;
    try {
      fn();
    } catch (err) {
      threw = true;
    }
    if (!threw) throw new Error(message || '期望會拋出例外，但未拋出。');
  }

  function run() {
    const suiteResults = [];
    let passCount = 0;
    let failCount = 0;
    suites.forEach((suite) => {
      const testResults = [];
      suite.tests.forEach((test) => {
        try {
          test.fn();
          testResults.push({ name: test.name, pass: true });
          passCount += 1;
        } catch (err) {
          testResults.push({ name: test.name, pass: false, error: err.message });
          failCount += 1;
        }
      });
      suiteResults.push({ name: suite.name, tests: testResults });
    });
    return { suites: suiteResults, passCount, failCount, total: passCount + failCount };
  }

  return { describe, it, assertEqual, assertDeepEqual, assertTrue, assertFalse, assertThrows, run };
})();

const describe = TestRunner.describe;
const it = TestRunner.it;
const assertEqual = TestRunner.assertEqual;
const assertDeepEqual = TestRunner.assertDeepEqual;
const assertTrue = TestRunner.assertTrue;
const assertFalse = TestRunner.assertFalse;
const assertThrows = TestRunner.assertThrows;
