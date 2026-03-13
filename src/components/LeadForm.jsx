import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const industries = [
  { value: 'trades', label: 'Trades' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'medical_clinic', label: 'Medical Clinic' },
  { value: 'dental_clinic', label: 'Dental Clinic' },
  { value: 'law_firm', label: 'Law Firm' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'other', label: 'Other' },
];

export default function LeadForm() {
  const [form, setForm] = useState({
    full_name: '',
    business_name: '',
    phone: '',
    email: '',
    industry: '',
    automation_interest: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.Lead.create(form);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-cyan-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
        <p className="text-gray-400">We'll be in touch within 24 hours to schedule your free strategy call.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-gray-400 text-sm">Full Name *</Label>
          <Input
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
            placeholder="John Smith"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-400 text-sm">Business Name</Label>
          <Input
            value={form.business_name}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
            placeholder="Smith's Plumbing"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-gray-400 text-sm">Phone</Label>
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
            placeholder="+61 4XX XXX XXX"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-400 text-sm">Email *</Label>
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
            placeholder="john@business.com.au"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-400 text-sm">Industry</Label>
        <Select
          value={form.industry}
          onValueChange={(value) => setForm({ ...form, industry: value })}
        >
          <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20">
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map(ind => (
              <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-400 text-sm">What do you want to automate?</Label>
        <Textarea
          value={form.automation_interest}
          onChange={(e) => setForm({ ...form, automation_interest: e.target.value })}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 h-24"
          placeholder="e.g. answering phone calls, booking appointments, following up with leads..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Book Free AI Strategy Call
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}