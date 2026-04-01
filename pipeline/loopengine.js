async function evaluateAndLoop() {
  let score = 0;
  let iterations = 0;

  do {
    await runPipeline();

    const evalOutput = state.outputs["usability-auditor"];
    score = extractScore(evalOutput);

    if (score < 8) {
      console.log("Re-running execution stage...");
      await runExecutionStage();
    }

    iterations++;
  } while (score < 8 && iterations < 3);
}