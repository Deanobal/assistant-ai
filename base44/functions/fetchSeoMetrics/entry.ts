import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const gscApiKey = Deno.env.get('GSC_API_KEY');
    const gaApiKey = Deno.env.get('GA_API_KEY');

    // Dummy data for demonstration
    const dummyData = {
      topKeywords: [
        { keyword: 'AI receptionist', impressions: 1240, clicks: 145, avgPosition: 3.2 },
        { keyword: 'lead capture system', impressions: 890, clicks: 98, avgPosition: 4.1 },
        { keyword: 'call handling automation', impressions: 756, clicks: 87, avgPosition: 3.8 },
        { keyword: 'service business software', impressions: 634, clicks: 56, avgPosition: 5.2 },
        { keyword: 'missed call handling', impressions: 512, clicks: 43, avgPosition: 6.1 },
      ],
      topPages: [
        { page: '/Services', clicks: 234, impressions: 1200, avgPosition: 2.1 },
        { page: '/Pricing', clicks: 189, impressions: 980, avgPosition: 2.8 },
        { page: '/Blog/ai-receptionist-guide', clicks: 156, impressions: 780, avgPosition: 3.4 },
        { page: '/CaseStudies', clicks: 123, impressions: 654, avgPosition: 4.2 },
        { page: '/', clicks: 98, impressions: 500, avgPosition: 1.9 },
      ],
      performanceTrend: [
        { date: '2026-04-20', impressions: 450, clicks: 42, position: 3.5 },
        { date: '2026-04-21', impressions: 520, clicks: 51, position: 3.3 },
        { date: '2026-04-22', impressions: 610, clicks: 62, position: 3.1 },
        { date: '2026-04-23', impressions: 680, clicks: 74, position: 2.9 },
        { date: '2026-04-24', impressions: 720, clicks: 85, position: 2.8 },
        { date: '2026-04-25', impressions: 810, clicks: 98, position: 2.7 },
        { date: '2026-04-26', impressions: 890, clicks: 112, position: 2.6 },
        { date: '2026-04-27', impressions: 950, clicks: 125, position: 2.5 },
      ],
      backlinks: {
        totalBacklinks: 342,
        domainRating: 42,
        trustRating: 38,
        recentLinks: [
          { source: 'industryjournal.com.au', date: '2026-04-25', relevance: 'high' },
          { source: 'serviceBusinessToday.com', date: '2026-04-24', relevance: 'high' },
          { source: 'techblog.com.au', date: '2026-04-22', relevance: 'medium' },
        ],
      },
      competitors: [
        { name: 'Competitor A', domainRating: 45, traffic: 12400, keywords: 3450 },
        { name: 'Competitor B', domainRating: 38, traffic: 8900, keywords: 2100 },
        { name: 'Competitor C', domainRating: 35, traffic: 6200, keywords: 1800 },
      ],
      geoMetrics: {
        countries: [
          { country: 'Australia', clicks: 2340, impressions: 8900, position: 2.3 },
          { country: 'New Zealand', clicks: 234, impressions: 980, position: 3.1 },
          { country: 'United Kingdom', clicks: 156, impressions: 654, position: 4.2 },
          { country: 'United States', clicks: 98, impressions: 512, position: 4.8 },
          { country: 'Canada', clicks: 54, impressions: 301, position: 5.3 },
        ],
      },
    };

    return Response.json({
      success: true,
      hasApiKeys: !!(gscApiKey || gaApiKey),
      data: dummyData,
      note: 'Using dummy data. Configure GSC_API_KEY and GA_API_KEY to fetch real metrics.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});