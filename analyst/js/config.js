// ===============================
// OAM ANALYST CONFIG (FINAL SYNC)
// ===============================

// ===============================
// GAP LABEL MAP (LOCKED)
// ===============================
export const GAP_LABEL_MAP = {
  strategic_clarity: "Strategic Clarity Gap",
  leadership_alignment: "Leadership Alignment Gap",
  execution_system: "Execution System Gap",
  collaboration: "Collaboration Gap",
  capability_fit: "Capability Fit Gap",
  culture_engagement: "Culture Engagement Gap"
};

// ===============================
// DRIVER LABEL MAP (LOCKED)
// ===============================
export const DRIVER_MAP = {
  D1: "Vision & Direction Clarity",
  D2: "Strategy & Priority to Team Alignment",
  D3: "Leadership Alignment & Consistency",
  D4: "Role & Responsibility Clarity",
  D5: "Decision Making Effectiveness",
  D6: "Management System Alignment & KPI Clarity",
  D7: "Performance & Accountability",
  D8: "Communication Flow",
  D9: "Cross-Team Collaboration",
  D10: "Capability & Skill Readiness",
  D11: "Ownership & Initiative",
  D12: "Feedback & Continuous Learning"
};

// ===============================
// FAILURE POINT LABEL MAP (LOCKED)
// ===============================
export const FP_MAP = {
  FP1: "Vision Clarity",
  FP2: "Strategy Clarity",
  FP3: "Priority Clarity",
  FP4: "Goal Clarity",
  FP5: "Strategy Translation",

  FP6: "Leadership Alignment",
  FP7: "Leadership Consistency",
  FP8: "Role Clarity",
  FP9: "Decision Authority",
  FP10: "Decision Effectiveness",
  FP11: "Leadership Accountability",

  FP12: "Strategy Cascade",
  FP13: "Goal Cascade",
  FP14: "KPI Ownership",
  FP15: "Performance Monitoring",
  FP16: "Cross-Team Alignment",
  FP17: "Communication Flow",

  FP18: "Cross-Team Collaboration",
  FP19: "Team Collaboration",
  FP20: "Decision Speed",
  FP21: "Team Accountability",
  FP22: "Problem Solving",

  FP23: "Skill Capability",
  FP24: "Initiative",
  FP25: "Ownership Mindset",
  FP26: "Feedback System",
  FP27: "Learning System"
};

// ===============================
// DRIVER → LAYER MAP (LOCKED)
// ===============================
export const DRIVER_LAYER_MAP = {
  D1: "Strategic Foundation",
  D2: "Management Cascade",
  D3: "Leadership System",
  D4: "Management Cascade",
  D5: "Management Cascade",
  D6: "Management Cascade",
  D7: "Team Execution",
  D8: "Team Execution",
  D9: "Team Execution",
  D10: "Individual Development",
  D11: "Individual Development",
  D12: "Individual Development"
};

// ===============================
// DRIVER STATUS RULES (LOCKED)
// ===============================
export const DRIVER_STATUS_RULES = {
  criticalMax: 1.9,
  weakMax: 2.7,
  stableMax: 3.4
};

// ===============================
// GAP INTERVENTIONS (UPDATED)
// ===============================
export const GAP_INTERVENTION = {
  strategic_clarity: [
    "Clarify vision, strategy, and priorities across all levels",
    "Align organizational goals with clear success metrics",
    "Ensure strategic communication is consistent and simple"
  ],

  leadership_alignment: [
    "Align leadership messaging and direction across functions",
    "Strengthen leadership accountability on decisions and outcomes",
    "Establish consistent leadership communication cadence"
  ],

  execution_system: [
    "Strengthen KPI clarity, ownership, and cascade structure",
    "Improve decision-making authority and governance",
    "Ensure performance monitoring and follow-up mechanisms are active"
  ],

  collaboration: [
    "Improve cross-team communication flow and alignment",
    "Reduce bottlenecks in coordination and handover processes",
    "Strengthen collaboration rituals and conflict resolution practices"
  ],

  capability_fit: [
    "Align skill requirements with role expectations",
    "Strengthen problem-solving capability in critical roles",
    "Ensure training addresses actual performance gaps"
  ],

  culture_engagement: [
    "Strengthen ownership and accountability mindset",
    "Encourage initiative and proactive problem-solving behavior",
    "Establish strong feedback and continuous learning culture"
  ]
};

// ===============================
// CAUSAL CHAINS (SYNCED TO diagnosis.js)
// NOTE: diagnosis.js reads chain.drivers
// ===============================
export const CAUSAL_CHAINS = [
  {
    id: "strategic_alignment_breakdown",
    drivers: ["D1", "D2", "D3"],
    title: "Strategic Alignment Breakdown",
    whatHappens:
      "The organization loses clarity of direction, teams interpret priorities differently, and execution starts to drift.",
    whyHappens:
      "Core direction is not clearly understood, strategy does not fully cascade into teams, and leadership messages are not consistently aligned."
  },
  {
    id: "execution_system_failure",
    drivers: ["D2", "D5", "D6", "D7"],
    title: "Execution System Failure",
    whatHappens:
      "Execution becomes inconsistent, accountability weakens, and performance issues are harder to correct quickly.",
    whyHappens:
      "Strategy is not translated cleanly into team execution, decision processes are not fully effective, KPI ownership is weak, and follow-up systems are not strong enough."
  },
  {
    id: "role_decision_confusion",
    drivers: ["D4", "D5", "D7"],
    title: "Role & Decision Confusion",
    whatHappens:
      "Work slows down, ownership becomes blurred, and people hesitate or pass issues around instead of resolving them.",
    whyHappens:
      "Role clarity is weak, decision authority is not fully understood, and accountability does not consistently hold execution together."
  },
  {
    id: "collaboration_friction",
    drivers: ["D8", "D9", "D5"],
    title: "Collaboration Friction",
    whatHappens:
      "Cross-team coordination slows down, misunderstandings increase, and decisions become less effective.",
    whyHappens:
      "Communication flow is not smooth, collaboration across teams is uneven, and decision processes are affected by friction between functions."
  },
  {
    id: "capability_constraint",
    drivers: ["D10", "D5"],
    title: "Capability Constraint",
    whatHappens:
      "Problems take longer to solve, decisions are less robust, and performance depends too heavily on a few capable individuals.",
    whyHappens:
      "The capability required for the role is not yet strong enough, especially in problem-solving and execution-critical skills."
  },
  {
    id: "culture_ownership_breakdown",
    drivers: ["D7", "D11", "D12"],
    title: "Culture & Ownership Breakdown",
    whatHappens:
      "Performance issues repeat, initiative drops, and learning does not consistently turn into improvement.",
    whyHappens:
      "Accountability is not reinforced strongly enough, ownership behavior is inconsistent, and feedback or learning loops are too weak to sustain change."
  },
  {
    id: "training_doesnt_work_risk",
    drivers: ["D6", "D7", "D10"],
    title: "Training Doesn’t Work Risk",
    whatHappens:
      "Capability development efforts may be launched, but performance does not significantly improve.",
    whyHappens:
      "The visible issue may appear as capability, while the deeper blockers actually sit in execution system weakness and accountability breakdown."
  }
];