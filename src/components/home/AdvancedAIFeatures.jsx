import { FileText, MessageSquareText, Tags, SmilePlus } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Call Summarisation',
    description: 'Auto-generated summaries with key points, customer needs, and clear action items after every call.',
  },
  {
    icon: MessageSquareText,
    title: 'Call Transcription',
    description: 'Accurate speech-to-text transcripts with speaker identification so conversations are easy to review.',
  },
  {
    icon: Tags,
    title: 'Smart Tagging',
    description: 'Apply relevant tags to calls based on topics, urgency, sentiment, service type, and outcomes.',
  },
  {
    icon: SmilePlus,
    title: 'Sentiment Analysis',
    description: 'Detect positive, neutral, or negative sentiment to help your team prioritise follow-up faster.',
  },
];

export default function AdvancedAIFeatures() {
  return (
    <section className="site-section border-y border-blue-200/[0.07]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(43,94,255,0.07),transparent_28rem)]" />
      <div className="site-container relative">
        <div className="site-section-head">
          <p className="site-kicker">Advanced AI features</p>
          <h2>Call intelligence built into every conversation.</h2>
          <p className="site-lede">AssistantAI helps your team understand what happened, what matters, and what action should happen next.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.title} className="site-card min-h-[15rem] p-5 sm:p-6">
              <span className="site-icon">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="site-card-title mt-6">{feature.title}</h3>
              <p className="site-card-copy mt-3">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
