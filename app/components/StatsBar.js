"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { FileText, TestTube2, Stethoscope, Pill } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

/* Animated counter that counts up from 0 to the target value */
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    if (target === 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(id); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(id);
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const card = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function StatsBar({ patientName, refreshKey }) {
  const [stats, setStats] = useState({ reports: 0, labs: 0, conditions: 0, medications: 0 });

  useEffect(() => {
    if (refreshKey === 0) return; // stay at zeros until a report is processed
    axios.get(`${API}/stats/${encodeURIComponent(patientName)}`)
      .then(r => setStats(r.data))
      .catch(() => {});
  }, [patientName, refreshKey]);

  const items = [
    { label: "Reports",     value: stats.reports,     icon: FileText,    color: "text-blue-400" },
    { label: "Lab Tests",   value: stats.labs,        icon: TestTube2,   color: "text-violet-400" },
    { label: "Conditions",  value: stats.conditions,  icon: Stethoscope, color: "text-amber-400" },
    { label: "Medications", value: stats.medications, icon: Pill,        color: "text-emerald-400" },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      variants={container}
      initial="hidden"
      animate="show"
      key={refreshKey}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            variants={card}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="bg-[var(--surface)] rounded-xl px-4 py-4 flex items-center gap-3 cursor-default"
          >
            <Icon className={`w-5 h-5 ${item.color} shrink-0`} />
            <div>
              <p className="text-xl font-semibold text-white leading-none">
                <AnimatedNumber value={item.value} />
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{item.label}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}