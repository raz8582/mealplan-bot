// api/webhook.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const calories = req.body.queryResult?.parameters?.calories || "2000";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Create a simple test meal plan for ${calories} calories.`,
        },
      ],
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      fulfillmentMessages: [
        {
          text: {
            text: [aiResponse],
          },
        },
      ],
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.json({
      fulfillmentMessages: [
        {
          text: {
            text: ["Error calling OpenAI API. Check your API key and logs."],
          },
        },
      ],
    });
  }
}
