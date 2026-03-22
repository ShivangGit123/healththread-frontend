"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Beaker, FileText, MessageSquare, LogOut, ArrowRight, Dna } from "lucide-react";
import UploadSection from "./components/UploadSection";
import QuestionSection from "./components/QuestionSection";
import SummarySection from "./components/SummarySection";
import RiskSection from "./components/RiskSection";
import StatsBar from "./components/StatsBar";
import GraphSection from "./components/GraphSection";

/* Smooth spring-based page transitions */
const pageVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 40 : -40,
    scale: 0.98,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 26, mass: 0.8 },
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -40 : 40,
    scale: 0.98,
    transition: { duration: 0.2 },
  }),
};

const sidebarItem = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const sidebarContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const TAB_ORDER = ["summary", "ask", "risk", "graph"];

export default function Home() {
  const [patientName, setPatientName] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [isSetup, setIsSetup] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [direction, setDirection] = useState(0);

  const tabs = [
    { id: "summary", label: "Overview", icon: Activity },
    { id: "ask",     label: "Ask AI",   icon: MessageSquare },
    { id: "risk",    label: "Risks",    icon: Beaker },
    { id: "graph",   label: "Graph",    icon: Dna },
  ];

  const switchTab = (newTab) => {
    const oldIndex = TAB_ORDER.indexOf(activeTab);
    const newIndex = TAB_ORDER.indexOf(newTab);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-[var(--surface)]"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center"
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
            >
              <Dna className="text-white w-4 h-4" />
            </motion.div>
            <span className="text-lg font-semibold text-white tracking-tight">HealthThread</span>
          </div>
          <AnimatePresence>
            {isSetup && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-center gap-3"
              >
                <span className="text-sm text-[var(--text-secondary)]">{patientName}</span>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setIsSetup(false); setPatientName(""); }}
                  className="text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {!isSetup ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="max-w-sm mx-auto mt-28"
            >
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-semibold mb-1 text-white"
              >
                Welcome back
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[var(--text-secondary)] text-sm mb-6"
              >
                Enter your name to load your health records.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg
                             px-4 py-3 text-white placeholder-[var(--text-secondary)]
                             focus:outline-none focus:border-[var(--accent)] transition-colors text-sm"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && patientName.trim() && setIsSetup(true)}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => patientName.trim() && setIsSetup(true)}
                  disabled={!patientName.trim()}
                  className="w-full bg-[var(--accent)] hover:brightness-110
                             disabled:opacity-40 disabled:cursor-not-allowed
                             text-white text-sm font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <StatsBar patientName={patientName} refreshKey={refreshKey} />

              <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 mt-6">
                {/* Sidebar */}
                <motion.div
                  className="space-y-4"
                  variants={sidebarContainer}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div variants={sidebarItem}>
                    <UploadSection patientName={patientName} onUploadSuccess={() => setRefreshKey(k => k + 1)} />
                  </motion.div>

                  <motion.nav
                    variants={sidebarItem}
                    className="bg-[var(--surface)] rounded-xl p-2"
                  >
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const active = activeTab === tab.id;
                      return (
                        <motion.button
                          key={tab.id}
                          onClick={() => switchTab(tab.id)}
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                            active
                              ? "text-[var(--accent)]"
                              : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {active && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-[var(--accent)]/10 rounded-lg"
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <Icon className="w-4 h-4 relative z-10" />
                          <span className="relative z-10">{tab.label}</span>
                        </motion.button>
                      );
                    })}
                  </motion.nav>
                </motion.div>

                {/* Content */}
                <div className="min-h-[500px] overflow-hidden">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={activeTab}
                      custom={direction}
                      variants={pageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="bg-[var(--surface)] rounded-xl p-6"
                    >
                      {activeTab === "summary" && <SummarySection  patientName={patientName} />}
                      {activeTab === "ask"     && <QuestionSection patientName={patientName} />}
                      {activeTab === "risk"    && <RiskSection     patientName={patientName} />}
                      {activeTab === "graph"   && <GraphSection    patientName={patientName} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}