"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Loader2, ShieldCheck, AlertTriangle, Pill } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export default function RiskSection({ patientName }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const check = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${API}/risks/${encodeURIComponent(patientName)}`
      );
      setData(res.data);
    } catch {
      setError("Could not run risk check. Please check that the backend is running.");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Risk Analysis</h2>
          <p className="text-sm text-[var(--text-secondary)]">Clinical risk assessment from your records</p>
        </div>
        {!data && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={check}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40
                       text-white text-sm font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Scanning..." : "Run Check"}
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 mb-4"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="text-sm text-rose-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!data && !loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-[var(--text-secondary)] text-sm"
        >
          Click "Run Check" to scan for risks and abnormalities.
        </motion.div>
      )}

      {loading && !data && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-[var(--text-secondary)]">Scanning records...</p>
        </motion.div>
      )}

      <AnimatePresence>
        {data && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {/* All clear */}
            {data.abnormal_labs?.length === 0 && data.findings?.length === 0 && (
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-400">No major risks detected</p>
                  <p className="text-xs text-[var(--text-secondary)]">All records appear within normal ranges.</p>
                </div>
              </motion.div>
            )}

            {/* Abnormal Labs */}
            {data.abnormal_labs?.length > 0 && (
              <motion.div variants={fadeUp}>
                <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  Abnormal Lab Values
                </h3>
                <div className="space-y-1.5">
                  {data.abnormal_labs.map((lab, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 22 }}
                      className="flex justify-between items-center bg-[var(--bg)] rounded-lg px-3 py-2 text-sm"
                    >
                      <span className="text-[var(--text-secondary)]">{lab.test}</span>
                      <span className="font-medium text-rose-400">
                        {lab.value} {lab.unit} · {lab.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Findings */}
            {data.findings?.length > 0 && (
              <motion.div variants={fadeUp}>
                <h3 className="text-sm font-medium text-white mb-2">Findings</h3>
                <div className="space-y-1.5">
                  {data.findings.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-[var(--bg)] rounded-lg px-3 py-2 text-sm text-amber-300"
                    >
                      {f.finding}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Medications */}
            {data.medications?.length > 0 && (
              <motion.div variants={fadeUp}>
                <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-blue-400" />
                  Active Medications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.medications.map((m, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 20 }}
                      whileHover={{ scale: 1.06 }}
                      className="bg-[var(--bg)] border border-[var(--border)] rounded-full px-3 py-1 text-xs text-[var(--text-secondary)]"
                    >
                      {m.medication}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}