import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  // ✅ Enable CORS so frontend can call it
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { lyrics, genre, type } = req.body;

    if (!lyrics) {
      return res.status(400).json({ error: "Lyrics are required" });
    }

    // ✅ Hugging Face model (music generation)
    const MODEL = "facebook/musicgen-small";

    const hfRes = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer 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",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `${genre || "hip hop"} style song. Lyrics: ${lyrics}`,
        }),
      }
    );

    if (!hfRes.ok) {
      const errText = await hfRes.text();
      throw new Error(`Hugging Face error: ${errText}`);
    }

    // ✅ Return audio file
    const arrayBuffer = await hfRes.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("❌ Backend error:", err);
    res.status(500).json({ error: err.message });
  }
          }
