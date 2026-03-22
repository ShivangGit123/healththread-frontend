"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Loader2, Dna, AlertTriangle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function GraphSection({ patientName }) {
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  const fetchGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${API}/graph/${encodeURIComponent(patientName)}`
      );
      setGraphData(res.data);
    } catch {
      setError("Could not load graph. Please check that the backend is running.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!graphData || !canvasRef.current) return;
    drawGraph(graphData);
  }, [graphData]);

  const drawGraph = (data) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 500 * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width, h = 500;
    ctx.clearRect(0, 0, w, h);

    const palette = {
      Patient:    "#5b8af5",
      Report:     "#8b5cf6",
      Doctor:     "#06b6d4",
      LabTest:    "#f59e0b",
      Condition:  "#ef4444",
      Hospital:   "#ec4899",
      Finding:    "#f97316",
      Symptom:    "#eab308",
      Medication: "#10b981",
    };

    const { nodes, edges } = data;
    const cx = w / 2, cy = h / 2;
    const r = Math.min(cx, cy) - 70;

    nodes.forEach((n, i) => {
      if (i === 0) { n.x = cx; n.y = cy; }
      else {
        const a = (2 * Math.PI * i) / nodes.length;
        n.x = cx + r * Math.cos(a);
        n.y = cy + r * Math.sin(a);
      }
    });

    // Edges
    edges.forEach(e => {
      const from = nodes.find(n => n.id === e.from);
      const to = nodes.find(n => n.id === e.to);
      if (!from || !to) return;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = "#2a2a30";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#555";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(e.label, (from.x + to.x) / 2, (from.y + to.y) / 2 - 4);
    });

    // Nodes
    nodes.forEach(n => {
      const color = palette[n.type] || "#888";
      const size = n.type === "Patient" ? 28 : 18;
      ctx.beginPath();
      ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `${n.type === "Patient" ? "11" : "9"}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = n.label.length > 14 ? n.label.substring(0, 12) + "…" : n.label;
      ctx.fillText(label, n.x, n.y);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Knowledge Graph</h2>
          <p className="text-sm text-[var(--text-secondary)]">Visual map of your health data</p>
        </div>
        {!graphData && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={fetchGraph}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40
                       text-white text-sm font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Dna className="w-4 h-4" />}
            {loading ? "Loading..." : "Generate"}
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

      {!graphData && !loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-[var(--text-secondary)] text-sm"
        >
          Click "Generate" to visualize your health knowledge graph.
        </motion.div>
      )}

      {loading && !graphData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-[var(--text-secondary)]">Building graph...</p>
        </motion.div>
      )}

      <AnimatePresence>
        {graphData && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            {/* Legend */}
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                ["Patient","bg-blue-500"],["Report","bg-violet-500"],["Doctor","bg-cyan-500"],
                ["LabTest","bg-amber-500"],["Condition","bg-red-500"],["Hospital","bg-pink-500"],
                ["Finding","bg-orange-500"],["Medication","bg-emerald-500"],
              ].map(([t, c], i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"
                >
                  <div className={`w-2 h-2 rounded-full ${c}`} />
                  {t}
                </motion.div>
              ))}
            </div>

            <motion.canvas
              ref={canvasRef}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 22 }}
              className="w-full rounded-lg"
              style={{ background: "#111113", height: "500px" }}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4 mt-4 text-sm"
            >
              <div className="text-[var(--text-secondary)]">
                <span className="text-white font-semibold">{graphData.nodes.length}</span> nodes
              </div>
              <div className="text-[var(--text-secondary)]">
                <span className="text-white font-semibold">{graphData.edges.length}</span> relationships
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}