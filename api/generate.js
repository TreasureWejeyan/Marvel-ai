import fetch from "node-fetch";
import Cors from "cors";

const cors = Cors({
  methods: ["POST", "OPTIONS"],
  origin: "*", // allow all origins for now (can restrict later)
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { lyrics, genre } = req.body;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`, // stored securely
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `${lyrics}. Genre: ${genre}`,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const arrayBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
      }
