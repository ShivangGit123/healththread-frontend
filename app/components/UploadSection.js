"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Upload, Loader2, Check, AlertTriangle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function UploadSection({ patientName, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_name", patientName);

    try {
      const res = await axios.post(`${API}/upload`, formData);
      setResult({
        ...res.data,
        report_type: res.data.report_type === "Unknown" || !res.data.report_type
          ? "Report"
          : res.data.report_type,
      });

      setFile(null);
      onUploadSuccess?.();
    } catch (err) {
      setError("Upload failed. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[var(--surface)] rounded-xl p-4">
      <p className="text-sm font-medium text-white mb-3">Upload Report</p>

      <motion.div
        whileHover={{ borderColor: "var(--accent)", scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="border border-dashed border-[var(--border)] rounded-lg p-4 text-center cursor-pointer transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => { setFile(e.target.files[0]); setError(null); }}
        />
        <motion.div
          animate={file ? { rotate: [0, -10, 10, 0], y: -2 } : {}}
          transition={{ duration: 0.4 }}
        >
          <Upload className="w-5 h-5 text-[var(--text-secondary)] mx-auto mb-1.5" />
        </motion.div>
        <AnimatePresence mode="wait">
          {file ? (
            <motion.p
              key="filename"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-[var(--accent)] truncate"
            >
              {file.name}
            </motion.p>
          ) : (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-[var(--text-secondary)]"
            >
              Click to select PDF
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full mt-3 bg-[var(--accent)] hover:brightness-110
                   disabled:opacity-40 disabled:cursor-not-allowed
                   text-white text-sm font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {loading ? "Processing..." : "Process"}
      </motion.button>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 overflow-hidden"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <p className="text-xs text-rose-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 overflow-hidden"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-xs text-emerald-400 font-medium mb-2"
            >
              ✓ {result.report_type} processed
            </motion.p>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(result.summary).map(([k, v], i) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 300, damping: 20 }}
                  className="text-center py-1 bg-black/20 rounded"
                >
                  <p className="text-sm font-semibold text-white">{v}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase">{k}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}