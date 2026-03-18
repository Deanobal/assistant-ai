import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Pause, Play, RotateCcw, Sparkles, Volume2, VolumeX, PhoneCall } from 'lucide-react';
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
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => setVoicesLoaded(true);
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const selectedVoices = useMemo(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return { caller: null, assistant: null };
    }

    const voices = window.speechSynthesis.getVoices();
    const findVoice = (keywords) =>
      voices.find((voice) => keywords.some((keyword) => voice.name.toLowerCase().includes(keyword))) || null;

    return {
      assistant: findVoice(['samantha', 'aria', 'zira', 'google uk english female', 'female']) || voices[0] || null,
      caller: findVoice(['daniel', 'alex', 'google uk english male', 'male']) || voices[1] || voices[0] || null,
    };
  }, [voicesLoaded]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    if (!isPlaying) return;

    const message = transcript[currentStep];
    if (!message) return;

    const moveToNextStep = () => {
      if (currentStep < steps.length - 1) {
        setTimeout(() => {
          setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }, 700);
      }
    };

    if (!isVoiceEnabled) {
      moveToNextStep();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.voice = message.role === 'assistant' ? selectedVoices.assistant : selectedVoices.caller;
    utterance.rate = message.role === 'assistant' ? 0.98 : 0.94;
    utterance.pitch = message.role === 'assistant' ? 1.02 : 0.92;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      moveToNextStep();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      moveToNextStep();
    };
    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [currentStep, isPlaying, isVoiceEnabled, selectedVoices]);

  const handleRestart = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentStep(0);
    setIsPlaying(true);
    setIsSpeaking(false);
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white max-w-4xl mx-auto">Watch How AssistantAI.com.au Handles a Lead from Call to Follow-Up

            </h1>
            <p className="mt-5 text-lg text-gray-400 max-w-3xl mx-auto">
              This demo now uses more natural browser-selected voices and turn-by-turn playback so it feels closer to a real AI phone interaction.
            </p>
          </motion.div>

          <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
            <DemoConversation currentStep={currentStep} />
            <DemoAutomationPanel currentStep={currentStep} />
          </div>

          <div className="mt-8 rounded-[28px] border border-white/8 bg-[#11111a] p-5 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">Current Step</p>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-gray-300">
                    <PhoneCall className="h-3.5 w-3.5 text-cyan-400" />
                    {isSpeaking ? 'Speaking live' : 'Waiting for next turn'}
                  </div>
                </div>
                <p className="mt-2 text-white font-medium text-lg">{steps[currentStep]}</p>
                <p className="mt-2 text-sm text-gray-500">The demo now uses more natural browser-selected voices and advances after each spoken turn.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPlaying) {
                      window.speechSynthesis.cancel();
                    }
                    setIsPlaying((prev) => !prev);
                  }}
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