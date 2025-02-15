import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  const { name, pack, pin } = req.query

  if (!name || !pin || !pack) {
    return res.status(400).json({ error: "Missing name or pin" })
  }

  try {
    const compUrl = `https://medicomp.in/scrape-data?medname=${encodeURIComponent(name as string)}&packSize=${encodeURIComponent(pack as string)}&pincode=${pin}`
    console.log("Comparision URL:", compUrl)
    const compResponse = await fetch(compUrl)

    if (!compResponse.body) throw new Error("Failed to get response body")

    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    const reader = compResponse.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value, { stream: true })
      res.write(text)
    }

    res.end()
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}