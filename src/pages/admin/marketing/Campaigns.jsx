import { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Send, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import CampaignForm from '@/components/admin/marketing/CampaignForm';
import CampaignCard from '@/components/admin/marketing/CampaignCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts