import fs from "fs";
import path from "path";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const pipeline = JSON.parse(
  fs.readFileSync("./pipeline/pipeline.json", "utf-8")
);

let state = {
  input: JSON.parse(fs.readFileSync("./context/input.json")),
  outputs: {}
};

async function runAgent(agentName, input) {
  const systemPrompt = fs.readFileSync(
    `./agents/**/${agentName}/system_prompt.md`,
    "utf-8"
  );

  const response = await client.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(input) }
    ]
  });

  return response.choices[0].message.content;
}

async function runPipeline() {
  for (const stage of pipeline.stages) {
    console.log(`Running stage: ${stage.name}`);

    for (const agent of stage.agents) {
      const output = await runAgent(agent, state);
      state.outputs[agent] = output;
    }
  }

  fs.writeFileSync("./output/final.json", JSON.stringify(state, null, 2));
}

runPipeline();