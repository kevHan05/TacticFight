// Smoke driver: walks title -> mode -> fighter detail -> dialogue -> fight and
// plays a few rounds through the real buttons. Query parameters:
//   mode=quick|endless|campaign   fighter=<index 0-7>   rounds=<n>
//   stop=title|select|detail|dialogue|fight|turn   wait=<ms to linger at stop>
// Results go to document.body.dataset.log and dataset.errors.
(async () => {
  const params = new URLSearchParams(location.search);
  const stop = params.get("stop");
  const log = [];
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const linger = () => wait(Number(params.get("wait") || 800));
  const report = () => {
    document.body.dataset.log = log.join(" | ");
    document.body.dataset.errors = (window.errors || []).join(" | ");
  };
  try {
    log.push(`screen=${screenName}`);
    if (stop === "title") return await linger();
    document.querySelector(`[data-mode="${params.get("mode") || "quick"}"]`).click();
    log.push(`screen=${screenName} cards=${document.querySelectorAll(".fighter-card").length}`);
    if (stop === "select") return await linger();
    document.querySelectorAll(".fighter-card")[Number(params.get("fighter") || 0)].click();
    log.push(`detail=${ui.detailName.textContent}`);
    if (stop === "detail") return await linger();
    ui.detailFight.click();
    if (stop === "dialogue") return await linger();
    for (let i = 0; i < 80 && screenName === "dialogue"; i += 1) {
      advanceDialogue();
      await wait(20);
    }
    log.push(`screen=${screenName} ${state.player.id} vs ${state.bot.id} stage=${state.stage} buttons=${document.querySelectorAll(".move-button").length}`);
    if (stop === "fight") return await linger();
    const rounds = Number(params.get("rounds") || 1);
    for (let round = 0; round < rounds && !state.finished; round += 1) {
      while (busy()) await wait(100);
      const button = [...document.querySelectorAll(".move-button")].find(candidate => !candidate.disabled);
      if (!button) break;
      button.click();
      log.push(`round ${state.completedRounds}: ${animation.report.player.move.name}=${animation.report.player.result} / ${animation.report.bot.move.name}=${animation.report.bot.result} hp ${state.player.hp}-${state.bot.hp}`);
      if (stop === "turn") return await linger();
    }
  } catch (error) {
    (window.errors = window.errors || []).push(`driver: ${error.message} ${error.stack}`);
  } finally {
    report();
  }
})();
