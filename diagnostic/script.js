// ===============================
// OAM INSIGHT WEBHOOK - VERSION 1 (LOCKED)
// Status: STABLE - DO NOT MODIFY
// Date: 2026-04-06
// ===============================

const EMAILJS_ENABLED = false;
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";

const WEBHOOK_ENABLED = true;
const APPS_SCRIPT_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycby1EYlCiC0qy-WvaNX9_rvRxsWmRP1umgUYHhmJdfYtAuqp7wOYqkI2qvsgq0WXguF_Zw/exec";

const APP_VERSION = "1.4.0";
const SURVEY_VERSION = "oam12-v1";

/*
  ============================================================
  PUBLIC FRAMEWORK (LOCKED)
  ============================================================
  Ini adalah 6 GAP resmi OAM yang keluar ke user / framework.
*/
const MAIN_GAPS = {
  strategic_clarity: "Strategic Clarity Gap",
  leadership_alignment: "Leadership Alignment Gap",
  execution_system: "Execution System Gap",
  collaboration: "Collaboration Gap",
  capability_fit: "Capability Fit Gap",
  culture_engagement: "Culture Engagement Gap",
};

/*
  ============================================================
  FAILURE POINT LABELS (LOCKED)
  ============================================================
*/
const FAILURE_POINT_LABELS = {
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
  FP27: "Learning System",
};

/*
  ============================================================
  INTERNAL SIGNAL CATEGORIES (ENGINE ONLY)
  ============================================================
  Ini helper categories untuk multi-hypothesis calculation.
  BUKAN framework publik.
*/
const SIGNAL_GAPS = {
  strategic_clarity: "Strategic Clarity Signal",
  leadership_alignment: "Leadership Alignment Signal",
  execution_system: "Execution System Signal",
  collaboration: "Collaboration Signal",
  capability_fit: "Capability Fit Signal",
  culture_engagement: "Culture Engagement Signal",
  management_system: "Management System Signal",
  communication: "Communication Signal",
  learning_feedback: "Learning & Feedback Signal",
};

/*
  Mapping signal internal -> main gap publik
*/
const SIGNAL_TO_MAIN_GAP = {
  strategic_clarity: "strategic_clarity",
  leadership_alignment: "leadership_alignment",
  execution_system: "execution_system",
  collaboration: "collaboration",
  capability_fit: "capability_fit",
  management_system: "execution_system",
  culture_engagement: "culture_engagement",
  communication: "collaboration",
  learning_feedback: "culture_engagement",
};

const LAYERS = {
  strategic_foundation: "Strategic Foundation",
  leadership_system: "Leadership System",
  management_cascade: "Management Cascade",
  team_execution: "Team Execution",
  individual_development: "Individual Development",
};

const DRIVER_METADATA = {
  D1: { layer: "strategic_foundation" },
  D2: { layer: "management_cascade" },
  D3: { layer: "leadership_system" },
  D4: { layer: "management_cascade" },
  D5: { layer: "management_cascade" },
  D6: { layer: "management_cascade" },
  D7: { layer: "team_execution" },
  D8: { layer: "team_execution" },
  D9: { layer: "team_execution" },
  D10: { layer: "individual_development" },
  D11: { layer: "individual_development" },
  D12: { layer: "individual_development" },
};

const GAP_SIGNAL_WEIGHTS = {
  primary: 1.0,
  secondary: 0.5,
};

/*
  ============================================================
  MULTI-HYPOTHESIS SIGNAL MAPPING PER FP
  ============================================================
  Berdasarkan SOP hypothesis directions.
  Menggunakan signal categories internal.
*/
const FP_HYPOTHESIS_SIGNALS = {
  FP1: [
    { id: "strategic_clarity", type: "primary" },
    { id: "execution_system", type: "secondary" },
  ],
  FP2: [
    { id: "strategic_clarity", type: "primary" },
    { id: "leadership_alignment", type: "secondary" },
  ],
  FP3: [
    { id: "strategic_clarity", type: "primary" },
    { id: "leadership_alignment", type: "secondary" },
    { id: "collaboration", type: "secondary" },
  ],
  FP4: [
    { id: "strategic_clarity", type: "primary" },
    { id: "execution_system", type: "secondary" },
    { id: "management_system", type: "secondary" },
  ],
  FP5: [
    { id: "execution_system", type: "primary" },
    { id: "management_system", type: "secondary" },
    { id: "capability_fit", type: "secondary" },
  ],
  FP6: [
    { id: "leadership_alignment", type: "primary" },
    { id: "strategic_clarity", type: "secondary" },
    { id: "capability_fit", type: "secondary" },
  ],
  FP7: [
    { id: "leadership_alignment", type: "primary" },
    { id: "strategic_clarity", type: "secondary" },
    { id: "culture_engagement", type: "secondary" },
  ],
  FP8: [
    { id: "management_system", type: "primary" },
    { id: "leadership_alignment", type: "secondary" },
    { id: "capability_fit", type: "secondary" },
  ],
  FP9: [
    { id: "management_system", type: "primary" },
    { id: "leadership_alignment", type: "secondary" },
    { id: "capability_fit", type: "secondary" },
  ],
  FP10: [
    { id: "management_system", type: "primary" },
    { id: "capability_fit", type: "secondary" },
    { id: "communication", type: "secondary" },
  ],
  FP11: [
    { id: "leadership_alignment", type: "primary" },
    { id: "culture_engagement", type: "secondary" },
    { id: "management_system", type: "secondary" },
  ],
  FP12: [
    { id: "execution_system", type: "primary" },
    { id: "leadership_alignment", type: "secondary" },
  ],
  FP13: [
    { id: "execution_system", type: "primary" },
    { id: "management_system", type: "secondary" },
    { id: "strategic_clarity", type: "secondary" },
  ],
  FP14: [
    { id: "management_system", type: "primary" },
    { id: "culture_engagement", type: "secondary" },
    { id: "leadership_alignment", type: "secondary" },
  ],
  FP15: [
    { id: "management_system", type: "primary" },
    { id: "culture_engagement", type: "secondary" },
    { id: "leadership_alignment", type: "secondary" },
  ],
  FP16: [
    { id: "collaboration", type: "primary" },
    { id: "leadership_alignment", type: "secondary" },
    { id: "execution_system", type: "secondary" },
  ],
  FP17: [
    { id: "collaboration", type: "primary" },
    { id: "management_system", type: "secondary" },
    { id: "capability_fit", type: "secondary" },
  ],
  FP18: [
    { id: "collaboration", type: "primary" },
    { id: "management_system", type: "secondary" },
    { id: "culture_engagement", type: "secondary" },
  ],
  FP19: [
    { id: "collaboration", type: "primary" },
    { id: "culture_engagement", type: "secondary" },
    { id: "leadership_alignment", type: "secondary" },
  ],
  FP20: [
    { id: "collaboration", type: "primary" },
    { id: "management_system", type: "secondary" },
    { id: "leadership_alignment", type: "secondary" },
  ],
  FP21: [
    { id: "culture_engagement", type: "primary" },
    { id: "leadership_alignment", type: "secondary" },
    { id: "management_system", type: "secondary" },
  ],
  FP22: [
    { id: "capability_fit", type: "primary" },
    { id: "management_system", type: "secondary" },
    { id: "strategic_clarity", type: "secondary" },
  ],
  FP23: [
    { id: "capability_fit", type: "primary" },
    { id: "learning_feedback", type: "secondary" },
    { id: "management_system", type: "secondary" },
  ],
  FP24: [
    { id: "culture_engagement", type: "primary" },
    { id: "leadership_alignment", type: "secondary" },
    { id: "management_system", type: "secondary" },
  ],
  FP25: [
    { id: "culture_engagement", type: "primary" },
    { id: "leadership_alignment", type: "secondary" },
    { id: "capability_fit", type: "secondary" },
  ],
  FP26: [
    { id: "learning_feedback", type: "primary" },
    { id: "culture_engagement", type: "secondary" },
    { id: "leadership_alignment", type: "secondary" },
  ],
  FP27: [
    { id: "learning_feedback", type: "primary" },
    { id: "culture_engagement", type: "secondary" },
    { id: "management_system", type: "secondary" },
  ],
};

