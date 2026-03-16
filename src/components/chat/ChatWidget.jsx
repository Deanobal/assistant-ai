import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ChatBubble from './ChatBubble';

const questions = [
  {
    key: 'businessType',
    prompt: 'What type of business are you running?',
    options: ['Trades', 'Clinic', 'Real Estate'],
  },
  {
    key: 'goal',
    prompt: 'What would you most like AssistantAI.com.au to help with?',
    options: ['Answer missed calls', 'Book appointments', 'Automate follow-up'],
  },
  {
    key: 'volume',
    prompt: 'How many inbound calls or enquiries do you roughly get each week?',
    options: ['Less than 20', '20–100', '100+'],
  },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState('');

  const currentQuestion = questions[step];
  const isComplete = step >= questions.length;

  const messages = useMemo(() => {
    const items = [
      {
        role: 'assistant',
        content: 'Hi — I’m the AssistantAI concierge. I can help qualify what kind of AI setup may suit your business in under a minute.',
      },
    ];

    questions.forEach((question, index) => {
      if (index <= step) {
        items.push({ role: 'assistant', content: question.prompt });
      }
      if (answers[question.key]) {
        items.push({ role: 'user', content: answers[question.key] });
      }
    });

    if (isComplete) {
      items.push({
        role: 'assistant',
        content: `Based on what you've shared, AssistantAI.com.au could likely help with ${answers.goal?.toLowerCase() || 'lead qualification'} for your ${answers.businessType?.toLowerCase() || 'business'} workflow.`,
      });
    }

    return items;
  }, [answers, isComplete, step]);

  const handleOptionClick = (value) => {
    const key = currentQuestion.key;
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setStep((prev) => prev + 1);
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers({});
    setName('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b13]/95 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl"
          >
            <div className="border-b border-white/8 bg-white/[0.03] px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1 text-[11px] text-cyan-300">
                    <Sparkles className="h-3 w-3" />
                    AI Lead Qualification
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-white">Chat with AssistantAI</h3>
                  <p className="mt-1 text-xs text-gray-400">Friendly qualification for Australian service businesses.</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:border-white/20 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 px-4 py-4 max-h-[420px] overflow-y-auto">
              {messages.map((message, index) => (
                <ChatBubble key={`${message.role}-${index}`} role={message.role}>
                  {message.content}
                </ChatBubble>
              ))}
            </div>

            <div className="border-t border-white/8 px-4 py-4">
              {!isComplete ? (
                <div className="grid grid-cols-1 gap-2">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleOptionClick(option)}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-gray-200 transition hover:border-cyan-500/30 hover:bg-cyan-500/5"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="bg-white/[0.03] border-white/10 text-white placeholder:text-gray-500"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link to="/Contact" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25">
                        Book Free Strategy Call
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={handleRestart}
                      className="border-white/10 bg-transparent text-white hover:bg-white/5"
                    >
                      Restart
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {name ? `Thanks ${name}. ` : ''}When you’re ready, book a strategy call and we’ll map the right workflow for your business.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center gap-3 rounded-full border border-white/10 bg-[#0b0b13]/90 px-4 py-3 text-white shadow-xl shadow-cyan-500/10 backdrop-blur-xl transition hover:border-cyan-500/30 hover:bg-[#11111a]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500">
          <MessageCircle className="h-5 w-5 text-white" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium">Chat with AssistantAI</p>
          <p className="text-xs text-gray-400">AI lead qualification</p>
        </div>
      </button>
    </div>
  );
}