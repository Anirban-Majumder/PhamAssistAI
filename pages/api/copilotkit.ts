import { NextApiRequest, NextApiResponse } from 'next';
import {
  CopilotRuntime,
  GroqAdapter,
  copilotRuntimeNextJSPagesRouterEndpoint,
} from '@copilotkit/runtime';

 

const serviceAdapter = new GroqAdapter({ model: "llama-3.3-70b-specdec" });
 
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const runtime = new CopilotRuntime({
    actions: ({properties, url}) => {

      return [
        {
          name: "fetchMedDetailsforidmed",
          description: "Fetches medicine details for a given medicine ID.",
          parameters: [
            {
              name: "medid",
              type: "string",
              description: "The ID of the user to fetch data for.",
              required: true,
            },
          ],
          handler: async ({medid}: {medid: string}) => {
            console.log("AI Fetching medicine details for ID:", medid);
            const Response = await fetch(
              `https://crm.frankrosspharmacy.com/api/v8/customer/cities/13/web/variants/${medid}`
            );
            
            if (!Response.ok) {
              return 
            }
        
            const Data = await Response.json();
            return Data;
            
          },
        },
      ]
    }
  });
 
  const handleRequest = copilotRuntimeNextJSPagesRouterEndpoint({
    endpoint: '/api/copilotkit',
    runtime,
    serviceAdapter,
  });
 
  return await handleRequest(req, res);
};
 
export default handler;