const DRIVER_DEFS = [
  {
    id: "D1",
    name: "Vision & Direction Clarity",
    fps: ["FP1", "FP2", "FP3", "FP4", "FP5"],
    qs: [
      [
        "D1_Q1",
        "Saya dapat menjelaskan arah utama organisasi saat ini dengan bahasa yang sederhana dan tidak perlu menebak-nebak sendiri.",
        { FP1: 0.7, FP2: 0.3 },
      ],
      [
        "D1_Q2",
        "Strategi organisasi yang sedang dijalankan cukup jelas bagi saya untuk dipahami sebagai perubahan tindakan, bukan hanya slogan atau istilah umum.",
        { FP2: 0.7, FP5: 0.3 },
      ],
      [
        "D1_Q3",
        "Ketika ada banyak tuntutan pekerjaan, saya tahu mana yang harus diprioritaskan lebih dulu karena urutan prioritas organisasi cukup jelas.",
        { FP2: 0.2, FP3: 0.7, FP5: 0.1 },
      ],
      [
        "D1_Q4",
        "Target atau fokus kerja yang diberikan kepada saya/tim terhubung jelas dengan tujuan organisasi yang lebih besar.",
        { FP4: 0.7, FP5: 0.3 },
      ],
      [
        "D1_Q5",
        "Arah dan strategi organisasi sudah diterjemahkan ke pekerjaan sehari-hari, sehingga saya tahu apa yang perlu dilakukan secara spesifik dalam peran saya.",
        { FP2: 0.2, FP5: 0.8 },
      ],
      [
        "D1_Q6",
        "Perubahan arah, prioritas, atau target kerja biasanya dijelaskan dengan cukup jelas sehingga tidak menimbulkan interpretasi yang berbeda-beda.",
        { FP1: 0.2, FP2: 0.3, FP3: 0.2, FP4: 0.3 },
      ],
    ],
    oe: [
      "D1_OE",
      "Jika Anda memiliki pengalaman, contoh kejadian, atau masukan terkait kejelasan arah, strategi, prioritas, atau target organisasi, jelaskan secara singkat.",
    ],
  },
  {
    id: "D2",
    name: "Strategy & Priority to Team Alignment",
    fps: ["FP12"],
    qs: [
      [
        "D2_Q1",
        "Saya memahami dengan jelas bagaimana strategi organisasi diterjemahkan ke arah kerja tim saya.",
        { FP12: 0.3 },
      ],
      [
        "D2_Q2",
        "Saya mengetahui perubahan nyata apa yang seharusnya terjadi di tim saya sebagai dampak dari strategi organisasi.",
        { FP12: 0.3 },
      ],
      [
        "D2_Q3",
        "Pemahaman mengenai arah dan prioritas organisasi di tim saya tidak berbeda jauh dengan tim atau unit lain.",
        { FP12: 0.2 },
      ],
      [
        "D2_Q4",
        "Strategi organisasi benar-benar mempengaruhi cara kerja sehari-hari tim saya, bukan hanya berhenti di level manajemen.",
        { FP12: 0.2 },
      ],
    ],
    oe: [
      "D2_OE",
      "Jika Anda memiliki pengalaman, contoh kejadian, atau masukan terkait bagaimana strategi diterjemahkan ke level tim, jelaskan secara singkat.",
    ],
  },
  {
    id: "D3",
    name: "Leadership Alignment & Consistency",
    fps: ["FP6", "FP7"],
    qs: [
      [
        "D3_Q1",
        "Para pimpinan di organisasi ini menyampaikan arah dan prioritas yang sejalan satu sama lain.",
        { FP6: 0.7, FP7: 0.3 },
      ],
      [
        "D3_Q2",
        "Saya jarang menerima arahan yang saling bertentangan dari pimpinan yang berbeda.",
        { FP6: 0.8, FP7: 0.2 },
      ],
      [
        "D3_Q3",
        "Pesan dan keputusan yang disampaikan pimpinan relatif konsisten dari waktu ke waktu.",
        { FP6: 0.2, FP7: 0.8 },
      ],
      [
        "D3_Q4",
        "Ketika terjadi perubahan arah atau keputusan, pimpinan menjelaskan perubahan tersebut dengan cukup jelas kepada tim.",
        { FP6: 0.3, FP7: 0.7 },
      ],
    ],
    oe: [
      "D3_OE",
      "Jika Anda memiliki pengalaman, contoh kejadian, atau masukan terkait keselarasan atau konsistensi kepemimpinan, jelaskan secara singkat.",
    ],
  },
  {
    id: "D4",
    name: "Role & Responsibility Clarity",
    fps: ["FP8"],
    qs: [
      [
        "D4_Q1",
        "Saya memahami dengan jelas peran dan tanggung jawab saya dalam pekerjaan sehari-hari.",
        { FP8: 0.25 },
      ],
      [
        "D4_Q2",
        "Dalam tim saya, jarang terjadi kebingungan mengenai siapa yang bertanggung jawab atas suatu pekerjaan.",
        { FP8: 0.3 },
      ],
      [
        "D4_Q3",
        "Pembagian tugas di tim saya jelas dan tidak sering terjadi overlap atau kekosongan tanggung jawab.",
        { FP8: 0.25 },
      ],
      [
        "D4_Q4",
        "Ketika terjadi pekerjaan lintas fungsi atau masalah, tetap jelas siapa yang harus mengambil tanggung jawab.",
        { FP8: 0.2 },
      ],
    ],
    oe: [
      "D4_OE",
      "Jika Anda memiliki pengalaman, contoh kejadian, atau masukan terkait kejelasan peran dan tanggung jawab, jelaskan secara singkat.",
    ],
  },
  {
    id: "D5",
    name: "Decision Making Effectiveness",
    fps: ["FP9", "FP10", "FP20"],
    qs: [
      [
        "D5_Q1",
        "Saya memahami dengan jelas siapa yang memiliki kewenangan untuk mengambil keputusan dalam situasi kerja saya.",
        { FP9: 0.8, FP10: 0.2 },
      ],
      [
        "D5_Q2",
        "Keputusan biasanya diambil di level yang tepat tanpa harus selalu naik ke level yang lebih tinggi.",
        { FP9: 0.7, FP20: 0.3 },
      ],
      [
        "D5_Q3",
        "Keputusan yang diambil umumnya jelas dan dapat dipahami oleh pihak yang terlibat.",
        { FP10: 0.8, FP20: 0.2 },
      ],
      [
        "D5_Q4",
        "Keputusan jarang perlu diulang atau direvisi karena kesalahan atau ketidakjelasan.",
        { FP10: 0.8, FP20: 0.2 },
      ],
      [
        "D5_Q5",
        "Keputusan dapat diambil dengan cukup cepat tanpa proses yang berlarut-larut.",
        { FP10: 0.2, FP20: 0.8 },
      ],
      [
        "D5_Q6",
        "Proses pengambilan keputusan tidak terlalu banyak melibatkan pihak yang tidak diperlukan.",
        { FP9: 0.3, FP20: 0.7 },
      ],
    ],
    oe: [
      "D5_OE",
      "Jika Anda memiliki pengalaman, contoh kejadian, atau masukan terkait proses pengambilan keputusan, jelaskan secara singkat.",
    ],
  },
  {
    id: "D6",
    name: "Management System Alignment & KPI Clarity",
    fps: ["FP13", "FP15", "FP14"],
    qs: [
      [
        "D6_Q1",
        "KPI atau target yang saya terima memiliki hubungan yang jelas dengan tujuan organisasi.",
        { FP13: 0.7, FP14: 0.3 },
      ],
      [
        "D6_Q2",
        "Target di tim saya selaras dengan target di level organisasi dan tidak saling bertabrakan.",
        { FP13: 0.8, FP14: 0.2 },
      ],
      [
        "D6_Q3",
        "Kinerja tim dimonitor secara rutin menggunakan indikator yang jelas.",
        { FP15: 0.8, FP14: 0.2 },
      ],
      [
        "D6_Q4",
        "Ketika performa tidak sesuai target, ada tindak lanjut yang jelas berdasarkan data atau hasil monitoring.",
        { FP15: 0.8, FP14: 0.2 },
      ],
      [
        "D6_Q5",
        "Setiap KPI memiliki pemilik (owner) yang jelas dan diketahui oleh semua pihak terkait.",
        { FP14: 1 },
      ],
      [
        "D6_Q6",
        "Sistem yang ada memastikan adanya akuntabilitas terhadap pencapaian KPI, bukan hanya bergantung pada individu.",
        { FP13: 0.2, FP15: 0.3, FP14: 0.5 },
      ],
    ],
    oe: [
      "D6_OE",
      "Jika Anda memiliki pengalaman, contoh kejadian, atau masukan terkait KPI, monitoring, atau sistem akuntabilitas kinerja, jelaskan secara singkat.",
    ],
  },
  {
    id: "D7",
    name: "Performance & Accountability",
    fps: ["FP21", "FP11"],
    qs: [
      [
        "D7_Q1",
        "Ketika target atau KPI tidak tercapai, biasanya ada tindak lanjut yang jelas untuk memperbaiki situasi.",
        { FP21: 0.7, FP11: 0.3 },
      ],
      [
        "D7_Q2",
        "Masalah atau kegagalan dalam pekerjaan tidak dibiarkan berulang tanpa perbaikan yang nyata.",
        { FP21: 0.8, FP11: 0.2 },
      ],
      [
        "D7_Q3",
        "Pimpinan secara aktif melakukan follow-up terhadap kinerja tim, bukan hanya menetapkan target.",
        { FP21: 0.3, FP11: 0.7 },
      ],
      [
        "D7_Q4",
        "Pimpinan menunjukkan tanggung jawab yang jelas terhadap hasil tim atau organisasi.",
        { FP21: 0.2, FP11: 0.8 },
      ],
      [
        "D7_Q5",
        "Terdapat konsekuensi atau tindakan yang jelas ketika performa tidak sesuai dengan target.",
        { FP21: 0.7, FP11: 0.3 },
      ],
    ],
    oe: [
      "D7_OE",
      "Jika Anda memiliki pengalaman, contoh kejadian, atau masukan terkait tindak lanjut saat target tidak tercapai, jelaskan secara singkat.",
    ],
  },
  {
    id: "D8",
    name: "Communication Flow",
    fps: ["FP17"],
    qs: [
      [
        "D8_Q1",
        "Informasi penting yang saya butuhkan untuk bekerja biasanya tersedia tepat waktu.",
        { FP17: 0.3 },
      ],
      [
        "D8_Q2",
        "Informasi yang disampaikan dalam organisasi jarang berubah atau terdistorsi saat diteruskan.",
        { FP17: 0.25 },
      ],
      [
        "D8_Q3",
        "Saya memahami dengan jelas pesan atau informasi yang disampaikan oleh pihak lain.",
        { FP17: 0.2 },
      ],
      [
        "D8_Q4",
        "Miskomunikasi jarang menyebabkan pekerjaan harus diulang atau diperbaiki.",
        { FP17: 0.25 },
      ],
    ],
    oe: [
      "D8_OE",
      "Jika Anda memiliki pengalaman, contoh kejadian, atau masukan terkait alur komunikasi atau penyampaian informasi, jelaskan secara singkat.",
    ],
  },
  {
    id: "D9",
    name: "Cross-Team Collaboration",
    fps: ["FP16", "FP18", "FP19"],
    qs: [
      [
        "D9_Q1",
        "Prioritas antar tim atau divisi di organisasi ini umumnya selaras dan tidak sering bertabrakan.",
        { FP16: 0.8, FP18: 0.2 },
      ],
      [
        "D9_Q2",
        "Bekerja sama dengan tim atau divisi lain dapat dilakukan dengan cukup lancar tanpa hambatan berarti.",
        { FP18: 0.8, FP19: 0.2 },
      ],
      [
        "D9_Q3",
        "Ketergantungan antar tim (handover, approval, dll) dikelola dengan cukup baik dan tidak sering menjadi bottleneck.",
        { FP16: 0.2, FP18: 0.8 },
      ],
      [
        "D9_Q4",
        "Ketika terjadi konflik antar tim, masalah tersebut biasanya diselesaikan secara konstruktif.",
        { FP18: 0.2, FP19: 0.8 },
      ],
      [
        "D9_Q5",
        "Konflik antar tim tidak dibiarkan berlarut-larut atau berulang tanpa penyelesaian yang jelas.",
        { FP16: 0.2, FP19: 0.8 },
      ],
    ],
    oe: [
      "D9_OE",
      "Jika Anda memiliki pengalaman, contoh kejadian, atau masukan terkait kerja sama lintas tim atau divisi, jelaskan secara singkat.",
    ],
  },
  {
    id: "D10",
    name: "Capability & Skill Readiness",
    fps: ["FP22", "FP23"],
    qs: [
      [
        "D10_Q1",
        "Tim saya memiliki kemampuan yang cukup untuk menjalankan pekerjaan tanpa kesulitan berarti.",
        { FP22: 0.8, FP23: 0.2 },
      ],
      [
        "D10_Q2",
        "Pekerjaan jarang tertunda atau bermasalah karena keterbatasan skill dalam tim.",
        { FP22: 0.8, FP23: 0.2 },
      ],
      [
        "D10_Q3",
        "Program pelatihan atau pengembangan yang ada membantu meningkatkan performa kerja secara nyata.",
        { FP22: 0.2, FP23: 0.8 },
      ],
      [
        "D10_Q4",
        "Setelah mengikuti training, terdapat perubahan yang terlihat dalam cara kerja atau hasil kerja tim.",
        { FP22: 0.2, FP23: 0.8 },
      ],
      [
        "D10_Q5",
        "Kebutuhan skill yang diperlukan untuk pekerjaan saat ini dapat diidentifikasi dengan cukup jelas.",
        { FP22: 0.7, FP23: 0.3 },
      ],
    ],
    oe: [
      "D10_OE",
      "Jika Anda memiliki pengalaman, contoh kejadian, atau masukan terkait kebutuhan skill, keterbatasan kemampuan, atau dampak pelatihan, jelaskan secara singkat.",
    ],
  },
  {
    id: "D11",
    name: "Ownership & Initiative",
    fps: ["FP24", "FP25"],
    qs: [
      [
        "D11_Q1",
        "Anggota tim biasanya menyelesaikan masalah tanpa harus selalu menunggu arahan dari atasan.",
        { FP24: 0.6, FP25: 0.4 },
      ],
      [
        "D11_Q2",
        "Ketika terjadi masalah, individu yang terlibat cenderung mengambil tanggung jawab sampai selesai.",
        { FP24: 0.8, FP25: 0.2 },
      ],
      [
        "D11_Q3",
        "Jarang terjadi saling melempar tanggung jawab dalam pekerjaan sehari-hari.",
        { FP24: 0.8, FP25: 0.2 },
      ],
      [
        "D11_Q4",
        "Tim secara aktif mengusulkan ide atau perbaikan tanpa harus diminta.",
        { FP24: 0.2, FP25: 0.8 },
      ],
      [
        "D11_Q5",
        "Individu dalam tim tidak hanya menjalankan tugas, tetapi juga berusaha meningkatkan cara kerja.",
        { FP24: 0.3, FP25: 0.7 },
      ],
    ],
    oe: [
      "D11_OE",
      "Jika Anda memiliki pengalaman, contoh kejadian, atau masukan terkait ownership atau inisiatif dalam tim, jelaskan secara singkat.",
    ],
  },
  {
    id: "D12",
    name: "Feedback & Continuous Learning",
    fps: ["FP26", "FP27"],
    qs: [
      [
        "D12_Q1",
        "Feedback diberikan secara rutin dan cukup spesifik untuk membantu perbaikan kerja.",
        { FP26: 0.8, FP27: 0.2 },
      ],
      [
        "D12_Q2",
        "Feedback yang diberikan biasanya benar-benar digunakan untuk memperbaiki cara kerja.",
        { FP26: 0.7, FP27: 0.3 },
      ],
      [
        "D12_Q3",
        "Setelah terjadi kesalahan atau masalah, dilakukan evaluasi yang jelas.",
        { FP26: 0.3, FP27: 0.7 },
      ],
      [
        "D12_Q4",
        "Perbaikan dilakukan secara nyata setelah evaluasi, bukan hanya dibahas saja.",
        { FP26: 0.2, FP27: 0.8 },
      ],
      [
        "D12_Q5",
        "Masalah yang sama tidak sering terulang karena sudah ada perbaikan sebelumnya.",
        { FP26: 0.2, FP27: 0.8 },
      ],
    ],
    oe: [
      "D12_OE",
      "Jika Anda memiliki pengalaman, contoh kejadian, atau masukan terkait feedback, evaluasi, atau pembelajaran dari perbaikan, jelaskan secara singkat.",
    ],
  },
];

