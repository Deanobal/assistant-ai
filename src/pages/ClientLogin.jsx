import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ClientLogin() {
  const handleLogin = () => {
    base44.auth.redirectToLogin('/ClientPortal');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">

        <Card className="bg-[#12121a] border-white/5 shadow-2xl shadow-cyan-500/5">
          































          
        </Card>
      </motion.div>
    </div>);

}