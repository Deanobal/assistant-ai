import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const requestResult = await base44.asServiceRole.functions.invoke('sendCustomerStrategyCallSms', {
      eventType: 'strategy_call_requested',
      leadId: 'audit-invoke-customer-request',
      clientAccountId: null,
      fullName: 'Invoke Customer Request',
      mobileNumber: '+61420222793',
      actorEmail: user.email,
      uniqueKey: 'audit-invoke-customer-request',
    });

    const fallbackResult = await base44.asServiceRole.functions.invoke('sendCustomerStrategyCallSms', {
      eventType: 'booking_request_failed',
      leadId: 'audit-invoke-customer-fallback',
      clientAccountId: null,
      fullName: 'Invoke Customer Fallback',
      mobileNumber: '+61420222793',
      actorEmail: user.email,
      uniqueKey: 'audit-invoke-customer-fallback',
    });

    const confirmedResult = await base44.asServiceRole.functions.invoke('sendCustomerBookingConfirmationSms', {
      leadId: 'audit-invoke-customer-confirmed',
      clientAccountId: null,
      fullName: 'Invoke Customer Confirmed',
      mobileNumber: '+61420222793',
      confirmedDate: '2026-04-02',
      confirmedTime: '11:30',
      bookingProvider: 'googlecalendar',
      bookingReference: 'audit-invoke-customer-confirmed-ref',
      actorEmail: user.email,
      uniqueKey: 'audit-invoke-customer-confirmed',
    });

    return Response.json({
      success: true,
      request: requestResult?.data || requestResult || null,
      fallback: fallbackResult?.data || fallbackResult || null,
      confirmed: confirmedResult?.data || confirmedResult || null,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: error?.response?.status || null, data: error?.response?.data || null }, { status: 500 });
  }
});