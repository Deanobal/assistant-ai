import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pause, Play, RotateCcw, Sparkles, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';
import SEO from '@/components/SEO';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import VapiReceptionistDemoButton from '@/components/voice/VapiReceptionistDemoButton';
import DemoConversation, { transcript } from '@/components/demo/DemoConversation';
import DemoAutomationPanel, { defaultWorkflowItems } from '@/components/demo/DemoAutomationPanel';
import DemoScenarioSelector from '@/components/demo/DemoScenarioSelector';

const steps = [
  'AI answers and qualifies the buyer',
  'Likely plan fit is recommended',
  'Customer details are captured',
  'Secure signup is offered to ready buyers',
  'Setup begins after payment',
];

const capabilities = [
  'Answer questions',
  'Qualify the business',
  'Identify pain points',
  'Recommend Starter, Growth, or Enterprise',
  'Capture contact details',
  'Offer secure signup to ready buyers',
  'Escalate Enterprise for review',
];

const salesFlow = [
  'Customer asks about missed calls',
  'AI qualifies business',
  'AI recommends Starter or Growth',
  'Customer confirms they want to proceed',
  'AI offers secure checkout',
  'Payment is completed',
  'Setup begins',
];

const MESSAGE_DELAY = 2600;

const scenarios = [
  { id: 'trades', label: 'Trades', title: 'Missed-call revenue enquiry', description: 'A trade business asks how to stop losing urgent calls.', context: 'Australian trade business, missed-call problem, goal is qualification, plan recommendation, and signup readiness.' },
  { id: 'clinic', label: 'Clinic', title: 'Front desk overflow enquiry', description: 'A clinic needs help answering calls and booking appointments.', context: 'Australian clinic, appointment overflow, goal is qualification, booking automation, and plan recommendation.' },
  { id: 'realestate', label: 'Real Estate', title: 'High-intent appraisal enquiry', description: 'A real estate office wants faster qualification and follow-up.', context: 'Australian real estate business, appraisal enquiry, goal is lead qualification, organised customer details, and signup readiness.' },
];

