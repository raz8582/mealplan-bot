import { json } from "body-parser";

export default async function handler(req, res) {
  if (req.method === "POST") {
    console.log("Webhook called!");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    return res.status(200).json({
      fulfillmentMessages: [
        {
          text: {
            text: ["Webhook is working! 🎉"]
          }
        }
      ]
    });
  } else {
    return res.status(405).send("Method Not Allowed");
  }
}
