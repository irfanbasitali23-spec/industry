import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, color = 'brand', delay = 0 }) {
  const colors = {
    brand: 'from-brand-500 to-brand-700 shadow-brand-500/20',
    emerald: 'from-emerald-500 to-emerald-700 shadow-emerald-500/20',
    amber: 'from-amber-500 to-amber-700 shadow-amber-500/20',
    violet: 'from-violet-500 to-violet-700 shadow-violet-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card group relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-surface-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colors[color]} text-white shadow-lg transition-transform group-hover:scale-110`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className={`absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${colors[color]} opacity-5`} />
    </motion.div>
  );
}
