/**
 * Very simple in-browser unit-test library, with zero deps.
 *
 * Background turns green if all tests pass, otherwise red.
 * View the JavaScript console to see failure reasons.
 *
 * Example:
 *
 *   adder.js (code under test)
 *
 *     function add(a, b) {
 *       return a + b;
 *     }
 *
 *   adder-test.html (tests - just open a browser to see results)
 *
 *     <script src="tinytest.js"></script>
 *     <script src="adder.js"></script>
 *     <script>
 *
 *     tests({
 *
 *       'adds numbers': function() {
 *         eq(6, add(2, 4));
 *         eq(6.6, add(2.6, 4));
 *       },
 *
 *       'subtracts numbers': function() {
 *         eq(-2, add(2, -4));
 *       },
 *
 *     });
 *     </script>
 *
 * That's it. Stop using over complicated frameworks that get in your way.
 *
 * -Joe Walnes
 * MIT License. See https://github.com/joewalnes/jstinytest/
 */
const TinyTestHelper = {
  printStats(tests, failures) {
    const numberOfTestsRun = Object.keys(tests).length;
    const printableString = `Ran ${numberOfTestsRun} tests: ${numberOfTestsRun - failures} successes, and ${failures} failures`;

    // var div = document.createElement('div')
    const h = document.createElement('h1');
    h.textContent = printableString;
    document.body.appendChild(h);
  },
};

const TinyTest = {

  run(tests) {
    let failures = 0;
    // var numberOfTestsRun = 1;
    for (const testName in tests) {
      const testAction = tests[testName];
      try {
        testAction.apply(this);
        // numberOfTestsRun++;
        console.log(`%c${testName}`, 'color:green');
      } catch (e) {
        failures++;
        console.groupCollapsed(`%c${testName}`, 'color:red; font-weight:bold');
        console.error(e.stack);
        console.groupEnd();
      }
    }
    setTimeout(() => { // Give document a chance to complete
      if (window.document && document.body) {
        document.body.style.backgroundColor = (failures == 0 ? '#99ff99' : '#ff9999');
        TinyTestHelper.printStats(tests, failures);
      }
    }, 0);
  },

  fail(msg) {
    throw new Error(`fail(): ${msg}`);
  },

  assert(value, msg) {
    if (!value) {
      throw new Error(`assert(): ${msg}`);
    }
  },

  assertEquals(expected, actual) {
    if (expected != actual) {
      throw new Error(`assertEquals() "${expected}" != "${actual}"`);
    }
  },

  assertStrictEquals(expected, actual) {
    if (expected !== actual) {
      throw new Error(`assertStrictEquals() "${expected}" !== "${actual}"`);
    }
  },

};

const fail = TinyTest.fail.bind(TinyTest);
const assert = TinyTest.assert.bind(TinyTest);
const assertEquals = TinyTest.assertEquals.bind(TinyTest);
const eq = TinyTest.assertStrictEquals.bind(TinyTest); // alias for assertStrictEquals
const assertStrictEquals = TinyTest.assertStrictEquals.bind(TinyTest);
const tests = TinyTest.run.bind(TinyTest);
