import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const { lyrics, genre, type } = req.body;

    // choose model based on request
    let model = "facebook/musicgen-small"; 
    if (type === "song") {
      model = "facebook/musicgen-medium";
    }

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: type === "song" ? `Lyrics: ${lyrics}` : `Generate a ${genre} beat`
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(500).json({ error });
    }

    // return Hugging Face response as audio
    const data = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/wav");
    res.send(Buffer.from(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
        }
  
