import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function normalizeEmail(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function getLinkedClientId(user: any): string | null {
  return (
    user?.client_account_id ||
    user?.client_record_id ||
    user?.client_id ||
    null
  );
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.email) {
      return Response.json({
        success: false,
        error: 'You must be logged in to access the client portal.',
      }, { status: 200 });
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

    const uniqueMatches = Array.from(new Map(matches.map((client: any) => [client.id, client])).values());

    if (uniqueMatches.length === 1) {
      const matchedClient: any = uniqueMatches[0];

      if (user?.id) {
        try {
          const targetUsers = await base44.asServiceRole.entities.User.filter({ id: user.id }, '-created_date', 1);
          const targetUser = targetUsers?.[0];
          if (targetUser && !targetUser.client_account_id) {
            await base44.asServiceRole.entities.User.update(targetUser.id, {
              ...targetUser,
              client_account_id: matchedClient.id,
            });
          }
        } catch (linkError) {
          console.warn('Could not persist client_account_id during portal email match:', linkError?.message || linkError);
        }
      }

      return Response.json({
        success: true,
        client_id: matchedClient.id,
        access_method: 'email_match',
        client: safeClient(matchedClient),
      });
    }

    if (uniqueMatches.length > 1) {
      return Response.json({
        success: false,
        error: 'Multiple client records were found for this email. Please contact support so we can link your account.',
        match_count: uniqueMatches.length,
      });
    }

    return Response.json({
      success: false,
      error: 'Portal access is not linked to a client record yet. If you are an active client, contact support at sales@assistantai.com.au.',
      match_count: 0,
    });
  } catch (error) {
    console.error('resolveClientPortalAccess failed:', error);
    return Response.json({
      success: false,
      error: 'We could not verify your client portal access right now. Please contact support at sales@assistantai.com.au.',
    }, { status: 200 });
  }
});
