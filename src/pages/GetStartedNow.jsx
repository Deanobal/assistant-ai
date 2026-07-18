import { useState } from 'react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import CheckoutReturnCard from '@/components/pricing/CheckoutReturnCard';
import PlanSelectionStep from '@/components/get-started/PlanSelectionStep';
import SignupDetailsForm from '@/components/get-started/SignupDetailsForm';
import SignupReviewStep from '@/components/get-started/SignupReviewStep';
import { getPlanFromUrl, getPlanByName } from '@/components/get-started/planConfig';