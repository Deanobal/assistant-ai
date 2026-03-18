import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Pause, Play, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DemoConversation, { transcript } from '../components/demo/DemoConversation';
import DemoAutomationPanel from '../components/demo/DemoAutomationPanel';

const steps = [
'Incoming call answered instantly',
'Lead qualification questions handled by AI',
'Customer details and urgency captured',
'CRM update and follow-up triggered automatically'];


export default function AIDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= steps.length - 1) return;

    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 1800);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (!isPlaying || !isVoiceEnabled) return;

    const message = transcript[currentStep];
    if (!message) return;

    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.rate = message.role === 'assistant' ? 1 : 0.96;
    utterance.pitch = message.role === 'assistant' ? 1.05 : 0.92;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);

    return () => window.speechSynthesis.cancel();
  }, [currentStep, isPlaying, isVoiceEnabled]);

  const handleRestart = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentStep(0);
    setIsPlaying(true);
  };

  return (
    <div>
      <section className="relative py-24 md:py-28 bg-grid">
        <div className="bg-radial-glow absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14">
            
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-cyan-300 text-xs font-medium mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              AI Demo
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white max-w-4xl mx-auto">Watch How Assistant AI Handles a Lead from Call to Follow-Up

            </h1>
            <p className="mt-5 text-lg text-gray-400 max-w-3xl mx-auto">
              This demo shows how an AI receptionist can answer the call, qualify the lead, update the workflow, and trigger follow-up automatically.
            </p>
          </motion.div>

          <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
            <DemoConversation currentStep={currentStep} />
            <DemoAutomationPanel currentStep={currentStep} />
          </div>

          <div className="mt-8 rounded-[28px] border border-white/8 bg-[#11111a] p-5 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">Current Step</p>
                <p className="mt-2 text-white font-medium text-lg">{steps[currentStep]}</p>
                <p className="mt-2 text-sm text-gray-500">The demo now uses your browser voice to read the conversation aloud.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsPlaying((prev) => !prev)}
                  className="border-white/10 bg-transparent text-white hover:bg-white/5">
                  
                  {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                  {isPlaying ? 'Pause Demo' : 'Play Demo'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsVoiceEnabled((prev) => !prev)}
                  className="border-white/10 bg-transparent text-white hover:bg-white/5">
                  
                  {isVoiceEnabled ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
                  {isVoiceEnabled ? 'Voice On' : 'Voice Off'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRestart}
                  className="border-white/10 bg-transparent text-white hover:bg-white/5">
                  
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restart
                </Button>
                <Link to="/Contact">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25">
                    Book Free Strategy Call
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>);

}