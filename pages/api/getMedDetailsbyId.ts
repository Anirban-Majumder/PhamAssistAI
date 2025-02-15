import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {id} = req.query;

  if (!id|| typeof id!== "string") {
    return res
      .status(400)
      .json({ error: 'Query parameter "id" is required and must be a string.' });
  }

  try {
    const crmResponse = await fetch(
      `https://crm.frankrosspharmacy.com/api/v8/customer/cities/13/web/variants/${id}`
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
