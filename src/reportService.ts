/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, getDocs, query, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { mockStudents, mockDetailedAttempts, mockSettings, mockQuestions } from "./data";
import { Student, QuizAttempt, AppSettings, Question } from "./types";

export interface TeacherReportData {
  students: Student[];
  attempts: QuizAttempt[];
  settings: AppSettings;
  isDemoMode: boolean;
  error?: string;
  hasIndexError?: boolean;
}

/**
 * Safely calculates averages, protecting against division by zero.
 */
export function safeAverage(values: number[]): number {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

/**
 * Safely calculates percentages, protecting against division by zero.
 */
export function safePercentage(numerator: number, denominator: number): number {
  if (!denominator || denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100 * 10) / 10;
}

/**
 * Formats ISO strings to Thai Date Format (YYYY-MM-DD or custom)
 */
export function formatDate(isoString: string): string {
  if (!isoString || isoString === "-") return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    // Format: DD/MM/YYYY HH:mm
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear() + 543; // Thai Buddhist Era
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}

/**
 * Loads Teacher Dashboard Data from Firebase Core or falls back to Demo Mode.
 * Respects Spark plan efficiency: one-time fetch, record capping (500), manual refresh trigger.
 */
export async function loadTeacherReportData(): Promise<TeacherReportData> {
  if (!isFirebaseConfigured) {
    return {
      students: mockStudents,
      attempts: mockDetailedAttempts,
      settings: mockSettings,
      isDemoMode: true
    };
  }

  try {
    // 1. Fetch settings
    let appSettings = mockSettings;
    const settingsDocRef = doc(db, "settings", "app");
    const settingsSnap = await getDoc(settingsDocRef);
    if (settingsSnap.exists()) {
      appSettings = settingsSnap.data() as AppSettings;
    }

    // 2. Fetch students
    const studentsList: Student[] = [];
    const studentsSnap = await getDocs(collection(db, "students"));
    studentsSnap.forEach((docSnap) => {
      studentsList.push(docSnap.data() as Student);
    });

    // 3. Fetch attempts (capped at 500 for optimization and Spark compliance)
    const attemptsList: QuizAttempt[] = [];
    // We try ordering in Firestore, but query index might not be built yet.
    // To protect against Firebase exception and show helpful index instructions:
    let attemptsSnap;
    let hasIndexError = false;
    try {
      const q = query(
        collection(db, "quizAttempts"),
        orderBy("submittedAt", "desc"),
        limit(500)
      );
      attemptsSnap = await getDocs(q);
    } catch (orderErr: any) {
      console.warn("Firestore index error detected, falling back to unordered fetch. Detailed logs:", orderErr);
      if (orderErr?.message && (orderErr.message.includes("index") || orderErr.message.includes("FAILED_PRECONDITION"))) {
        hasIndexError = true;
      }
      // Unordered fallback to keep app running
      const fallbackQuery = query(collection(db, "quizAttempts"), limit(500));
      attemptsSnap = await getDocs(fallbackQuery);
    }

    attemptsSnap.forEach((docSnap) => {
      attemptsList.push(docSnap.data() as QuizAttempt);
    });

    // Sort client-side as fallback / validation
    attemptsList.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    // If both databases are completely empty, we pre-populate or fallback to demo data
    if (studentsList.length === 0 && attemptsList.length === 0) {
      return {
        students: mockStudents,
        attempts: mockDetailedAttempts,
        settings: appSettings,
        isDemoMode: true,
        error: "ไม่พบข้อมูลในระบบจริง คืนค่าคุณลักษณะชุดข้อมูลจำลองเพื่อเป็นตัวอย่าง"
      };
    }

    return {
      students: studentsList.length > 0 ? studentsList : mockStudents,
      attempts: attemptsList.length > 0 ? attemptsList : mockDetailedAttempts,
      settings: appSettings,
      isDemoMode: false,
      hasIndexError
    };
  } catch (err: any) {
    console.error("Firebase read rejected. Switched to high-fidelity Demo Mode client-side. Error details:", err);
    return {
      students: mockStudents,
      attempts: mockDetailedAttempts,
      settings: mockSettings,
      isDemoMode: true,
      error: err?.message || "การเชื่อมต่อล้มเหลว ดึงชุดข้อมูลตัวอย่างที่พร้อมแสดงผลมาแทน"
    };
  }
}

export interface ReportFilters {
  section: string;       // "all", "ห้อง A1", "ห้อง A2", etc.
  quizType: string;      // "all", "pre", "practice", "post"
  startDate: string;     // YYYY-MM-DD
  endDate: string;       // YYYY-MM-DD
  passingStatus: string; // "all", "ผ่านเกณฑ์", "ควรทบทวนเพิ่มเติม"
  searchKeyword: string; // matches studentId, name, email
}

/**
 * Filter utility to refine student and test records client-side
 */
export function applyReportFilters(
  data: { students: Student[]; attempts: QuizAttempt[] },
  filters: ReportFilters
) {
  // Filter attempts first
  const filteredAttempts = data.attempts.filter((attempt) => {
    // 1. Section
    if (filters.section !== "all" && attempt.section !== filters.section) return false;

    // 2. Quiz type
    if (filters.quizType !== "all" && attempt.quizType !== filters.quizType) return false;

    // 3. Date range
    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      const sAt = new Date(attempt.submittedAt).getTime();
      if (sAt < start) return false;
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate + "T23:59:59").getTime();
      const sAt = new Date(attempt.submittedAt).getTime();
      if (sAt > end) return false;
    }

    // 4. Passing status
    if (filters.passingStatus !== "all" && attempt.resultStatus !== filters.passingStatus) return false;

    // 5. Search keyword (matches student detail in attempt)
    if (filters.searchKeyword.trim() !== "") {
      const key = filters.searchKeyword.toLowerCase();
      const idMatch = attempt.studentId?.toLowerCase().includes(key);
      const nameMatch = attempt.studentName?.toLowerCase().includes(key);
      const emailMatch = attempt.studentEmail?.toLowerCase().includes(key);
      if (!idMatch && !nameMatch && !emailMatch) return false;
    }

    return true;
  });

  // Filter students
  const filteredStudents = data.students.filter((student) => {
    // 1. Section
    if (filters.section !== "all" && student.section !== filters.section) return false;

    // 2. Search keyword
    if (filters.searchKeyword.trim() !== "") {
      const key = filters.searchKeyword.toLowerCase();
      const idMatch = student.studentId?.toLowerCase().includes(key);
      const nameMatch = student.displayName?.toLowerCase().includes(key);
      const emailMatch = student.email?.toLowerCase().includes(key);
      if (!idMatch && !nameMatch && !emailMatch) return false;
    }

    return true;
  });

  return {
    students: filteredStudents,
    attempts: filteredAttempts
  };
}

