"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Send, Loader2, Code, AlertTriangle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const SUGGESTIONS = [
  "What conditions do I have?",
  "Which lab results are abnormal?",
  "What reports do I have?",
  "Who was my doctor?",
];

export default function QuestionSection({ patientName }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const ask = async (q) => {
    const finalQ = q || question;
    if (!finalQ) return;
    setQuestion(finalQ);
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await axios.post(`${API}/ask`, {
        question: finalQ,
        patient_name: patientName
      });
      setResult(res.data);
    } catch {
      setError("Could not get an answer. Please check that the backend is running.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Ask a Question</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-5">
        Query your health records using natural language.
      </p>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SUGGESTIONS.map((q, i) => (
          <motion.button
            key={q}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 22 }}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => ask(q)}
            className="text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)]
                       px-3 py-1.5 rounded-full hover:text-white hover:border-[var(--text-secondary)] transition-colors"
          >
            {q}
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Ask anything about your health..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg
                     px-4 py-2.5 text-sm text-white placeholder-[var(--text-secondary)]
                     focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => ask()}
          disabled={loading || !question}
          className="bg-[var(--accent)] hover:brightness-110 disabled:opacity-40
                     text-white px-4 rounded-lg transition-all flex items-center"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 mb-4 overflow-hidden"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="text-sm text-rose-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] py-4"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Querying knowledge graph...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="space-y-3"
          >
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="border-l-2 border-[var(--accent)] pl-4"
            >
              <p className="text-sm text-white leading-relaxed whitespace-pre-line">
                {result.answer}
              </p>
            </motion.div>

            <motion.details
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--bg)] border border-[var(--border)] rounded-lg overflow-hidden text-sm"
            >
              <summary className="cursor-pointer px-4 py-2.5 text-[var(--text-secondary)] hover:text-white flex items-center gap-2">
                <Code className="w-3.5 h-3.5" />
                Technical details
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-[var(--border)] space-y-3">
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-wider font-medium">Cypher</p>
                  <pre className="bg-[var(--surface)] rounded p-3 text-xs text-blue-300 overflow-x-auto whitespace-pre-wrap">
                    {result.cypher}
                  </pre>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-wider font-medium">Data</p>
                  <pre className="bg-[var(--surface)] rounded p-3 text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.details>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}