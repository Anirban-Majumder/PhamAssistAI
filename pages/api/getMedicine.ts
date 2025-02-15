import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  const { name, pin } = req.query

  if (!name || !pin) {
    return res.status(400).json({ error: "Missing name or pin" })
  }

  try {
    // Fetch medicine details
    const medResponse = await fetch(`https://medicomp.in/medicineName?q=${encodeURIComponent(name as string)}`)
    if (!medResponse.ok) throw new Error("Failed to fetch medicine data")
    
    const medicines = await medResponse.json()
    if (!medicines.length) throw new Error("No medicine found")

    const medicine = medicines[0]
    //console.log("Medicine details:", medicine)
    const compUrl = `https://medicomp.in/scrape-data?medname=${encodeURIComponent(medicine.medicineName)}&packSize=${encodeURIComponent(medicine.packSize)}&pincode=${pin}`
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
