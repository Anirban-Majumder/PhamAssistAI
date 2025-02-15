import type { NextApiRequest, NextApiResponse } from "next";

type Data = any; // Replace with a more specific type if needed.

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name } = req.query;

  if (!name || typeof name !== "string") {
    return res
      .status(400)
      .json({ error: 'Query parameter "name" is required and must be a string.' });
  }

  try {
    const algoliaResponse = await fetch(
      "https://t63qhgrw33-dsn.algolia.net/1/indexes/Variant_Mobile_production/query?x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%203.22.1&x-algolia-application-id=T63QHGRW33&x-algolia-api-key=8c5890a0d819b0043c688f23db75b573",
      {
        method: "POST",
        referrer: "https://frankrosspharmacy.com/",
        body: JSON.stringify({
          params: `query=${encodeURIComponent(
            name
          )}&filters=cities_mapping.city_13.active%3D1&hitsPerPage=20&page=0&clickAnalytics=true`,
        }),
      }
    );

    if (!algoliaResponse.ok) {
      return res.status(algoliaResponse.status).json({
        error: `Error fetching data from Algolia: ${algoliaResponse.statusText}`,
      });
    }

    const algoliaData = await algoliaResponse.json();

    if (!algoliaData.hits || algoliaData.hits.length === 0) {
      return res.status(404).json({ error: "No matching variant found" });
    }

    const variantId = algoliaData.hits[0].id;
    const crmResponse = await fetch(
      `https://crm.frankrosspharmacy.com/api/v8/customer/cities/13/web/variants/${variantId}`
    );

    if (!crmResponse.ok) {
      return res.status(crmResponse.status).json({
        error: `Error fetching variant details from CRM: ${crmResponse.statusText}`,
      });
    }

    const crmData = await crmResponse.json();
    return res.status(200).json(crmData);
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
