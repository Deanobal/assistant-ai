import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const {
      name,
      type,
      template,
      segment,
      subject,
      body,
      ctaText,
      ctaUrl,
      scheduledDate,
    } = await req.json();

    if (!name || !type || !template || !segment || !subject || !body) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch leads for the given segment
    const leads = await base44.asServiceRole.entities.Lead.filter(
      { status: segment },
      '-created_date',
      1000
    );

    // Create campaign in database
    const campaign = await base44.asServiceRole.entities.Campaign.create({
      name,
      type,
      template,
      segment,
      subject,
      body,
      cta_text: ctaText || '',
      cta_url: ctaUrl || '',
      status: scheduledDate ? 'scheduled' : 'draft',
      scheduled_date: scheduledDate || null,
      total_recipients: leads.length,
      total_sent: 0,
      total_opened: 0,
      total_clicked: 0,
      total_replied: 0,
      total_bounced: 0,
      open_rate: 0,
      click_rate: 0,
      reply_rate: 0,
      created_by: user.email,
    });

    return Response.json({
      success: true,
      campaign: campaign,
      leadsToContact: leads.length,
      message: `Campaign created with ${leads.length} recipients.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});