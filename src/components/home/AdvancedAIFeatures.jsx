import { FileText, MessageSquareText, Tags, SmilePlus } from 'lucide-react';

const features = [
{
  icon: FileText,
  title: 'Call Summarisation',
  description: 'Auto-generated summaries with key points, customer needs, and clear action items after every call.'
},
{
  icon: MessageSquareText,
  title: 'Call Transcription',
  description: 'Accurate speech-to-text transcripts with speaker identification so conversations are easy to review.'
},
{
  icon: Tags,
  title: 'Smart Tagging',
  description: 'Apply relevant tags to calls based on topics, urgency, sentiment, service type, and outcomes.'
},
{
  icon: SmilePlus,
  title: 'Sentiment Analysis',
  description: 'Detect positive, neutral, or negative sentiment to help your team prioritise follow-up faster.'
}];


export default function AdvancedAIFeatures() {
  return (
    <section className="relative bg-[#070a12] py-16 md:py-24">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 text-lg font-medium text-cyan-400">ADVANCED AI FEATURES</p>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Call intelligence built into every conversation</h2>
          <p className="mt-4 text-base leading-7 text-slate-400">AssistantAI.com.au helps your team understand what happened, what matters, and what action should happen next.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) =>
          <div key={feature.title} className="rounded-2xl border border-white/10 bg-[#12121a] p-6 card-hover">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                <feature.icon className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
              <p className="leading-relaxed text-gray-400 text-lg">{feature.description}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}