export default function AIDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const [demoTranscript, setDemoTranscript] = useState(transcript);
  const [workflowItems, setWorkflowItems] = useState(defaultWorkflowItems);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => setVoicesLoaded(true);
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const selectedVoices = useMemo(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return { caller: null, assistant: null };
    const voices = window.speechSynthesis.getVoices();
    const findVoice = (keywords, excludeName = '') => voices.find((voice) => voice.name !== excludeName && keywords.some((keyword) => voice.name.toLowerCase().includes(keyword))) || null;
    const assistant = findVoice(['samantha', 'aria', 'zira', 'serena', 'female']) || voices[0] || null;
    const caller = findVoice(['daniel', 'alex', 'fred', 'male'], assistant?.name) || voices.find((voice) => voice.name !== assistant?.name) || assistant;
    return { assistant, caller };
  }, [voicesLoaded]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (!isPlaying || !voicesLoaded) return;
    const message = demoTranscript[currentStep];
    if (!message) return;
    const moveToNextStep = () => {
      if (currentStep < steps.length - 1) setTimeout(() => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1)), MESSAGE_DELAY);
    };
    if (!isVoiceEnabled) { moveToNextStep(); return; }
    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.voice = message.role === 'assistant' ? selectedVoices.assistant : selectedVoices.caller;
    utterance.rate = message.role === 'assistant' ? 0.94 : 0.88;
    utterance.pitch = message.role === 'assistant' ? 1.04 : 0.82;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); moveToNextStep(); };
    utterance.onerror = () => { setIsSpeaking(false); moveToNextStep(); };
    window.speechSynthesis.speak(utterance);
    return () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };
  }, [currentStep, isPlaying, isVoiceEnabled, selectedVoices, voicesLoaded, demoTranscript]);

  const handleRestart = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    setCurrentStep(0);
    setIsPlaying(true);
    setIsSpeaking(false);
  };

  const handleGenerateSimulation = () => {
    setIsGenerating(true);
    setGenerationError('');
    setIsPlaying(false);
    base44.integrations.Core.InvokeLLM({
      prompt: `Create a realistic Australian business phone call simulation for this scenario: ${selectedScenario.context}. Return exactly 5 messages showing the AI answering, qualifying, recommending Starter/Growth/Enterprise, and moving a ready buyer toward secure signup. Enterprise must be escalated for review, not closed automatically.`,
      response_json_schema: {
        type: 'object',
        properties: {
          transcript: { type: 'array', items: { type: 'object', properties: { role: { type: 'string', enum: ['caller', 'assistant'] }, text: { type: 'string' } }, required: ['role', 'text'] } },
          workflow: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, desc: { type: 'string' } }, required: ['title', 'desc'] } },
        },
        required: ['transcript', 'workflow'],
      },
    }).then((result) => {
      setDemoTranscript(result.transcript);
      setWorkflowItems(result.workflow.map((item, index) => ({ ...defaultWorkflowItems[index], title: item.title, desc: item.desc })));
      setCurrentStep(0);
      setIsPlaying(true);
    }).catch((error) => {
      console.warn('Demo generation failed:', error?.message || error);
      setGenerationError('The custom simulation could not be generated right now. The standard demo is still available.');
    }).finally(() => setIsGenerating(false));
  };

  return (
    <>
      <SEO
        title="Live AI Receptionist Demo | AssistantAI"
        description="Try the AssistantAI receptionist demo and see how it answers enquiries, qualifies buyers, recommends Starter or Growth, and escalates Enterprise workflows for review."
        canonicalPath="/AIDemo"
      />
      <div>
        <section className="relative py-24 md:py-28 bg-grid">
          <div className="bg-radial-glow absolute inset-0" />
          <div className="relative max-w-7xl mx-auto px-6 md:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-cyan-300 text-xs font-medium mb-5">
                <Sparkles className="h-3.5 w-3.5" /> Live AI Receptionist Demo
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white max-w-4xl mx-auto">See How AssistantAI Handles a Real Buyer</h1>
              <p className="mt-5 text-lg text-gray-400 max-w-3xl mx-auto">Experience how AssistantAI handles a real enquiry — from answering the call to qualifying the buyer, recommending a plan, and moving them toward secure signup.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <VapiReceptionistDemoButton className="px-8 py-3.5" showFallbackText />
                <Link to="/GetStartedNow" className="inline-flex min-h-[3.5rem] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-8 py-3.5 font-semibold text-white">Get Started Now</Link>
              </div>
            </motion.div>

            <div className="mb-10 grid gap-6 lg:grid-cols-3">
              <div className="rounded-[28px] border border-white/5 bg-[#12121a] p-6 lg:col-span-1">
                <h2 className="text-xl font-bold text-white mb-4">What the AI Can Do</h2>
                <div className="space-y-3">{capabilities.map((item) => <div key={item} className="flex gap-3 text-gray-300"><CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-300" />{item}</div>)}</div>
              </div>
              <div className="rounded-[28px] border border-white/5 bg-[#12121a] p-6 lg:col-span-2">
                <h2 className="text-xl font-bold text-white mb-4">Example Sales Flow</h2>
                <div className="grid gap-3 sm:grid-cols-2">{salesFlow.map((item, index) => <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-gray-300"><span className="text-cyan-300">{index + 1}. </span>{item}</div>)}</div>
              </div>
            </div>

            <DemoScenarioSelector scenarios={scenarios} selectedScenario={selectedScenario} onSelect={setSelectedScenario} onGenerate={handleGenerateSimulation} isGenerating={isGenerating} />
            {generationError && <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{generationError}</div>}
            <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
              <DemoConversation currentStep={currentStep} messages={demoTranscript} />
              <DemoAutomationPanel currentStep={currentStep} items={workflowItems} />
            </div>

            <div className="mt-8 rounded-[28px] border border-white/8 bg-[#11111a] p-5 md:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">Honest Limits</p>
                  <p className="mt-2 text-white font-medium text-lg">Starter and Growth buyers can be guided toward secure checkout. Enterprise or complex workflows are escalated for review.</p>
                  <p className="mt-2 text-sm text-gray-500">{isSpeaking ? 'AI speaking live' : workflowItems[currentStep]?.title || steps[currentStep]}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => { if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPlaying) window.speechSynthesis.cancel(); setIsPlaying((prev) => !prev); }} className="border-white/10 bg-transparent text-white hover:bg-white/5">{isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}{isPlaying ? 'Pause Demo' : 'Play Demo'}</Button>
                  <Button variant="outline" onClick={() => setIsVoiceEnabled((prev) => !prev)} className="border-white/10 bg-transparent text-white hover:bg-white/5">{isVoiceEnabled ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}{isVoiceEnabled ? 'Voice On' : 'Voice Off'}</Button>
                  <Button variant="outline" onClick={handleRestart} className="border-white/10 bg-transparent text-white hover:bg-white/5"><RotateCcw className="mr-2 h-4 w-4" />Restart</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
