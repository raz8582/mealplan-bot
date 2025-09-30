const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Set in Vercel environment variables

app.post("/api/webhook", async (req, res) => {
  try {
    const params = req.body.queryResult.parameters || {};
    const calories = params.calories && !isNaN(params.calories) ? params.calories : "not specified";
    const meals = params.meals && !isNaN(params.meals) ? parseInt(params.meals) : 3;
    const diet = params.diet ? String(params.diet) : "Halal";

    const prompt = `Create a ${meals}-meal plan for a ${diet} diet. 
Calorie goal: ${calories}. 
Format clearly as Meal 1:, Meal 2:, etc. with short descriptions.`;

    const aiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const mealPlanText = aiResponse.data.choices[0].message.content;

    res.json({
      fulfillmentText: `Here’s your personalized meal plan:\n\n${mealPlanText}`
    });

  } catch (error) {
    console.error("Webhook error:", error.response ? error.response.data : error.message);
    res.json({
      fulfillmentText: "Sorry, something went wrong while generating your meal plan."
    });
  }
});

// Start the server (not required for Vercel serverless, but safe for local testing)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webhook running on port ${PORT}`));

module.exports = app; // Required for Vercel serverless
