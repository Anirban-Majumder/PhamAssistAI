import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  const name = req.query.name as string

  if (!name) {
    return res.status(400).json({ error: "Missing name or pin" })
  }

  try {
    const medResponse = await fetch(`https://medicomp.in/medicineName?q=${encodeURIComponent(name as string)}`)
    if (!medResponse.ok) throw new Error("Failed to fetch medicine data")
    
    const medicines = await medResponse.json()
    if (!medicines.length) throw new Error("No medicine found")

    
    //responde with all the medicines
    res.json(medicines)
    } catch (error) {
     res.status(500).json({ error: (error as Error).message })
    }
}