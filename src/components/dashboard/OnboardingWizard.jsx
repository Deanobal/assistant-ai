import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, BookOpen, User, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const steps = [
  {
    id: 1,
    title: 'Connect Your Phone System',
    icon: Phone,
    description: 'Link your business phone to start capturing calls',
  },
  {
    id: 2,
    title: 'Build Your Knowledge Base',
    icon: BookOpen,
    description: 'Add FAQs and key information for your AI to use',
  },
  {
    id: 3,
    title: 'Define Your AI Persona',
    icon: User,
    description: 'Customize how your AI assistant sounds and behaves',
  },
];

export default function OnboardingWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    companyName: '',
    faqs: '',
    aiName: '',
    aiTone: '',
    greeting: '',
  });

  const isStepComplete = () => {
    if (currentStep === 0) return formData.phoneNumber && formData.companyName;
    if (currentStep === 1) return formData.faqs;
    if (currentStep === 2) return formData.aiName && formData.aiTone && formData.greeting;
    return false;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, i) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  i <= currentStep 
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-500' 
                    : 'bg-[#12121a] border border-white/10'
                }`}>
                  {i < currentStep ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <step.icon className={`w-5 h-5 ${i <= currentStep ? 'text-white' : 'text-gray-600'}`} />
                  )}
                </div>
                <p className={`text-xs mt-2 ${i <= currentStep ? 'text-white' : 'text-gray-600'}`}>
                  Step {i + 1}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all ${
                  i < currentStep ? 'bg-cyan-500' : 'bg-white/10'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-[#12121a] border border-white/5 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-2">{steps[currentStep].title}</h2>
          <p className="text-gray-400 mb-6">{steps[currentStep].description}</p>

          <div className="space-y-5">
            {currentStep === 0 && (
              <>
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Business Phone Number</Label>
                  <Input
                    placeholder="+61 4XX XXX XXX"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Company Name</Label>
                  <Input
                    placeholder="Your Business Name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                  />
                </div>
              </>
            )}

            {currentStep === 1 && (
              <div className="space-y-2">
                <Label className="text-gray-400 text-sm">Frequently Asked Questions & Key Information</Label>
                <Textarea
                  placeholder="Add your most common questions and answers, business hours, services offered, pricing information, etc."
                  value={formData.faqs}
                  onChange={(e) => setFormData({ ...formData, faqs: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-48"
                />
              </div>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">AI Assistant Name</Label>
                  <Input
                    placeholder="e.g. Sarah, Alex, etc."
                    value={formData.aiName}
                    onChange={(e) => setFormData({ ...formData, aiName: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Tone & Personality</Label>
                  <Input
                    placeholder="e.g. Friendly and professional, casual and upbeat, etc."
                    value={formData.aiTone}
                    onChange={(e) => setFormData({ ...formData, aiTone: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Custom Greeting</Label>
                  <Textarea
                    placeholder="Thank you for calling [Company Name], this is [AI Name]. How can I help you today?"
                    value={formData.greeting}
                    onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-24"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <Button
              onClick={handleBack}
              disabled={currentStep === 0}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepComplete()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25"
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}