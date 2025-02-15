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
    const response = await fetch(`https://labs.netmeds.com/labtest/${encodeURIComponent(name as string)}?pincode=${encodeURIComponent(pin as string)}`);

    const data = await response.json();
    if (
        data.serviceStatus.status === "true" &&
        data.serviceStatus.statusCode === 200 &&
        data.serviceStatus.message === "success"
      ) {
        return res.status(200).json(data.result);
      } else {
        console.log("Service Status:", data.serviceStatus);
        return res.status(500).json({ error: "Service did not return expected response" });
      }
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message })
  }
}