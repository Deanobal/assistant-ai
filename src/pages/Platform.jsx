import React from 'react';
import SEO from '../components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import OverviewPreview from '../components/portal/OverviewPreview';
import CallRecordings from '../components/dashboard/CallRecordings';
import AnalyticsSection from '../components/dashboard/AnalyticsSection';
import BillingSection from '../components/dashboard/BillingSection';
import PortalIntegrations from '../components/dashboard/PortalIntegrations';
import SupportSection from '../components/dashboard/SupportSection';
import {
  AccentText,
  ConversionCTA,
  PageHero,
  PageShell,
  Section,
} from '@/components/marketing/PremiumMarketing';

export default function Platform() {
  return (
    <>
      <SEO
        title="Platform Preview | Enquiry Handling for Service Businesses | AssistantAI"
        description="Preview how AssistantAI helps Australian service businesses see calls, enquiries, bookings, follow-up, setup progress, and support in one place."
        canonicalPath="/Platform"
      />
      <PageShell>
        <PageHero
          title={<>One clear view of every call and <AccentText>next action.</AccentText></>}
          description="Preview how AssistantAI can organise calls, enquiries, bookings, follow-up, setup progress and support for an Australian service business."
          primaryTo="/GetStartedNow"
          primaryLabel="Get Started"
          secondaryTo="/ClientLogin"
          secondaryLabel="Client Login"
          footnote="Public preview using sample data only"
        />
        <Section id="page-content" className="bg-[#040b14]">
          <div className="mb-10">
            <Card className="bg-[#12121a] border-white/5">
              <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="text-white font-semibold">Portal Preview</p>
                  <p className="text-sm text-gray-400 mt-1">All sections below are sample previews only, designed to show how enquiries and follow-up can stay organised.</p>
                </div>
                <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300 w-fit">
                  Sample Data Preview
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-12">
            <OverviewPreview />
            <CallRecordings />
            <AnalyticsSection mode="sample" />
            <BillingSection mode="sample" />
            <PortalIntegrations mode="sample" />
            <SupportSection />
          </div>

        </Section>
        <ConversionCTA
          title="Want this connected experience for your business?"
          description="See how your calls, bookings and follow-up can move through one clearer workflow."
          primaryTo="/BookStrategyCall"
          primaryLabel="Book a Strategy Call"
        />
      </PageShell>
    </>
  );
}
