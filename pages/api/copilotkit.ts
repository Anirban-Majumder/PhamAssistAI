import { NextApiRequest, NextApiResponse } from 'next';
import {
  CopilotRuntime,
  GroqAdapter,
  copilotRuntimeNextJSPagesRouterEndpoint,
} from '@copilotkit/runtime';

 

const serviceAdapter = new GroqAdapter({ model: "llama-3.3-70b-specdec" });
 
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const runtime = new CopilotRuntime();
 
  const handleRequest = copilotRuntimeNextJSPagesRouterEndpoint({
    endpoint: '/api/copilotkit',
    runtime,
    serviceAdapter,
  });
 
  return await handleRequest(req, res);
};
 
export default handler;