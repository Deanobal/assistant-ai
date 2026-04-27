import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const templates = {
  follow_up: {
    name: 'Follow-Up',
    defaultSubject: 'Following up on your strategy call request',
    defaultBody: 'Hi {name},\n\nWe wanted to follow up regarding your interest in AssistantAI...',
  },
  promotional: {
    name: 'Promotional',
    defaultSubject: 'Limited offer: Save 20% on your first month',
    defaultBody: 'Hi {name},\n\nWe\'re offering a special promotional rate for new clients...',
  },
  announcement: {
    name: 'Announcement',
    defaultSubject: 'Exciting news about AssistantAI',
    defaultBody: 'Hi {name},\n\nWe\'re excited to announce new features in AssistantAI...',
  },
  custom: {
    name: 'Custom',
    defaultSubject: '',
    defaultBody: '',
  },
};

const segments = [
  { value: 'New Lead', label: 'New Leads' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Strategy Call Requested', label: 'Strategy Call Requested' },
  { value: 'Follow-Up', label: 'Follow-Up' },
];

export default function CampaignForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    template: 'follow_up',
    segment: 'New Lead',
    subject: '',
    body: '',
    ctaText: '',
    ctaUrl: '',
    scheduledDate: '',
  });

  const handleTemplateChange = (template) => {
    const tmpl = templates[template];
    setFormData((prev) => ({
      ...prev,
      template,
      subject: tmpl.defaultSubject,
      body: tmpl.defaultBody,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campaign Name */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Campaign Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Q2 Follow-Up Campaign"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
          required
        />
      </div>

      {/* Type & Template */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Campaign Type</label>
          <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="email_sms">Email & SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Template</label>
          <Select value={formData.template} onValueChange={handleTemplateChange}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(templates).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Segment */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Target Segment</label>
        <Select value={formData.segment} onValueChange={(value) => setFormData((prev) => ({ ...prev, segment: value }))}>
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {segments.map((seg) => (
              <SelectItem key={seg.value} value={seg.value}>
                {seg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Subject Line</label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
          placeholder="Enter email subject or SMS title"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
          required
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Message Body</label>
        <textarea
          value={formData.body}
          onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))}
          placeholder="Enter your message (use {name} for personalization)"
          rows="6"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none resize-none"
          required
        />
      </div>

      {/* CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">CTA Text (Optional)</label>
          <input
            type="text"
            value={formData.ctaText}
            onChange={(e) => setFormData((prev) => ({ ...prev, ctaText: e.target.value }))}
            placeholder="e.g., Book Your Call"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">CTA URL (Optional)</label>
          <input
            type="url"
            value={formData.ctaUrl}
            onChange={(e) => setFormData((prev) => ({ ...prev, ctaUrl: e.target.value }))}
            placeholder="https://example.com"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Schedule */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Schedule (Optional)</label>
        <input
          type="datetime-local"
          value={formData.scheduledDate}
          onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Campaign
        </Button>
      </div>
    </form>
  );
}