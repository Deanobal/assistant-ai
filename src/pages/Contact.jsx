import * as React from 'react';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import LeadForm from '../components/LeadForm';
import BookingSupportPanel from '../components/contact/BookingSupportPanel';

export default function Contact() {
  return (
    <>
      <SEO
        title="Contact | Talk to the AssistantAI Team"
        description="Contact AssistantAI to discuss call handling, lead capture, booking automation, and follow-up workflows for your business."
        canonicalPath="/Contact"
      />
      <div>
      <section className="relative py-24 md:py-28 bg-grid">
        <div className="bg-radial-glow absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <p className="text-cyan-400 mb-3 text-base font-medium">CONTACT ASSISTANTAI</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              Talk to Our Team
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              Tell us what is slowing down your lead handling, bookings, or follow-up, and we’ll show you the right next step.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3 p-8 md:p-10 rounded-[28px] border border-white/5 bg-[#12121a]"
            >
              <LeadForm
                submitLabel="Request a Call Back"
                successTitle="Enquiry Received"
                successText="Thanks — your enquiry has been received. We’ll review your details and reply with the next step within one business day."
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <BookingSupportPanel
                heading="What Happens Next?"
                intro="Once you send your enquiry, we’ll review your workflow and confirm whether a strategy call, follow-up discussion, or direct recommendation is the best next step."
                responseText="We usually respond within one business day."
              />
            </motion.div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}