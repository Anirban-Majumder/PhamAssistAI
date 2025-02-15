import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  const name = req.query.name as string
  if (!name) {
    return res.status(400).json({ error: "Missing name" })
  }

  try {
    const body = {
      requests: [
        {
          indexName: "prod_diagnostic_v4",
          params: `analyticsTags=web&clickAnalytics=true&facets=[]&highlightPostTag=__ais-highlight__&highlightPreTag=__ais-highlight__&hitsPerPage=10&page=0&query=${encodeURIComponent(
            name,
          )}&tagFilters=`,
        },
      ],
    }
    
    const labResponse = await fetch(
      "https://0z9q3se3dl-dsn.algolia.net/1/indexes/*/queries",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-algolia-api-key": "681de0728f8f570da6939eca42686614",
          "x-algolia-application-id": "0Z9Q3SE3DL",
        },
        body: JSON.stringify(body),
      },
    )
    
    if (!labResponse.ok) {
      throw new Error("Failed to fetch lab data")
    }
    
    const data = await labResponse.json()
    
    if (!data.results || data.results.length === 0) {
      throw new Error("No lab found")
    }
    
    res.status(200).json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}