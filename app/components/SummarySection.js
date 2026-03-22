"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Loader2, AlertTriangle, FileText } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export default function SummarySection({ patientName }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${API}/summary/${encodeURIComponent(patientName)}`
      );
      setData(res.data);
    } catch {
      setError("Could not generate summary. Please check that the backend is running.");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Health Overview</h2>
          <p className="text-sm text-[var(--text-secondary)]">AI-generated summary of your records</p>
        </div>
        {!data && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={generate}
            disabled={loading}
            className="bg-[var(--accent)] hover:brightness-110 disabled:opacity-40
                       text-white text-sm font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Generating..." : "Generate Summary"}
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
          Click "Generate Summary" to synthesize your health records.
        </motion.div>
      )}

      {loading && !data && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin mx-auto mb-2" />
          <p className="text-sm text-[var(--text-secondary)]">Analyzing records...</p>
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
            {/* Summary */}
            <motion.div variants={fadeUp} className="border-l-2 border-[var(--accent)] pl-4">
              <h3 className="text-sm font-medium text-white mb-2">Summary</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {data.summary}
              </p>
            </motion.div>

            {/* Doctor Questions */}
            <motion.div variants={fadeUp} className="border-l-2 border-emerald-500 pl-4">
              <h3 className="text-sm font-medium text-white mb-2">Questions for your Doctor</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {data.doctor_questions}
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Abnormal Labs */}
              {data.abnormal_labs?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Abnormal Results
                  </h3>
                  <div className="space-y-1.5">
                    {data.abnormal_labs.map((lab, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex justify-between items-center bg-[var(--bg)] rounded-lg px-3 py-2 text-sm"
                      >
                        <span className="text-[var(--text-secondary)]">{lab.test}</span>
                        <span className={`font-medium ${lab.status === "HIGH" ? "text-rose-400" : "text-blue-400"}`}>
                          {lab.value} {lab.unit}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reports */}
              {data.reports?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-violet-400" />
                    Reports
                  </h3>
                  <div className="space-y-1.5">
                    {data.reports.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[var(--bg)] rounded-lg px-3 py-2 text-sm"
                      >
                        <div className="flex justify-between">
                          <span className="text-white">{r.type}</span>
                          <span className="text-[var(--text-secondary)] text-xs">{r.date}</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">{r.hospital}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}