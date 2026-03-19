import React from 'react';
import { motion } from 'framer-motion';
import IntegrationCard from './IntegrationCard';

export default function IntegrationSection({ section, onAction, isSaving }) {
  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">{section.title}</h3>
        <p className="text-gray-400 max-w-3xl">{section.description}</p>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        {section.items.map((item, index) => (
          <motion.div
            key={item.appName}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <IntegrationCard item={item} features={section.features} onAction={onAction} isSaving={isSaving} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}