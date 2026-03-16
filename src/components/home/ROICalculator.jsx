import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ROICalculator() {
  const [inputs, setInputs] = useState({
    monthlyCallVolume: '',
    avgLeadValue: '',
    missedCallRate: ''
  });

  const calculate = () => {
    const volume = parseFloat(inputs.monthlyCallVolume) || 0;
    const leadValue = parseFloat(inputs.avgLeadValue) || 0;
    const missedRate = parseFloat(inputs.missedCallRate) || 0;

    const missedCalls = volume * (missedRate / 100);
    const capturedCalls = missedCalls * 0.95; // AI captures 95% of missed calls
    const conversionRate = 0.30; // 30% conversion
    const newLeads = capturedCalls * conversionRate;
    const monthlyRevenue = newLeads * leadValue;
    const yearlyRevenue = monthlyRevenue * 12;

    return {
      missedCalls: Math.round(missedCalls),
      capturedCalls: Math.round(capturedCalls),
      newLeads: Math.round(newLeads),
      monthlyRevenue: monthlyRevenue.toFixed(0),
      yearlyRevenue: yearlyRevenue.toFixed(0)
    };
  };

  const results = calculate();
  const hasInputs = inputs.monthlyCallVolume && inputs.avgLeadValue && inputs.missedCallRate;

  return (
    <section className="relative py-20 md:py-24 bg-[#0c0c14]">
      <div className="bg-radial-glow absolute inset-0" />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-4">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-lg font-medium">ROI Calculator</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Calculate Your{' '}
            <span className="text-gradient">Revenue Opportunity</span>
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
            Estimate how much revenue missed calls could be costing your business each month.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}>

            <Card className="bg-[#12121a] border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-lg">Your Business Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Monthly Call Volume</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 500"
                    value={inputs.monthlyCallVolume}
                    onChange={(e) => setInputs({ ...inputs, monthlyCallVolume: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20" />

                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Average Lead Value ($)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 500"
                    value={inputs.avgLeadValue}
                    onChange={(e) => setInputs({ ...inputs, avgLeadValue: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20" />

                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Current Missed Call Rate (%)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 20"
                    value={inputs.missedCallRate}
                    onChange={(e) => setInputs({ ...inputs, missedCallRate: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20" />

                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}>

            <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Your Revenue Opportunity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasInputs ?
                <>
                    <div className="p-4 rounded-xl bg-[#0a0a0f]/50 border border-white/5">
                      <p className="text-gray-400 text-sm mb-1">Currently Missing</p>
                      <p className="text-2xl font-bold text-white">{results.missedCalls} calls/month</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0a0a0f]/50 border border-white/5">
                      <p className="text-gray-400 text-sm mb-1">AI Can Capture</p>
                      <p className="text-2xl font-bold text-cyan-400">{results.capturedCalls} calls/month</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0a0a0f]/50 border border-white/5">
                      <p className="text-gray-400 text-sm mb-1">Potential New Leads</p>
                      <p className="text-2xl font-bold text-cyan-400">{results.newLeads} leads/month</p>
                    </div>
                    <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500">
                      <p className="text-white/80 text-sm mb-1">Estimated Revenue Recapture</p>
                      <p className="text-3xl font-bold text-white">${parseInt(results.monthlyRevenue).toLocaleString()}/mo</p>
                      <p className="text-white/60 text-xs mt-1">${parseInt(results.yearlyRevenue).toLocaleString()}/year</p>
                    </div>
                    <p className="text-gray-500 text-xs text-center mt-4">
                      *Based on 95% call capture rate and 30% conversion rate
                    </p>
                  </> :

                <div className="py-12 text-center">
                    <Calculator className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Enter your metrics to see your revenue opportunity</p>
                  </div>
                }
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>);

}