import { ModelClient } from "@azure-rest/ai-inference";
import { getAIQuery, getAISummary } from "./aiRequests.ts";
import { DuckDuck } from "@rajdave/duckduckjs";

const ddg = new DuckDuck();

export async function getResponse(
  question: string,
  model: string,
  client: ModelClient,
): Promise<string> {
  const searchQuery = await getAIQuery(question, model, client);
  console.log("Search query: ", searchQuery);

  const results = (await ddg.text(searchQuery)).slice(0, 3).map((result) => {
    return result.body;
  }).join("\n\n");
  console.log("Search results: ", results);
  const summary = await getAISummary(question, results, model, client);
  console.log("Summary: ", summary);
  return summary;
}