export interface DashboardOverview {
  totalStudents: number;
  attemptedStudents: number;
  totalAttempts: number;
  averageScore: number;
  averagePreScore: number;
  averagePostScore: number;
  averageProgress: number;
  passRate: number;
  atRiskCount: number;
  mostCommonReviewTopic: string;
}

/**
 * Computes 10 specific summary metrics for the instructor overview tab
 */
export function buildTeacherOverview(
  students: Student[],
  attempts: QuizAttempt[],
  settings: AppSettings
): DashboardOverview {
  const passingCriteria = settings?.passingCriteria ?? 60;
  const riskCriteria = settings?.riskCriteria ?? 60;

  // 1. Total active students
  const totalStudents = students.length;

  // 2. Total unique students who completed any tests
  const completedStudentIds = new Set(attempts.map((a) => a.studentId));
  const attemptedStudents = completedStudentIds.size;

  // 3. Total attempts count
  const totalAttempts = attempts.length;

  // 4. Average score (all quiz attempts included)
  const allPercentages = attempts.map((a) => a.scorePercentage);
  const averageScore = safeAverage(allPercentages);

  // 5. Pre-test average score
  const preTestAttempts = attempts.filter((a) => a.quizType === "pre");
  const averagePreScore = safeAverage(preTestAttempts.map((a) => a.scorePercentage));

  // 6. Post-test average score
  const postTestAttempts = attempts.filter((a) => a.quizType === "post");
  const averagePostScore = safeAverage(postTestAttempts.map((a) => a.scorePercentage));

  // 7. Average Progress (Post-test minus Pre-test per student)
  const studentProgresses: number[] = [];
  students.forEach((student) => {
    const sId = student.studentId;
    const sAttempts = attempts.filter((a) => a.studentId === sId);

    const sPreAttempts = sAttempts.filter((a) => a.quizType === "pre");
    const sPostAttempts = sAttempts.filter((a) => a.quizType === "post");

    if (sPreAttempts.length > 0 && sPostAttempts.length > 0) {
      // Find latest pre and post scores
      const sortedPre = [...sPreAttempts].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      const sortedPost = [...sPostAttempts].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      const preVal = sortedPre[0].scorePercentage;
      const postVal = sortedPost[0].scorePercentage;
      studentProgresses.push(postVal - preVal);
    }
  });
  const averageProgress = safeAverage(studentProgresses);

  // 8. Overarching passing rate over total attempts
  const passedAttempts = attempts.filter((a) => a.scorePercentage >= passingCriteria).length;
  const passRate = safePercentage(passedAttempts, totalAttempts);

  // 9. Identifying At-risk students
  const atRiskCount = students.filter((student) => {
    const sAttempts = attempts.filter((a) => a.studentId === student.studentId);
    if (sAttempts.length === 0) return false; // Not tested, not active

    const sortedAttempts = [...sAttempts].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    const latestAttempt = sortedAttempts[0];

    // Find latest post-test score specifically
    const postAttempts = sAttempts.filter((a) => a.quizType === "post");
    const sortedPost = [...postAttempts].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    const latestPostScore = sortedPost.length > 0 ? sortedPost[0].scorePercentage : null;

    // Weak topics count in latest attempt
    const weakTopicsInLatest = latestAttempt.topicScores
      ? latestAttempt.topicScores.filter((t) => t.scorePercentage < passingCriteria).length
      : 0;

    const cond1 = latestAttempt.scorePercentage < riskCriteria;
    const cond2 = latestPostScore !== null && latestPostScore < riskCriteria;
    const cond3 = weakTopicsInLatest >= 2;

    return cond1 || cond2 || cond3;
  }).length;

  // 10. Most common review topic requested
  const topicCounts: Record<string, number> = {};
  attempts.forEach((attempt) => {
    if (attempt.reviewTopics) {
      attempt.reviewTopics.forEach((topic) => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    }
  });
  let mostCommonReviewTopic = "ไม่มีข้อเสนอแนะ";
  let maxCount = 0;
  Object.entries(topicCounts).forEach(([topic, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonReviewTopic = topic;
    }
  });

  return {
    totalStudents,
    attemptedStudents,
    totalAttempts,
    averageScore,
    averagePreScore,
    averagePostScore,
    averageProgress,
    passRate,
    atRiskCount,
    mostCommonReviewTopic: maxCount > 0 ? `${mostCommonReviewTopic} (${maxCount} ครั้ง)` : "ไม่มีข้อเสนอแนะ"
  };
}

export interface IndividualScoreRow {
  studentId: string;
  name: string;
  section: string;
  email: string;
  latestScore: number;
  latestQuizType: string;
  latestSubmittedAt: string;
  latestStatus: string;
  preTestScore: number | null;
  postTestScore: number | null;
  progressScore: number | null;
  totalAttempts: number;
  reviewTopicsCount: number;
  weakTopics: string[];
  allAttempts: QuizAttempt[];
}

/**
 * Prepares robust records focusing on specific student score diagnostics
 */
export function buildIndividualScoreReport(
  students: Student[],
  attempts: QuizAttempt[],
  settings: AppSettings
): IndividualScoreRow[] {
  const passingCriteria = settings?.passingCriteria ?? 60;

  return students.map((student) => {
    const sId = student.studentId;
    const sAttempts = attempts.filter((a) => a.studentId === sId);

    // Sort student attempts descending by date to trace timelines
    const sorted = [...sAttempts].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    const latest = sorted[0] || null;

    // Pre and Post scores
    const preAttempts = sAttempts.filter((a) => a.quizType === "pre");
    const postAttempts = sAttempts.filter((a) => a.quizType === "post");

    const sortedPre = [...preAttempts].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    const sortedPost = [...postAttempts].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    const preLatestScore = sortedPre.length > 0 ? sortedPre[0].scorePercentage : null;
    const postLatestScore = sortedPost.length > 0 ? sortedPost[0].scorePercentage : null;

    let progress: number | null = null;
    if (preLatestScore !== null && postLatestScore !== null) {
      progress = Math.round((postLatestScore - preLatestScore) * 10) / 10;
    }

    const weakTopics = latest?.topicScores
      ? latest.topicScores.filter((t) => t.scorePercentage < passingCriteria).map((t) => t.topicName)
      : [];

    return {
      studentId: sId,
      name: student.displayName,
      section: student.section,
      email: student.email,
      latestScore: latest ? latest.scorePercentage : 0,
      latestQuizType: latest ? (latest.quizType === "pre" ? "Pre-test" : latest.quizType === "post" ? "Post-test" : "Practice") : "-",
      latestSubmittedAt: latest ? latest.submittedAt : "-",
      latestStatus: latest ? latest.resultStatus : "-",
      preTestScore: preLatestScore,
      postTestScore: postLatestScore,
      progressScore: progress,
      totalAttempts: sAttempts.length,
      reviewTopicsCount: weakTopics.length,
      weakTopics,
      allAttempts: sorted
    };
  });
}

export interface TopicScoreRow {
  topicName: string;
  totalAttemptsIncluded: number;
  averageTopicScore: number;
  passRateByTopic: number;
  numberOfStudentsBelowCriteria: number;
  trendStatus: "ดีเยี่ยม" | "ปกติ" | "ควรเฝ้าระวังรุนแรง";
}

/**
 * Aggregates clinical exam topics performance across attempts
 */
export function buildTopicScoreReport(
  attempts: QuizAttempt[],
  students: Student[],
  settings: AppSettings
): TopicScoreRow[] {
  const passingCriteria = settings?.passingCriteria ?? 60;
  const topicMap: Record<string, { scores: number[]; passedCount: number; studentLatest: Record<string, number> }> = {};

  // Gather attempts to compile averages
  attempts.forEach((attempt) => {
    if (attempt.topicScores) {
      attempt.topicScores.forEach((tScore) => {
        if (!topicMap[tScore.topicName]) {
          topicMap[tScore.topicName] = {
            scores: [],
            passedCount: 0,
            studentLatest: {}
          };
        }

        topicMap[tScore.topicName].scores.push(tScore.scorePercentage);
        if (tScore.scorePercentage >= passingCriteria) {
          topicMap[tScore.topicName].passedCount += 1;
        }

        // Trace latest score of topic per student
        const currentStoredTime = attempt.submittedAt;
        const stored = topicMap[tScore.topicName].studentLatest[attempt.studentId];
        if (!stored) {
          topicMap[tScore.topicName].studentLatest[attempt.studentId] = tScore.scorePercentage;
        }
      });
    }
  });

  return Object.entries(topicMap).map(([topicName, data]) => {
    const totalAttemptsIncluded = data.scores.length;
    const averageTopicScore = safeAverage(data.scores);
    const passRateByTopic = safePercentage(data.passedCount, totalAttemptsIncluded);

    // Students below criteria in their last recorded attempt for this item
    let numberOfStudentsBelowCriteria = 0;
    Object.values(data.studentLatest).forEach((score) => {
      if (score < passingCriteria) {
        numberOfStudentsBelowCriteria++;
      }
    });

    let trendStatus: "ดีเยี่ยม" | "ปกติ" | "ควรเฝ้าระวังรุนแรง" = "ปกติ";
    if (averageTopicScore >= 75) trendStatus = "ดีเยี่ยม";
    else if (averageTopicScore < passingCriteria) trendStatus = "ควรเฝ้าระวังรุนแรง";

    return {
      topicName,
      totalAttemptsIncluded,
      averageTopicScore,
      passRateByTopic,
      numberOfStudentsBelowCriteria,
      trendStatus
    };
  });
}

export interface WrongQuestionRow {
  questionId: string;
  topicName: string;
  shortQuestionText: string;
  questionText: string;
  scenario: string;
  options: { a: string; b: string; c: string; d: string };
  correctOption: string;
  correctExplanation: string;
  totalAttempts: number;
  wrongAttempts: number;
  wrongRate: number;
  difficulty: string;
  cognitiveLevel: string;
  optionDistribution: { a: number; b: number; c: number; d: number };
}

/**
 * Builds item analysis on clinical situations highlighting tricky questions
 */
export function buildMostWrongQuestionsReport(
  attempts: QuizAttempt[]
): WrongQuestionRow[] {
  const questionAggregation: Record<string, {
    totalAnswers: number;
    wrongCount: number;
    optionCounts: Record<string, number>;
    meta?: any;
  }> = {};

  // Extract from answers lists embedded inside quiz attempts
  attempts.forEach((attempt) => {
    if (attempt.answers) {
      attempt.answers.forEach((ans) => {
        const qId = ans.questionId;
        if (!questionAggregation[qId]) {
          questionAggregation[qId] = {
            totalAnswers: 0,
            wrongCount: 0,
            optionCounts: { a: 0, b: 0, c: 0, d: 0 }
          };
        }

        questionAggregation[qId].totalAnswers += 1;
        if (!ans.isCorrect) {
          questionAggregation[qId].wrongCount += 1;
        }

        const selected = ans.selectedOption?.toLowerCase();
        if (selected && ["a", "b", "c", "d"].includes(selected)) {
          questionAggregation[qId].optionCounts[selected] += 1;
        }
      });
    }

    // Capture text details of questions from snapshot if any to avoid blank spots
    if (attempt.questionSnapshot) {
      attempt.questionSnapshot.forEach((snap) => {
        const qId = snap.questionId;
        if (questionAggregation[qId] && !questionAggregation[qId].meta) {
          questionAggregation[qId].meta = {
            topicName: snap.topicName,
            scenario: snap.scenario,
            questionText: snap.questionText,
            options: {
              a: snap.optionA,
              b: snap.optionB,
              c: snap.optionC,
              d: snap.optionD
            },
            correctOption: snap.correctOption,
            correctExplanation: snap.correctExplanation
          };
        }
      });
    }
  });

  return mockQuestions.map((q) => {
    const agg = questionAggregation[q.questionId];
    const totalAnswers = agg ? agg.totalAnswers : 0;
    const wrongCount = agg ? agg.wrongCount : 0;

    const optA = agg ? agg.optionCounts.a : 0;
    const optB = agg ? agg.optionCounts.b : 0;
    const optC = agg ? agg.optionCounts.c : 0;
    const optD = agg ? agg.optionCounts.d : 0;

    const distA = totalAnswers > 0 ? Math.round((optA / totalAnswers) * 100) : 0;
    const distB = totalAnswers > 0 ? Math.round((optB / totalAnswers) * 100) : 0;
    const distC = totalAnswers > 0 ? Math.round((optC / totalAnswers) * 100) : 0;
    const distD = totalAnswers > 0 ? Math.round((optD / totalAnswers) * 100) : 0;

    const wrongRate = totalAnswers > 0 ? Math.round((wrongCount / totalAnswers) * 100 * 10) / 10 : 0;

    return {
      questionId: q.questionId,
      topicName: q.topic,
      shortQuestionText: q.questionText.length > 55 ? q.questionText.substring(0, 55) + "..." : q.questionText,
      questionText: q.questionText,
      scenario: q.scenario || "ไม่มีคำอธิบายสถานการณ์",
      options: q.options,
      correctOption: q.correctAnswer,
      correctExplanation: q.explanation || "ไม่มีข้อมูลเฉลยเพิ่มเติม",
      totalAttempts: totalAnswers,
      wrongAttempts: wrongCount,
      wrongRate,
      difficulty: q.difficulty === "hard" ? "ยากมาก" : q.difficulty === "medium" ? "ปานกลาง" : "ง่าย",
      cognitiveLevel: q.difficulty === "hard" ? "ขั้นวิเคราะห์ (Analysis)" : "ขั้นประยุกต์ใช้ (Application)",
      optionDistribution: { a: distA, b: distB, c: distC, d: distD }
    };
  });
}

export interface AtRiskRow {
  studentId: string;
  name: string;
  section: string;
  email: string;
  latestScore: number;
  latestPostScore: number | null;
  progressScore: number | null;
  weakTopicsCount: number;
  weakTopics: string[];
  riskReason: string;
  submittedAt: string;
}

/**
 * Identifies vulnerable students needing instructional mentorship support
 */
export function buildAtRiskStudentsReport(
  students: Student[],
  attempts: QuizAttempt[],
  settings: AppSettings
): AtRiskRow[] {
  const passingCriteria = settings?.passingCriteria ?? 60;
  const riskCriteria = settings?.riskCriteria ?? 60;

  const result: AtRiskRow[] = [];

  students.forEach((student) => {
    const sAttempts = attempts.filter((a) => a.studentId === student.studentId);
    if (sAttempts.length === 0) return; // Not active yet

    const sorted = [...sAttempts].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    const latest = sorted[0];

    // Find latest post-test specifically
    const postAttempts = sAttempts.filter((a) => a.quizType === "post");
    const sortedPost = [...postAttempts].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    const latestPostScore = sortedPost.length > 0 ? sortedPost[0].scorePercentage : null;

    // Find latest pre-test specifically
    const preAttempts = sAttempts.filter((a) => a.quizType === "pre");
    const sortedPre = [...preAttempts].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    const latestPreScore = sortedPre.length > 0 ? sortedPre[0].scorePercentage : null;

    let progress: number | null = null;
    if (latestPreScore !== null && latestPostScore !== null) {
      progress = Math.round((latestPostScore - latestPreScore) * 10) / 10;
    }

    const weakTopics = latest.topicScores
      ? latest.topicScores.filter((t) => t.scorePercentage < passingCriteria).map((t) => t.topicName)
      : [];

    let riskReason = "";
    let isAtRisk = false;

    if (latest.scorePercentage < riskCriteria) {
      isAtRisk = true;
      riskReason += `คะแนนสอบครั้งล่าสุด (${latest.scorePercentage}%) ต่ำกว่าเกณฑ์วิกฤตที่จัดตั้ง (${riskCriteria}%) `;
    }

    if (latestPostScore !== null && latestPostScore < riskCriteria) {
      isAtRisk = true;
      if (riskReason !== "") riskReason += " | ";
      riskReason += `คะแนนหลังทบทวน (Post-test) ล่าสุด (${latestPostScore}%) ต่ำกว่าทางผ่านเกณฑ์ที่ปลอดภัย `;
    }

    if (weakTopics.length >= 2) {
      isAtRisk = true;
      if (riskReason !== "") riskReason += " | ";
      riskReason += `พบหัวข้อที่ควรส่งเสริมพัฒนาการศึกษาถึง ${weakTopics.length} หัวข้อในการประเมินหลังฝึกทำ`;
    }

    if (isAtRisk) {
      result.push({
        studentId: student.studentId,
        name: student.displayName,
        section: student.section,
        email: student.email,
        latestScore: latest.scorePercentage,
        latestPostScore,
        progressScore: progress,
        weakTopicsCount: weakTopics.length,
        weakTopics,
        riskReason: riskReason.trim(),
        submittedAt: latest.submittedAt
      });
    }
  });

  return result;
}

/**
 * Escapes CSV special characters safely
 */
function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return "";
  let str = String(val);
  // Replace internal quotes with double quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Builds and downloads CSV file strictly on the client side.
 * Employs UTF-8 with BOM (\uFEFF) to guarantee readable Thai characters within Excel.
 */
export function exportToCsv(filename: string, headers: string[], rows: any[][]): void {
  const csvLines = [headers.map(escapeCsvCell).join(",")];

  rows.forEach((row) => {
    csvLines.push(row.map(escapeCsvCell).join(","));
  });

  const csvContent = csvLines.join("\r\n");
  
  // Adding UTF-8 BOM byte sequence 0xEF, 0xBB, 0xBF so Microsoft Excel detects encoding
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
