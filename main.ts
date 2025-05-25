// deno-lint-ignore no-process-global
if (!Deno && !process) {
  throw new Error(
    "This script is intended to be run in a Deno or Node.js environment. Please ensure you are using the correct runtime.",
  );
}

import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { getResponse } from "./getResponse.ts";
import { getAIStall } from "./aiRequests.ts";

const token = Deno.env.get("GITHUB_TOKEN") || "";

if (token == "") {
  throw new Error("Please set the GITHUB_TOKEN environment variable.");
}
const endpoint = "https://models.github.ai/inference";
const model = "xai/grok-3";
const client = ModelClient(
  endpoint,
  new AzureKeyCredential(token),
);

export async function main() {
  const question = prompt("Please enter your question: ");
  if (question == null) {
    throw new Error("Question cannot be null");
  }
  const stall = await getAIStall(question, model, client);
  console.info(stall);
  const result = await getResponse(question, model, client);
  console.info(result);
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname == "/app/") {
      const question = url.searchParams.get("query");
      if (question == null) {
        return new Response("Question cannot be null", {
          status: 400,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      }
      const answer = await getResponse(question, model, client);
      return new Response(answer, {
        status: 200,
      });
    } else if (url.pathname == "/stream/") {
      const question = url.searchParams.get("query");
      if (question == null) {
        return new Response("Question cannot be null", {
          status: 400,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      }

      const body = new ReadableStream({
        async start(controller) {
          controller.enqueue(await getAIStall(question, model, client));
          controller.enqueue("\n");
          const response = await getResponse(question, model, client);
          controller.enqueue(response);
          controller.close();
        },
      });
      return new Response(body.pipeThrough(new TextEncoderStream()), {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    } else {
      return new Response("Not found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }
  },
} satisfies Deno.ServeDefaultExport;

if (import.meta.main) {
  await main();
}
