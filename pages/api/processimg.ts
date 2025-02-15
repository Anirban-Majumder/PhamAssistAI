import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server-props";

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { image }: { image?: string } = req.body;
  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  console.log("Received image for processing:", image.substring(0, 30));

  const supabase = createClient({ req, res, query: req.query, resolvedUrl: req.url || "" });
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  console.log("User is authenticated", userData.user.email);
  const userId: string = userData.user.id;

  const insertMedicine = async (medicine: Medicine) => {
    const { error } = await supabase.from("medicine").insert([{ user_id: userId, ...medicine }]);
    if (error) {
      console.error("Error inserting medicine:", error);
    } else {
      console.log("Medicine inserted successfully:", medicine);
    }
  };

  const payload = {
    messages: [
      { role: "assistant", content: "" },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "You are a medical assistant AI specialized in converting prescription images into structured JSON data. Your input will be an image of a prescription (handwritten or printed). First, use OCR to extract the text from the image, then parse the text to identify each medicine. For every medicine, output a JSON object with exactly three keys: 'name' (the medicine's name), 'dosage' (the prescribed dosage), and 'duration' (the duration for which the medicine should be taken). Use your medical expertise to infer and fill in any missing details; if you cannot determine a value, use 'not specified'. The final output must be a valid JSON array, enclosed in square brackets, presented on a single line with no extra formatting, line breaks, or commentary."
          },
          {
            type: "image_url",
            image_url: { url: image }
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
    console.log("Received response from GROQ:", data?.choices?.[0]?.message?.content || "No content");
    const medicineList: Medicine[] = JSON.parse(data?.choices?.[0]?.message?.content || "[]");

    if (!Array.isArray(medicineList) || medicineList.length === 0) {
      return res.status(400).json({ error: "Failed to process image" });
    }

    await Promise.all(medicineList.map(insertMedicine));
    
    res.writeHead(302, { Location: "/Medicine" });
    return res.end();
  } catch (error) {
    console.error("Error processing image:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
