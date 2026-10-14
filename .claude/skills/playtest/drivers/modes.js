// Mode driver: plays a whole campaign (forcing quick wins), a campaign loss
// and retry, and a short Endless run. Rendering is stubbed out so the logic
// runs fast under the browser's virtual time. Query parameters:
//   fighter=<index 0-6> (default 0)   endless=<wins before quitting> (default 3)
// Use a large budget: browser.sh dom <page> 250000
Arena.draw = () => {};
Arena.portrait = () => {};

(async () => {
  const params = new URLSearchParams(location.search);
  const fighterIndex = Number(params.get("fighter") || 0);
  const log = [];
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const report = () => {
    document.body.dataset.log = log.join(" | ");
    document.body.dataset.errors = (window.errors || []).join(" | ");
  };

  // Advances dialogue, plays a strike each round and clicks the first result
  // button until `done()` returns true. `rig` runs before each move.
  async function drive(done, rig) {
    for (let i = 0; i < 3000; i += 1) {
      if (done()) return true;
      if (screenName === "dialogue") advanceDialogue();
      else if (screenName === "fight" && !busy() && !state.finished) {
        rig();
        const button = [...document.querySelectorAll(".move-button")].find(candidate => !candidate.disabled);
        if (button) button.click();
      } else if (screenName === "result") {
        log.push(`result: ${ui.resultKicker.textContent} / ${ui.resultTitle.textContent}`);
        if (done()) return true;
        ui.resultActions.querySelector("button").click();
      }
      report();
      await wait(150);
    }
    return false;
  }
  const playerWins = () => { state.bot.hp = 1; state.shown.bot = 1; };

  try {
    localStorage.clear();
    document.querySelector('[data-mode="campaign"]').click();
    document.querySelectorAll(".fighter-card")[fighterIndex].click();
    ui.detailFight.click();
    const opponents = [];
    const cleared = await drive(() => {
      if (screenName === "fight" && opponents[opponents.length - 1] !== state.bot.id) opponents.push(state.bot.id);
      return screenName === "result" && ui.resultTitle.textContent === "CAMPAIGN CLEAR!";
    }, playerWins);
    log.push(`campaign cleared=${cleared} order=${opponents.join(",")} saved=${localStorage.getItem("tactic-fight-campaign")}`);

    // A loss must offer TRY AGAIN, which replays the same opponent at full health.
    goToTitle();
    document.querySelector('[data-mode="campaign"]').click();
    document.querySelectorAll(".fighter-card")[fighterIndex].click();
    ui.detailFight.click();
    const realChoose = Rules.chooseMove;
    Rules.chooseMove = fighter => Rules.character(fighter.id).moves.find(move => move.damage && !move.ultimate).id;
    await drive(() => screenName === "result", () => { state.player.hp = 1; state.shown.player = 1; });
    Rules.chooseMove = realChoose;
    const lostTo = state.bot.id;
    const actions = [...ui.resultActions.querySelectorAll("button")].map(button => button.textContent);
    ui.resultActions.querySelector("button").click();
    for (let i = 0; i < 80 && screenName === "dialogue"; i += 1) advanceDialogue();
    log.push(`loss: actions=${actions.join("/")} retry same=${state.bot.id === lostTo} hp=${state.player.hp}/${state.player.maxHp}`);

    goToTitle();
    document.querySelector('[data-mode="endless"]').click();
    document.querySelectorAll(".fighter-card")[fighterIndex].click();
    ui.detailFight.click();
    const target = Number(params.get("endless") || 3);
    await drive(() => screenName === "result" && parseInt(ui.resultTitle.textContent, 10) >= target, playerWins);
    [...ui.resultActions.querySelectorAll("button")].find(button => button.textContent === "QUIT RUN").click();
    log.push(`endless: ${ui.resultTitle.textContent} ${ui.resultDetail.textContent} best=${localStorage.getItem("tactic-fight-endless-best")}`);
  } catch (error) {
    (window.errors = window.errors || []).push(`driver: ${error.message} ${error.stack}`);
  } finally {
    report();
  }
})();
