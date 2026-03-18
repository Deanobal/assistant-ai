import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { availableServices, serviceStatusStyles } from './mockClients';

export default function WorkspaceServicesTab({ client, onUpdate }) {
  const [newService, setNewService] = useState('');
  const [newStatus, setNewStatus] = useState('Active');

  const addService = () => {
    if (!newService) return;
    onUpdate({
      services: [...client.services, { name: newService, status: newStatus, price: 180 }],
    });
    setNewService('');
    setNewStatus('Active');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h3 className="text-white font-semibold text-lg">Service Management</h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onUpdate({ plan_name: 'Scale', monthly_fee: client.monthly_fee + 600 })} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">Upgrade Plan</Button>
              <Button size="sm" variant="outline" onClick={() => onUpdate({ plan_name: 'Starter', monthly_fee: Math.max(990, client.monthly_fee - 600) })} className="border-white/10 text-white hover:bg-white/5">Downgrade Plan</Button>
              <Button size="sm" variant="outline" onClick={() => onUpdate({ extra_call_packs: client.extra_call_packs + 1 })} className="border-white/10 text-white hover:bg-white/5">Add Call Pack</Button>
              <Button size="sm" variant="outline" onClick={() => onUpdate({ included_calls: client.included_calls + 250 })} className="border-white/10 text-white hover:bg-white/5">Increase Monthly Usage</Button>
              <Button size="sm" variant="outline" onClick={() => onUpdate({ status: 'Paused' })} className="border-white/10 text-white hover:bg-white/5">Pause Service</Button>
              <Button size="sm" variant="outline" onClick={() => onUpdate({ status: 'Cancelled' })} className="border-white/10 text-white hover:bg-white/5">Cancel Service</Button>
            </div>
          </div>

          <div className="grid gap-4">
            {client.services.map((service) => (
              <div key={service.name} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <p className="text-white font-medium">{service.name}</p>
                    <p className="text-sm text-gray-500">${service.price.toLocaleString()} / month</p>
                  </div>
                  <Badge className={serviceStatusStyles[service.status]}>{service.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Active', 'Inactive', 'Trial', 'Add-on'].map((status) => (
                    <Button key={status} size="sm" variant="outline" onClick={() => onUpdate({ services: client.services.map((item) => item.name === service.name ? { ...item, status } : item) })} className="border-white/10 text-white hover:bg-white/5">Set {status}</Button>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => onUpdate({ services: client.services.filter((item) => item.name !== service.name) })} className="border-white/10 text-white hover:bg-white/5">Remove Service</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 grid md:grid-cols-[1fr_180px_auto] gap-4 items-end">
          <div>
            <p className="text-sm text-gray-400 mb-2">Add Service</p>
            <Select value={newService} onValueChange={setNewService}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue placeholder="Choose a service" /></SelectTrigger>
              <SelectContent>
                {availableServices.filter((service) => !client.services.some((item) => item.name === service)).map((service) => (
                  <SelectItem key={service} value={service}>{service}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Status</p>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Active', 'Inactive', 'Trial', 'Add-on'].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addService} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">Add One-Time Service</Button>
        </CardContent>
      </Card>
    </div>
  );
}