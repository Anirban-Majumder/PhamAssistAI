import type { NextApiRequest, NextApiResponse } from "next";


function convertImageToBase64(src: any): Promise<string> {
    return new Promise((resolve, reject) => {
      // If the source is already a Base64 data URL, return it directly.
      if (src.startsWith("data:")) {
        resolve(src);
        return;
      }
      fetch(src)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then((blob) => {
          const contentType = blob.type || "image/jpeg";
          blob.arrayBuffer().then((buffer) => {
            const base64 = Buffer.from(buffer).toString("base64");
            resolve(`data:${contentType};base64,${base64}`);
          });
        })
        .catch((error) => reject(error));
    });
  }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { image }: { image?: string } = req.body;
  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  //console.log("Received image for processing:", image.substring(0, 30));

  const payload = {
    messages: [
      { role: "assistant", content: "" },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "You are a medical assistant AI specialized in converting prescription images into structured JSON data. Your input will be an image of a prescription (handwritten or printed). First, use OCR to extract the text from the image, then parse the text to identify each medicine. For every medicine, output a JSON object with exactly two keys 'symptom' which will be a string made up of all the symptoms seperated by comma and 'meds' is a list of { 'name' (the medicine's name), 'dosage' (the prescribed dosage), and 'duration' (the duration for which the medicine should be taken)}. Use your medical expertise to infer and fill in any missing details; if you cannot determine a value, use 'null'. The final output must be a valid JSON array, enclosed in third brackets, presented on a single line with no extra formatting, line breaks, or commentary."
          },
          {
            type: "image_url",
            image_url: { url: await convertImageToBase64(image) }
          }
        ]
      },
      { role: "assistant", content: "" }
    ],
    model: "llama-3.2-11b-vision-preview",
    temperature: 0,
    max_completion_tokens: 8192,
    top_p: 1,
    stream: false,
    stop: null
  };

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const ocr = data?.choices?.[0]?.message?.content;
    if (!ocr) {
      return res.status(500).json({ error: "Failed to process image" });
    }

    console.log("Received response from GROQ:", ocr || "No content");
    res.status(200).json({ ocr });

  } catch (error) {
    console.error("Error processing image:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
