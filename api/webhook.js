require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY not set!");
  process.exit(1);
}

// Public folder for PDFs
const PUBLIC_DIR = path.join(__dirname, "public");
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR);
app.use("/public", express.static(PUBLIC_DIR));

app.post("/webhook", async (req, res) => {
  try {
    const params = req.body.queryResult?.parameters || {};
    console.log("Received parameters:", params);

    const diet = params.diet ? String(params.diet) : "Halal";
    const meals = params.meals && !isNaN(params.meals) ? parseInt(params.meals) : 3;
    const calories = params.calories && !isNaN(params.calories) ? params.calories : "not specified";

    // Handle allergies safely
    let allergies = "none";
    if (params.allergies) {
      if (Array.isArray(params.allergies) && params.allergies.length > 0) {
        allergies = params.allergies.join(", ");
      } else if (typeof params.allergies === "string" && params.allergies.trim() !== "") {
        allergies = params.allergies;
      }
    }
    console.log("Allergies used in prompt:", allergies);

    // GPT prompt
    const prompt = `Create a ${meals}-meal plan for a ${diet} diet.
Calorie goal: ${calories}.
Avoid ingredients: ${allergies}.
Format clearly as:
Meal 1: ...
Meal 2: ...
etc.`;

    // Call OpenAI
    const aiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const mealPlanText = aiResponse.data.choices[0].message.content;
    console.log("OpenAI response:", mealPlanText);

    // Generate PDF
    const timestamp = Date.now();
    const pdfFileName = `mealplan_${timestamp}.pdf`;
    const pdfPath = path.join(PUBLIC_DIR, pdfFileName);

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));
    doc.fontSize(16).text("Personalized Nutrition Meal Plan", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(mealPlanText, { align: "left" });
    doc.end();

    const pdfUrl = `${req.protocol}://${req.get("host")}/public/${pdfFileName}`;

    res.json({
      fulfillmentText: `Here’s your personalized meal plan:\n\n${mealPlanText}\n\n👉 Download PDF: ${pdfUrl}`,
    });
  } catch (error) {
    console.error("Webhook error:", error.response?.data || error.message);
    res.json({
      fulfillmentText: "Sorry, something went wrong while generating your meal plan.",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webhook running on port ${PORT}`));