const INTRO = document.getElementById("introSection");
const SURVEY = document.getElementById("surveySection");
const THANKS = document.getElementById("thanksSection");
const PAGES_ROOT = document.getElementById("pagesRoot");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtnBottom = document.getElementById("prevBtnBottom");
const nextBtnBottom = document.getElementById("nextBtnBottom");

const submitNote = document.getElementById("submitNote");

let pages = [];
let pageIndex = 0;

function initEmailJS() {
  if (!EMAILJS_ENABLED) return;
  try {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  } catch (e) {
    console.warn("EmailJS belum aktif atau public key belum diisi.", e);
  }
}

function makeSubmissionId() {
  return `subm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getSurveyBatchId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("batch") || "batch_manual_temp";
}

function likertChoices(name) {
  const choices = [
    ["1", "Sangat Tidak Setuju"],
    ["2", "Tidak Setuju"],
    ["3", "Setuju"],
    ["4", "Sangat Setuju"],
    ["0", "Tidak Tahu / Tidak Relevan"],
  ];

  return `
    <div class="choices likert5">
      ${choices
        .map(
          (c) => `
        <label class="choice-item">
          <input type="radio" name="${name}" value="${c[0]}">
          <span>${c[1]}</span>
        </label>
      `
        )
        .join("")}
    </div>
  `;
}

function renderPages() {
  const html = [];

  html.push(`
    <div class="question-page" data-page="meta">
      <div class="page-title">Informasi Awal</div>
      <div class="field-grid">
        <div class="field full">
          <label for="organizationName">Nama Organisasi / Perusahaan <strong>*</strong></label>
          <input id="organizationName" type="text" placeholder="Masukkan nama organisasi/perusahaan">
          <div id="orgError" class="error-note" style="display:none">Nama organisasi wajib diisi.</div>
        </div>

        <div class="field full">
          <label for="divisionName">Divisi (Opsional)</label>
          <input id="divisionName" type="text" placeholder="Contoh: Sales, HR, Operations">
          <div class="helper">Survey anonim. Tidak perlu nama peserta, email, atau data personal.</div>
        </div>
      </div>
    </div>
  `);

  DRIVER_DEFS.forEach((d, i) => {
    html.push(`
      <div class="question-page" style="display:none">
        <div class="page-title">Driver ${i + 1} — ${d.name}</div>

        ${d.qs
          .map(
            (q) => `
          <div class="question-card" data-qid="${q[0]}">
            <div class="q-title">${q[1]}</div>
            ${likertChoices(q[0])}
          </div>
        `
          )
          .join("")}

        <div class="question-card">
          <div class="q-title">Pertanyaan Terbuka (Opsional)</div>
          <div class="field full">
            <label for="${d.oe[0]}">${d.oe[1]}</label>
            <textarea id="${d.oe[0]}" rows="5" placeholder="Tuliskan contoh situasi atau masukan jika ada."></textarea>
          </div>
        </div>
      </div>
    `);
  });

  PAGES_ROOT.innerHTML = html.join("");
  pages = [...document.querySelectorAll(".question-page")];

  document.getElementById("organizationName").addEventListener("input", () => {
    document.getElementById("orgError").style.display = "none";
    updateProgress();
  });

  document.querySelectorAll(".choice-item input[type='radio']").forEach((input) => {
    input.addEventListener("change", () => {
      const group = input.closest(".choices");
      if (group) {
        group.querySelectorAll(".choice-item").forEach((i) => i.classList.remove("selected"));
      }
      input.closest(".choice-item").classList.add("selected");
      updateProgress();
    });
  });

  document.querySelectorAll("textarea").forEach((t) => {
    t.addEventListener("input", () => {
      updateProgress();
    });
  });

  showPage(0);
  updateProgress();
}

function showPage(i) {
  pageIndex = i;

  pages.forEach((p, idx) => {
    p.style.display = idx === i ? "block" : "none";
  });

  [prevBtn, prevBtnBottom].forEach((b) => {
    b.style.display = "none";
  });

  const last = i === pages.length - 1;
  [nextBtn, nextBtnBottom].forEach((b) => {
    b.textContent = last ? "Submit" : "Next";
  });

  window.scrollTo(0, 0);
}

function validateCurrentPage() {
  if (pageIndex === 0) {
    const orgInput = document.getElementById("organizationName");
    const org = (orgInput?.value || "").trim();
    const orgError = document.getElementById("orgError");

    if (orgError) orgError.style.display = org ? "none" : "block";

    return org
      ? { ok: true }
      : { ok: false, msg: "Nama organisasi / perusahaan wajib diisi." };
  }

  const page = pages[pageIndex];
  if (!page) return { ok: false, msg: "Halaman tidak ditemukan." };

  let ok = true;

  const cards = [...page.querySelectorAll(".question-card[data-qid]")];

  cards.forEach((card) => {
    const qid = card.getAttribute("data-qid");
    const selected = page.querySelector(`input[name="${qid}"]:checked`);

    let note = card.querySelector(".likert-error");
    if (!note) {
      note = document.createElement("div");
      note.className = "error-note likert-error";
      note.textContent = "Pertanyaan ini wajib dijawab.";
      note.style.display = "none";
      card.appendChild(note);
    }

    if (!selected) {
      ok = false;
      note.style.display = "block";
    } else {
      note.style.display = "none";
    }
  });

  return ok
    ? { ok: true }
    : { ok: false, msg: "Masih ada pertanyaan wajib yang belum dijawab di halaman ini." };
}

function answeredCount() {
  const total = 1 + DRIVER_DEFS.reduce((a, d) => a + d.qs.length, 0);

  let answered = document.getElementById("organizationName")?.value.trim() ? 1 : 0;

  DRIVER_DEFS.forEach((d) => {
    d.qs.forEach((q) => {
      if (document.querySelector(`input[name="${q[0]}"]:checked`)) answered++;
    });
  });

  return { answered, total };
}

function updateProgress() {
  const x = answeredCount();
  const pct = Math.round((x.answered / x.total) * 100);
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `${pct}%`;
}

function fpScoreFromResponses(driver, responseMap) {
  const fpTotals = {};
  const fpWeights = {};

  driver.qs.forEach((q) => {
    const raw = responseMap[q[0]];
    if (raw === undefined || raw === null || raw === "" || Number(raw) === 0) return;

    Object.entries(q[2]).forEach(([fp, wt]) => {
      fpTotals[fp] = (fpTotals[fp] || 0) + Number(raw) * wt;
      fpWeights[fp] = (fpWeights[fp] || 0) + wt;
    });
  });

  const scores = {};
  driver.fps.forEach((fp) => {
    scores[fp] = fpWeights[fp]
      ? Number((fpTotals[fp] / fpWeights[fp]).toFixed(2))
      : null;
  });

  return scores;
}

function driverStatus(score) {
  if (score === null) return "No Data";
  if (score < 2) return "Critical";
  if (score <= 2.7) return "Weak";
  if (score <= 3.4) return "Stable";
  return "Strong";
}

function maturityLevel(avgScore) {
  if (avgScore === null) return "No Data";
  if (avgScore < 2) return "Fragile";
  if (avgScore <= 2.7) return "Developing";
  if (avgScore <= 3.4) return "Stable";
  return "Performing";
}

function avg(nums) {
  const valid = nums.filter((v) => typeof v === "number");
  return valid.length
    ? Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
    : null;
}

function getSignalHypothesesForFP(fpId) {
  const items = FP_HYPOTHESIS_SIGNALS[fpId] || [];

  return items.map((item) => ({
    signalId: item.id,
    signal: SIGNAL_GAPS[item.id] || item.id,
    mainGapId: SIGNAL_TO_MAIN_GAP[item.id] || null,
    mainGap: MAIN_GAPS[SIGNAL_TO_MAIN_GAP[item.id]] || null,
    type: item.type,
    signalWeight: GAP_SIGNAL_WEIGHTS[item.type] ?? 0,
  }));
}

function buildInternalSignalScores(driverScores) {
  const totals = {};
  const weights = {};
  const contributingFPs = {};

  Object.keys(SIGNAL_GAPS).forEach((signalId) => {
    totals[signalId] = 0;
    weights[signalId] = 0;
    contributingFPs[signalId] = [];
  });

  driverScores.forEach((driver) => {
    driver.failurePoints.forEach((fp) => {
      if (typeof fp.score !== "number") return;

      fp.possibleSignals.forEach((signalInfo) => {
        const w = signalInfo.signalWeight ?? 0;
        if (w <= 0) return;

        totals[signalInfo.signalId] += fp.score * w;
        weights[signalInfo.signalId] += w;

        contributingFPs[signalInfo.signalId].push({
          fpId: fp.id,
          fpName: fp.name,
          driverId: driver.id,
          driverName: driver.name,
          score: fp.score,
          type: signalInfo.type,
          signalWeight: w,
        });
      });
    });
  });

  return Object.keys(SIGNAL_GAPS).map((signalId) => {
    const score = weights[signalId]
      ? Number((totals[signalId] / weights[signalId]).toFixed(2))
      : null;

    return {
      id: signalId,
      name: SIGNAL_GAPS[signalId],
      mappedMainGapId: SIGNAL_TO_MAIN_GAP[signalId] || null,
      mappedMainGap: MAIN_GAPS[SIGNAL_TO_MAIN_GAP[signalId]] || null,
      score,
      status: driverStatus(score),
      totalSignalWeight: Number(weights[signalId].toFixed(2)),
      contributingFPCount: contributingFPs[signalId].length,
      contributingFPs: contributingFPs[signalId],
    };
  });
}

function buildPublicMainGapScores(driverScores) {
  const totals = {};
  const weights = {};
  const contributingFPs = {};

  Object.keys(MAIN_GAPS).forEach((gapId) => {
    totals[gapId] = 0;
    weights[gapId] = 0;
    contributingFPs[gapId] = [];
  });

  driverScores.forEach((driver) => {
    driver.failurePoints.forEach((fp) => {
      if (typeof fp.score !== "number") return;

      const bestWeightPerMainGap = {};
      const sourceSignalsPerMainGap = {};

      fp.possibleSignals.forEach((signalInfo) => {
        if (!signalInfo.mainGapId) return;

        const mainGapId = signalInfo.mainGapId;
        const w = signalInfo.signalWeight ?? 0;

        if (
          bestWeightPerMainGap[mainGapId] === undefined ||
          w > bestWeightPerMainGap[mainGapId]
        ) {
          bestWeightPerMainGap[mainGapId] = w;
        }

        if (!sourceSignalsPerMainGap[mainGapId]) {
          sourceSignalsPerMainGap[mainGapId] = [];
        }

        sourceSignalsPerMainGap[mainGapId].push({
          signalId: signalInfo.signalId,
          signal: signalInfo.signal,
          type: signalInfo.type,
          signalWeight: w,
        });
      });

      Object.keys(bestWeightPerMainGap).forEach((mainGapId) => {
        const w = bestWeightPerMainGap[mainGapId];
        totals[mainGapId] += fp.score * w;
        weights[mainGapId] += w;

        contributingFPs[mainGapId].push({
          fpId: fp.id,
          fpName: fp.name,
          driverId: driver.id,
          driverName: driver.name,
          score: fp.score,
          appliedWeight: w,
          sourceSignals: sourceSignalsPerMainGap[mainGapId],
        });
      });
    });
  });

  return Object.keys(MAIN_GAPS).map((gapId) => {
    const score = weights[gapId]
      ? Number((totals[gapId] / weights[gapId]).toFixed(2))
      : null;

    return {
      id: gapId,
      name: MAIN_GAPS[gapId],
      score,
      status: driverStatus(score),
      totalAppliedWeight: Number(weights[gapId].toFixed(2)),
      contributingFPCount: contributingFPs[gapId].length,
      contributingFPs: contributingFPs[gapId],
    };
  });
}

function collectPayload() {
  const responseMap = {};
  const openEnded = {};

  DRIVER_DEFS.forEach((d) => {
    d.qs.forEach((q) => {
      responseMap[q[0]] =
        document.querySelector(`input[name="${q[0]}"]:checked`)?.value ?? null;
    });

    openEnded[d.oe[0]] = document.getElementById(d.oe[0])?.value.trim() || "";
  });

  const driverObjects = DRIVER_DEFS.map((d) => {
    const fpScores = fpScoreFromResponses(d, responseMap);
    const avgScore = avg(Object.values(fpScores));

    return {
      id: d.id,
      name: d.name,
      layerId: DRIVER_METADATA[d.id].layer,
      layer: LAYERS[DRIVER_METADATA[d.id].layer],
      score: avgScore,
      status: driverStatus(avgScore),
      failurePoints: d.fps.map((fp) => {
        const signals = getSignalHypothesesForFP(fp);

        const primarySignal = signals.find((g) => g.type === "primary") || null;
        const secondarySignals = signals.filter((g) => g.type === "secondary");

        const publicMainGapMap = {};
        signals.forEach((s) => {
          if (!s.mainGapId) return;
          if (
            !publicMainGapMap[s.mainGapId] ||
            s.signalWeight > publicMainGapMap[s.mainGapId].signalWeight
          ) {
            publicMainGapMap[s.mainGapId] = {
              mainGapId: s.mainGapId,
              mainGap: s.mainGap,
              signalWeight: s.signalWeight,
              sourceType: s.type,
            };
          }
        });

        const publicMainGaps = Object.values(publicMainGapMap);
        const primaryPublicGap =
          publicMainGaps.sort((a, b) => b.signalWeight - a.signalWeight)[0] || null;
        const secondaryPublicGaps = publicMainGaps.filter(
          (g) => g.mainGapId !== primaryPublicGap?.mainGapId
        );

        return {
          id: fp,
          name: FAILURE_POINT_LABELS[fp] || fp,
          score: fpScores[fp],
          status: driverStatus(fpScores[fp]),

          primarySignalId: primarySignal?.signalId ?? null,
          primarySignal: primarySignal?.signal ?? null,

          secondarySignalIds: secondarySignals.map((g) => g.signalId),
          secondarySignals: secondarySignals.map((g) => g.signal),

          primaryGapId: primaryPublicGap?.mainGapId ?? null,
          primaryGap: primaryPublicGap?.mainGap ?? null,

          secondaryGapIds: secondaryPublicGaps.map((g) => g.mainGapId),
          secondaryGaps: secondaryPublicGaps.map((g) => g.mainGap),

          possibleSignals: signals,
          possibleGaps: publicMainGaps,
        };
      }),
      openEnded: openEnded[d.oe[0]],
    };
  });

  const overallAverage = avg(driverObjects.map((d) => d.score));

  const layerScores = Object.keys(LAYERS).map((layerId) => {
    const layerAvg = avg(
      driverObjects
        .filter((d) => d.layerId === layerId)
        .map((d) => d.score)
    );

    return {
      id: layerId,
      name: LAYERS[layerId],
      score: layerAvg,
      status: driverStatus(layerAvg),
    };
  });

  const internalSignalGapScores = buildInternalSignalScores(driverObjects);
  const gapScores = buildPublicMainGapScores(driverObjects);

  const weakestDrivers = [...driverObjects]
    .filter((d) => typeof d.score === "number")
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const weakestFailurePoints = [
    ...driverObjects.flatMap((d) =>
      d.failurePoints.map((fp) => ({
        ...fp,
        driverId: d.id,
        driverName: d.name,
      }))
    ),
  ]
    .filter((fp) => typeof fp.score === "number")
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  const fpScores = {};
  driverObjects.forEach((driver) => {
    driver.failurePoints.forEach((fp) => {
      fpScores[fp.id] = fp.score;
    });
  });

  const flatDriverScores = {};
  driverObjects.forEach((driver) => {
    flatDriverScores[driver.id] = driver.score;
  });

  const layerScoresMap = {};
  layerScores.forEach((layer) => {
    layerScoresMap[layer.id] = layer.score;
  });

  const flatGapHypothesisScores = {};
  gapScores.forEach((gap) => {
    flatGapHypothesisScores[gap.id] = gap.score;
  });

  const submissionId = makeSubmissionId();
  const submittedAt = new Date().toISOString();
  const organizationName = document.getElementById("organizationName").value.trim();
  const divisionName = document.getElementById("divisionName").value.trim();

  return {
    metadata: {
      surveyBatchId: getSurveyBatchId(),
      submissionId,
      organizationName,
      divisionName,
      submittedAt,
      appVersion: APP_VERSION,
      surveyVersion: SURVEY_VERSION,
      anonymity: true,
      responseStatus: "complete",
    },

    // backward compatibility
    appVersion: APP_VERSION,
    submittedAt,
    anonymity: true,
    organizationName,
    divisionName,

    scoringNotes: {
      likertScale: {
        "1": "Sangat Tidak Setuju",
        "2": "Tidak Setuju",
        "3": "Setuju",
        "4": "Sangat Setuju",
        "0": "Tidak Tahu / Tidak Relevan (excluded from formula)",
      },
      fpFormula: "FP Score = Σ(Question Score × Weight) / Σ(Weight valid)",
      driverFormula: "Driver Score = average of valid FP scores under the driver",
      layerFormula: "Layer score = average of driver scores inside that layer",
      publicGapFormula:
        "Public gap score = weighted average rolled up into 6 main OAM gaps using best-fit signal weight per FP",
      internalSignalFormula:
        "Internal signal score = weighted average of FP scores contributing to each internal signal category (primary = 1.0, secondary = 0.5)",
      gapLogic:
        "Public output remains 6 official OAM gaps: Strategic Clarity, Leadership Alignment, Execution System, Collaboration, Capability Fit, and Culture Engagement. Internal engine uses more granular signal categories to support multi-hypothesis analysis before interview / FGD validation.",
      openEndedLogic:
        "Open-ended is optional and does not affect scoring or page validation.",
      maturityFormula: "Organization maturity = average of all driver scores",
    },

    overall: {
      averageScore: overallAverage,
      maturityLevel: maturityLevel(overallAverage),
      status: driverStatus(overallAverage),
    },

    fpScores,
    driverScores: flatDriverScores,
    layerScoresMap,
    gapHypothesisScores: flatGapHypothesisScores,

    layerScores,
    gapScores,
    internalSignalGapScores,
    weakestDrivers,
    weakestFailurePoints,
    drivers: driverObjects,
    rawResponses: responseMap,
    rawOpenEnded: openEnded,
  };
}

async function sendToWebhook(payload) {
  if (!WEBHOOK_ENABLED) {
    return { ok: false, msg: "Webhook disabled" };
  }

  if (
    !APPS_SCRIPT_WEBHOOK_URL ||
    APPS_SCRIPT_WEBHOOK_URL === "PASTE_YOUR_WEBHOOK_URL_HERE"
  ) {
    return { ok: false, msg: "Webhook URL belum diisi" };
  }

  try {
    const iframeName = "hidden_iframe_webhook";

    let iframe = document.getElementById(iframeName);

    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.name = iframeName;
      iframe.id = iframeName;
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = APPS_SCRIPT_WEBHOOK_URL;
    form.target = iframeName;
    form.style.display = "none";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "payload";
    input.value = JSON.stringify(payload);

    form.appendChild(input);
    document.body.appendChild(form);

    form.submit();

    document.body.removeChild(form);

    return {
      ok: true,
      msg: "Webhook submitted via form",
    };
  } catch (error) {
    console.error("Webhook error:", error);
    return {
      ok: false,
      msg: `Webhook error: ${String(error)}`,
    };
  }
}

async function sendByEmailJS(payload) {
  if (!EMAILJS_ENABLED) return { ok: false, msg: "EmailJS disabled" };

  if (
    EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY" ||
    EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" ||
    EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID"
  ) {
    return { ok: false, msg: "EmailJS config belum diisi" };
  }

  const templateParams = {
    organization_name: payload.organizationName,
    division_name: payload.divisionName || "-",
    submitted_at: payload.submittedAt,
    overall_average: payload.overall.averageScore ?? "-",
    overall_maturity: payload.overall.maturityLevel,
    overall_status: payload.overall.status,

    driver_summary: payload.drivers
      .map((d) => `${d.id} ${d.name}: ${d.score ?? "-"} (${d.status})`)
      .join("\n"),

    failure_point_summary: payload.weakestFailurePoints
      .map((fp) => {
        const secondary = fp.secondaryGaps?.length
          ? ` | secondary: ${fp.secondaryGaps.join(", ")}`
          : "";
        return `${fp.id} - ${fp.name}: ${fp.score ?? "-"} | primary: ${fp.primaryGap}${secondary}`;
      })
      .join("\n"),

    gap_summary: payload.gapScores
      .map(
        (g) =>
          `${g.name}: ${g.score ?? "-"} (${g.status}) | applied weight: ${g.totalAppliedWeight}`
      )
      .join("\n"),

    layer_summary: payload.layerScores
      .map((l) => `${l.name}: ${l.score ?? "-"} (${l.status})`)
      .join("\n"),

    payload_json: JSON.stringify(payload, null, 2),
  };

  try {
    const res = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );
    return { ok: true, msg: `EmailJS success: ${res.status}` };
  } catch (err) {
    console.error(err);
    return { ok: false, msg: "Gagal kirim via EmailJS" };
  }
}

async function submitSurvey() {
  const payload = collectPayload();
  localStorage.setItem("oam_last_submission", JSON.stringify(payload));

  const webhookResult = await sendToWebhook(payload);
  const emailResult = await sendByEmailJS(payload);

  SURVEY.style.display = "none";
  THANKS.style.display = "block";

  const messages = [];

  if (webhookResult.ok) {
    messages.push("Hasil berhasil dikirim ke data store internal.");
  } else {
    messages.push(`Webhook: ${webhookResult.msg}`);
  }

  if (emailResult.ok) {
    messages.push("Backup EmailJS berhasil dikirim.");
  } else {
    messages.push(`EmailJS: ${emailResult.msg}`);
  }

  submitNote.textContent = messages.join(" ");

  const debugEl = document.getElementById("debugOutput");
  if (debugEl) {
    debugEl.textContent = JSON.stringify(
      {
        payload,
        webhookResult,
        emailResult,
      },
      null,
      2
    );
  }

  window.scrollTo(0, 0);
}

function handleNext() {
  const check = validateCurrentPage();
  if (!check.ok) {
    alert(check.msg);
    return;
  }

  const isLastPage = pageIndex >= pages.length - 1;
  if (isLastPage) {
    submitSurvey();
    return;
  }

  showPage(pageIndex + 1);
  updateProgress();
}

function handlePrev() {
  if (pageIndex <= 0) return;
  showPage(pageIndex - 1);
  updateProgress();
}

const instructionModal = document.getElementById("instructionModal");
const closeInstructionModal = document.getElementById("closeInstructionModal");

document.getElementById("startBtn").addEventListener("click", () => {
  if (instructionModal) instructionModal.style.display = "flex";
});

if (closeInstructionModal) {
  closeInstructionModal.addEventListener("click", () => {
    if (instructionModal) instructionModal.style.display = "none";
    INTRO.style.display = "none";
    SURVEY.style.display = "block";
    renderPages();
  });
}

if (instructionModal) {
  instructionModal.addEventListener("click", (e) => {
    if (e.target === instructionModal) instructionModal.style.display = "none";
  });
}

[nextBtn, nextBtnBottom].forEach((b) =>
  b.addEventListener("click", handleNext)
);

[prevBtn, prevBtnBottom].forEach((b) =>
  b.addEventListener("click", handlePrev)
);

document.getElementById("restartBtn").addEventListener("click", () => {
  window.location.reload();
});

initEmailJS();