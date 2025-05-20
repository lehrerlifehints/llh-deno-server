import { isUnexpected, ModelClient } from "@azure-rest/ai-inference";

export async function getAIStall(
  question: string,
  model: string,
  client: ModelClient,
): Promise<string> {
  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        {
          role: "system",
          content: "You are an expert at not answering questions.\
			You provide a lot of bulletpoints to help talk around questions.\
			You do not mention specific facts. Only reasonable assumptions or absolute common knowledge.\
			Only answer with German text.\
			Techniques you could use: paraphrasing of what was said, repeating or complementing it, Clarifying questions, rhetorical/redirecting questions.\
			Make it subtle: Nobody should notice that you are trying to avoid the question.\
			Try to be as unspecific as possbile without mentioning facts.\
			DO NOT ANSWER THE QUESTIONS!",
        },
        {
          role: "user",
          content: `
          The time is ${Temporal.Now.plainDateTimeISO().toString()}.
          Stall for answers for the following question: ${question}`,
        },
      ],
      temperature: 1.0,
      top_p: 1.0,
      model: model,
    },
  });
  if (isUnexpected(response)) {
    throw response.body.error;
  }
  const responseText = response.body.choices[0].message.content;
  if (responseText === null) {
    throw new Error("The response is null");
  }
  return responseText;
}

export async function getAIQuery(
  question: string,
  model: string,
  client: ModelClient,
): Promise<string> {
  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        {
          role: "system",
          content: "You are an expert at rewriting and not answering questions.\
            You rewrite questions the user provides you with to be a search query.\
            The search query should be as specific as possible.\
            The search query should be in English.\
            Do NOT answer with a URL. Only a plain Text is acceptable.\
            DO NOT ANSWER THE QUESTION!",
        },
        {
          role: "user",
          content:
            `
            The time is ${Temporal.Now.plainDateTimeISO().toString()}.
            Make the following question a search query, please. \nQuestion: ${question}`,
        },
      ],
      temperature: 1.0,
      top_p: 1.0,
      model: model,
    },
  });
  if (isUnexpected(response)) {
    throw response.body.error;
  }
  const responseText = response.body.choices[0].message.content;
  if (responseText === null) {
    throw new Error("The response is null");
  }
  return responseText;
}

export async function getAISummary(
  question: string,
  searchResults: string,
  model: string,
  client: ModelClient,
): Promise<string> {
  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        {
          role: "system",
          content:
            "Answer the message as good as possible using the context provided (live search results).\
            Always speak German.\
            Never refer to the context even though you should answer based on it",
        },
        {
          role: "user",
          content: `
            """
            Context: ${searchResults}
            """
            The time is ${Temporal.Now.plainDateTimeISO().toString()}.
            Based on these results, answer the following question:
            Question: ${question}
            `,
        },
      ],
      temperature: 1.0,
      top_p: 1.0,
      model: model,
    },
  });
  if (isUnexpected(response)) {
    throw response.body.error;
  }
  const responseText = response.body.choices[0].message.content;
  if (responseText === null) {
    throw new Error("The response is null");
  }
  return responseText;
}

export async function getAIUneducatedGuess(
  question: string,
  model: string,
  client: ModelClient,
): Promise<string> {
  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        {
          role: "system",
          content: "Answer the message as precisely as possible.\
				Always speak German.\
				If you cant answer it try to divert the conversation to a field you can answer.",
        },
        { role: "user", content: `
          The time is ${Temporal.Now.plainDateTimeISO().toString()}.
          Answer the following question: ${question}` },
      ],
      temperature: 1.0,
      top_p: 1.0,
      model: model,
    },
  });
  if (isUnexpected(response)) {
    throw response.body.error;
  }
  const responseText = response.body.choices[0].message.content;
  if (responseText === null) {
    throw new Error("The response is null");
  }
  return responseText;
}
