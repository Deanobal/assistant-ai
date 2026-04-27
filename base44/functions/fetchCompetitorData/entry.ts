import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const semrushApiKey = Deno.env.get('SEMRUSH_API_KEY');

    const dummyCompetitorData = {
      competitors: [
        {
          id: 1,
          name: 'Competitor A',
          domain: 'competitora.com.au',
          domainRating: 45,
          trafficEstimate: 12400,
          topKeywords: 3450,
          backlinks: 2180,
          recentGrowth: 12.5,
          topPages: [
            { page: '/services', traffic: 3200, keywords: 450 },
            { page: '/pricing', traffic: 2100, keywords: 380 },
            { page: '/blog', traffic: 1800, keywords: 320 },
          ],
        },
        {
          id: 2,
          name: 'Competitor B',
          domain: 'competitorb.com',
          domainRating: 38,
          trafficEstimate: 8900,
          topKeywords: 2100,
          backlinks: 1240,
          recentGrowth: 8.3,
          topPages: [
            { page: '/solutions', traffic: 2400, keywords: 350 },
            { page: '/case-studies', traffic: 1600, keywords: 280 },
            { page: '/contact', traffic: 1200, keywords: 200 },
          ],
        },
        {
          id: 3,
          name: 'Competitor C',
          domain: 'competitorc.io',
          domainRating: 35,
          trafficEstimate: 6200,
          topKeywords: 1800,
          backlinks: 890,
          recentGrowth: 5.2,
          topPages: [
            { page: '/features', traffic: 1900, keywords: 280 },
            { page: '/about', traffic: 1200, keywords: 180 },
            { page: '/resources', traffic: 900, keywords: 140 },
          ],
        },
      ],
      assistantAiMetrics: {
        domainRating: 42,
        trafficEstimate: 9800,
        topKeywords: 2850,
        backlinks: 1650,
        recentGrowth: 15.8,
      },
      analysis: {
        strengths: [
          'Higher domain rating than 2 of 3 competitors',
          'Strong growth trajectory (15.8% vs competitors avg 8.3%)',
          'More backlinks than 1 competitor',
        ],
        opportunities: [
          'Increase content around "service business automation"',
          'Target competitor A\'s top keywords with content',
          'Build more high-quality backlinks from industry publications',
        ],
        threats: [
          'Competitor A has larger traffic share',
          'Need to improve ranking for "AI receptionist" keyword',
          'Competitors focusing on similar target market',
        ],
      },
    };

    return Response.json({
      success: true,
      hasApiKey: !!semrushApiKey,
      data: dummyCompetitorData,
      note: 'Using dummy data. Configure SEMRUSH_API_KEY to fetch real competitor metrics.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});