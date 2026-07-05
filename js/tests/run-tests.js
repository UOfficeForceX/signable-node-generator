// 執行所有測試並將結果渲染到頁面上

(function () {
  function escapeForTest(str) {
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  function renderResults() {
    const { suites, passCount, failCount, total } = TestRunner.run();
    const summaryEl = document.getElementById('summary');
    const resultsEl = document.getElementById('results');

    summaryEl.textContent = `共 ${total} 項測試，通過 ${passCount} 項，失敗 ${failCount} 項`;
    summaryEl.className = 'summary ' + (failCount === 0 ? 'ok' : 'fail');

    resultsEl.innerHTML = suites.map((suite) => {
      const items = suite.tests.map((t) => {
        if (t.pass) {
          return `<li class="test-pass">✔ ${escapeForTest(t.name)}</li>`;
        }
        return `<li class="test-fail">✘ ${escapeForTest(t.name)}<div class="error-detail">${escapeForTest(t.error)}</div></li>`;
      }).join('');
      return `<div class="suite"><h2>${escapeForTest(suite.name)}</h2><ul>${items}</ul></div>`;
    }).join('');

    // 暴露結果供自動化工具（例如瀏覽器測試腳本）讀取，不需解析 DOM
    window.__TEST_RESULTS__ = { passCount, failCount, total, allPassed: failCount === 0 };
    document.title = `${failCount === 0 ? '✅ 通過' : '❌ 失敗'} 測試結果 (${passCount}/${total})`;
  }

  document.addEventListener('DOMContentLoaded', renderResults);
})();
