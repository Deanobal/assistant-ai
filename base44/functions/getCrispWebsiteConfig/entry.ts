Deno.serve(async () => {
  try {
    const websiteId = String(Deno.env.get('CRISP_WEBSITE_ID') || '').trim();

    if (!websiteId) {
      return Response.json({ error: 'Crisp website ID is not configured.' }, { status: 500 });
    }

    return Response.json({ websiteId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});