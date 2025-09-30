// api/webhook.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const text = req.body.queryResult?.queryText || "Hello";
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: `Respond to this text: ${text}` }],
    });

    const aiResponse = completion.choices[0].message.content;

    console.log("AI response:", aiResponse);

    res.status(200).json({
      fulfillmentMessages: [
        { text: { text: [aiResponse] } },
      ],
    });
  } catch (err) {
    console.error("Error in webhook:", err);
    res.status(500).json({
      fulfillmentMessages: [
        { text: { text: ["Error calling OpenAI. Check logs."] } },
      ],
    });
  }
}
