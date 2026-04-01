import { createServiceBase44, getErrorMessage, runAdminAlert } from './sharedAdminAlert.js';

Deno.serve(async (req) => {
  try {
    const base44 = createServiceBase44(req);
    const payload = await req.json();
    const result = await runAdminAlert(base44, req.url, payload);
    if (result?.error) {
      return Response.json({ error: result.error }, { status: result.status || 400 });
    }
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});