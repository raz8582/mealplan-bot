import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/webhook", async (req, res) => {
  try {
    const userText = req.body.queryResult?.queryText || "Hello";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userText }],
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      fulfillmentMessages: [
        { text: { text: [aiResponse] } }
      ],
    });
  } catch (error) {
    console.error(error);
    res.json({
      fulfillmentMessages: [
        { text: { text: ["Error calling OpenAI API."] } }
      ],
    });
  }
});

export default app;
