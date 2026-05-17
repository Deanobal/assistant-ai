import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function normalizeEmail(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function getLinkedClientId(user: any): string | null {
  return user?.client_account_id || user?.client_record_id || user?.client_id || null;
}

function safeClient(client: any) {
  if (!client) return null;
  return {
    id: client.id,
    email: client.email || '',
    business_name: client.business_name || '',
    full_name: client.full_name || '',
    plan: client.plan || '',
    status: client.status || '',
    lifecycle_state: client.lifecycle_state || '',
  };
}

async function persistUserClientLink(base44: any, user: any, clientId: string) {
  if (!user?.id || !clientId) return;

  try {
    const targetUsers = await base44.asServiceRole.entities.User.filter({ id: user.id }, '-created_date', 1);
    const targetUser = targetUsers?.[0];

    if (targetUser && targetUser.client_account_id !== clientId) {
      await base44.asServiceRole.entities.User.update(targetUser.id, {
        ...targetUser,
        client_account_id: clientId,
      });
    }
  } catch (error) {
    console.warn('Could not persist client_account_id:', error?.message || error);
  }
}

async function createClientForUser(base44: any, user: any) {
  const email = normalizeEmail(user.email);
  const fullName = user.full_name || user.name || email.split('@')[0] || 'Client';
  const businessName = user.business_name || user.company_name || fullName || 'New Client';

  return base44.asServiceRole.entities.Client.create({
    email,
    full_name: fullName,
    business_name: businessName,
    plan: user.plan || 'Starter',
    status: 'Portal Access Created',
    lifecycle_state: 'pre_live',
    progress_percentage: 0,
    last_activity: 'Client portal access created from authenticated login.',
    next_action: 'Complete onboarding and connect live systems.',
    workflow_phase: 'Portal Access',
    assets_status: 'not_started',
    onboarding_archived: false,
    go_live_ready: false,
    shared_files: [],
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.email) {
      return Response.json({ success: false, error: 'You must be logged in to access the client portal.' }, { status: 200 });
    }

    const linkedClientId = getLinkedClientId(user);

    if (linkedClientId) {
      const linkedClients = await base44.asServiceRole.entities.Client.filter({ id: linkedClientId }, '-updated_date', 1);
      const linkedClient = linkedClients?.[0] || null;

      if (linkedClient) {
        return Response.json({
          success: true,
          client_id: linkedClient.id,
          access_method: 'direct_link',
          client: safeClient(linkedClient),
        });
      }
    }

    const userEmail = normalizeEmail(user.email);
    const directMatches = await base44.asServiceRole.entities.Client.filter({ email: userEmail }, '-updated_date', 50);
    let matches = (directMatches || []).filter((client: any) => normalizeEmail(client.email) === userEmail);

    if (matches.length === 0) {
      const allClients = await base44.asServiceRole.entities.Client.list('-updated_date', 500);
      matches = (allClients || []).filter((client: any) => normalizeEmail(client.email) === userEmail);
    }

    const uniqueMatches: any[] = Array.from(new Map(matches.map((client: any) => [client.id, client])).values());

    if (uniqueMatches.length >= 1) {
      const matchedClient = uniqueMatches[0];
      await persistUserClientLink(base44, user, matchedClient.id);

      return Response.json({
        success: true,
        client_id: matchedClient.id,
        access_method: uniqueMatches.length > 1 ? 'latest_email_match' : 'email_match',
        match_count: uniqueMatches.length,
        client: safeClient(matchedClient),
      });
    }

    const createdClient = await createClientForUser(base44, user);
    await persistUserClientLink(base44, user, createdClient.id);

    return Response.json({
      success: true,
      client_id: createdClient.id,
      access_method: 'created_from_login',
      match_count: 0,
      client: safeClient(createdClient),
    });
  } catch (error) {
    console.error('resolveClientPortalAccess failed:', error);
    return Response.json({
      success: false,
      error: 'We could not verify your client portal access right now. Please contact support at sales@assistantai.com.au.',
    }, { status: 200 });
  }
});
