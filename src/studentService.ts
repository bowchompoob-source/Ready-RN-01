/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth, db, isFirebaseConfigured } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { QuizAttempt, AppSettings } from "./types";
import { getTopicIdByName } from "./quizUtils";

export interface StudentTopicPlan {
  topicId: string;
  topicName: string;
  latestScore: number | null;
  averageScore: number;
  weakCount: number;
  totalQuestionsCount: number;
  status: "แข็งแรง" | "ผ่านเกณฑ์" | "ควรทบทวน" | "ต้องให้ความสำคัญ";
  recommendation: string;
}

export interface AttemptComparisonResult {
  scoreA: number;
  scoreB: number;
  diffScore: number;
  improvedTopics: string[];
  declinedTopics: string[];
  persistentlyWeakTopics: string[];
  topicComparison: {
    topicName: string;
    scoreA: number | null;
    scoreB: number | null;
    diff: number | null;
  }[];
}

// ----------------------------------------------------
// DB / DATA LOADING
// ----------------------------------------------------

/**
 * Loads all quiz attempts of the specified user's uid.
 * Uses one-time read without real-time listeners for Spark Plan efficiency.
 * Prevents loading attempts of other students.
 */
export async function loadStudentLearningData(uid: string): Promise<{ attempts: QuizAttempt[]; isDemoMode: boolean }> {
  if (isFirebaseConfigured && uid && uid !== "demo_student_uid") {
    try {
      const q = query(
        collection(db, "quizAttempts"),
        where("uid", "==", uid)
      );
      const snap = await getDocs(q);
      const attempts: QuizAttempt[] = [];
      snap.forEach((docSnap) => {
        attempts.push(docSnap.data() as QuizAttempt);
      });
      // Sort: submittedAt descending
      attempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      return { attempts, isDemoMode: false };
    } catch (err) {
      console.error("Failed to load real database student learning data", err);
    }
  }
  // Return demo attempts if firebase is not ready or failed
  return { attempts: getDemoStudentAttempts(), isDemoMode: true };
}

// ----------------------------------------------------
// ATTEMPT INDEXERS & CRITERIA METRICS
// ----------------------------------------------------

export function getLatestAttempt(attempts: QuizAttempt[]): QuizAttempt | null {
  if (!attempts || attempts.length === 0) return null;
  return attempts[0]; // Already sorted by date Desc
}

export function getLatestAttemptByType(attempts: QuizAttempt[], quizType: "pre" | "practice" | "post"): QuizAttempt | null {
  if (!attempts) return null;
  const filtered = attempts.filter((a) => a.quizType === quizType);
  return filtered.length > 0 ? filtered[0] : null;
}

/**
 * Calculates student Pre versus Post score changes
 */
export function calculateStudentProgress(attempts: QuizAttempt[]): {
  latestPreScore: number | null;
  latestPostScore: number | null;
  progressScore: number | null;
  practiceAverage: number | null;
  summaryText: string;
} {
  const latestPre = getLatestAttemptByType(attempts, "pre");
  const latestPost = getLatestAttemptByType(attempts, "post");

  const latestPreScore = latestPre ? latestPre.scorePercentage : null;
  const latestPostScore = latestPost ? latestPost.scorePercentage : null;

  let progressScore: number | null = null;
  if (latestPreScore !== null && latestPostScore !== null) {
    progressScore = Math.round((latestPostScore - latestPreScore) * 10) / 10;
  }

  const practiceAttempts = attempts.filter((a) => a.quizType === "practice");
  const practiceAverage =
    practiceAttempts.length > 0
      ? Math.round((practiceAttempts.reduce((sum, a) => sum + a.scorePercentage, 0) / practiceAttempts.length) * 10) / 10
      : null;

  let summaryText = "ยังไม่สามารถวัดระดับการเติบโตเนื่องจากคุณขาดข้อมูลสอบเปรียบเทียบ Pre-test หรือ Post-test";
  if (progressScore !== null) {
    if (progressScore > 0) {
      summaryText = `คุณมีพัฒนาการที่น่าประทับใจ! คะแนนพุ่งขึ้นร้อยละ ${progressScore}% หลังจากการทบทวนความรู้เข้มข้น`;
    } else if (progressScore === 0) {
      summaryText = "ระดับคะแนน pre-test และ post-test ของคุณยังคงเท่าเดิม ควรเพิ่มความรอบคอบและจัดสรรเวลาทบทวนหัวข้อบกพร่องสะสม";
    } else {
      summaryText = `คะแนนของคณลดลงร้อยละ ${Math.abs(progressScore)}% ควรย้อนกลับไปทำความเข้าใจในหัวข้อบกพร่องวิกฤตอีกครั้งเพื่อซ่อมแซมจุดรั่วไหล`;
    }
  }

  return {
    latestPreScore,
    latestPostScore,
    progressScore,
    practiceAverage,
    summaryText,
  };
}

// ----------------------------------------------------
// TOPIC PLANNER
// ----------------------------------------------------

export const ALL_MIDWIFERY_TOPICS = [
  { id: "T001", name: "การฝากครรภ์" },
  { id: "T002", name: "การพยาบาลระยะคลอด" },
  { id: "T003", name: "การประเมินความก้าวหน้าของการคลอดและ Partograph" },
  { id: "T004", name: "ภาวะฉุกเฉินทางสูติกรรม" },
  { id: "T005", name: "การดูแลมารดาหลังคลอด" },
  { id: "T006", name: "การดูแลทารกแรกเกิด" },
];

export function getTopicDefaultRecommendation(topicName: string): string {
  if (topicName.includes("ฝากครรภ์")) {
    return "ทบทวนหลักการประเมินหญิงตั้งครรภ์ การคัดกรองความเสี่ยง และการให้คำแนะนำ";
  }
  if (topicName.includes("ระยะคลอด") || topicName.includes("ระยะคลอดและเฝ้าระวังสัญญาณ")) {
    return "ทบทวนการประเมินอาการเจ็บครรภ์จริง การดูแลในแต่ละระยะ และการเฝ้าระวังภาวะแทรกซ้อน";
  }
  if (topicName.includes("ความก้าวหน้า") || topicName.includes("Partograph") || topicName.includes("พาร์โทกราฟ")) {
    return "ทบทวนการอ่านกราฟความก้าวหน้าของการคลอด เส้น alert/action และการตัดสินใจทางคลินิก";
  }
  if (topicName.includes("ฉุกเฉิน") || topicName.includes("สูติกรรม")) {
    return "ทบทวนการจัดลำดับความสำคัญและการพยาบาลเร่งด่วนในภาวะฉุกเฉิน";
  }
  if (topicName.includes("หลังคลอด") || topicName.includes("มารดาหลังคลอด")) {
    return "ทบทวนการประเมินมารดาหลังคลอด การตกเลือด และการให้คำแนะนำ";
  }
  if (topicName.includes("แรกเกิด") || topicName.includes("ทารกแรกเกิด") || topicName.includes("ทารก")) {
    return "ทบทวนการประเมินทารกแรกเกิด การดูแลอุณหภูมิ การหายใจ และการให้นม";
  }
  return "สแกนสถิติหัวข้อย่อยและทำโจทย์อย่างระมัดระวังเพื่อทบทวนพื้นฐานความเข้าใจทางคลินิก";
}

/**
 * Computes individual score profiles and plans recommendations for each midwifery topic.
 */
export function buildTopicReviewPlan(
  attempts: QuizAttempt[],
  topics: { id: string; name: string }[] = ALL_MIDWIFERY_TOPICS,
  settings: AppSettings = { passingCriteria: 60, riskCriteria: 60, questionsPerSet: 10, isOpenRegistration: true }
): StudentTopicPlan[] {
  const passingCriteria = settings.passingCriteria;

  // Build plans for each topic in the curriculum
  return topics.map((top) => {
    // 1. Gather all scores for this specific topic over all attempts
    const scoresForTopic: number[] = [];
    let weakCount = 0;
    let latestScore: number | null = null;
    let totalQuestionsCount = 0;

    // Loop from oldest to newest to trace latest easily, or check chronological order
    const chronologicalAttempts = [...attempts].reverse();
    
    chronologicalAttempts.forEach((att) => {
      if (att.topicScores) {
        const item = att.topicScores.find(
          (ts) => ts.topicId === top.id || ts.topicName.includes(top.name) || top.name.includes(ts.topicName)
        );
        if (item) {
          scoresForTopic.push(item.scorePercentage);
          latestScore = item.scorePercentage;
          totalQuestionsCount += item.totalQuestions;
          if (item.scorePercentage < passingCriteria) {
            weakCount++;
          }
        }
      }
    });

    const averageScore =
      scoresForTopic.length > 0
        ? Math.round((scoresForTopic.reduce((sum, s) => sum + s, 0) / scoresForTopic.length) * 10) / 10
        : 0;

    // 2. Classify status based on formula:
    // - latestTopicScore >= criteria + 15 -> แข็งแรง
    // - latestTopicScore >= criteria -> ผ่านเกณฑ์
    // - latestTopicScore < criteria และ weakCount < 2 -> ควรทบทวน
    // - latestTopicScore < criteria และ weakCount >= 2 -> ต้องให้ความสำคัญ
    let status: "แข็งแรง" | "ผ่านเกณฑ์" | "ควรทบทวน" | "ต้องให้ความสำคัญ" = "ควรทบทวน";
    
    if (latestScore === null) {
      status = "ควรทบทวน"; // default or no data
    } else if (latestScore >= passingCriteria + 15) {
      status = "แข็งแรง";
    } else if (latestScore >= passingCriteria) {
      status = "ผ่านเกณฑ์";
    } else if (weakCount < 2) {
      status = "ควรทบทวน";
    } else {
      status = "ต้องให้ความสำคัญ";
    }

    const recommendation = getTopicDefaultRecommendation(top.name);

    return {
      topicId: top.id,
      topicName: top.name,
      latestScore,
      averageScore,
      weakCount,
      totalQuestionsCount,
      status,
      recommendation,
    };
  });
}

// ----------------------------------------------------
// READINESS SCORE CALCULATOR
// ----------------------------------------------------

/**
 * Calculates pre-exam readiness estimate (0–100%)
 * formula: (latestPostTestScore * 0.5) + (averageLatestTopicScore * 0.3) + (progressComponent * 0.2)
 *
 * progressComponent:
 * - If progressScore >= 20 -> 100
 * - If progressScore in [0, 20] -> progressScore * 5
 * - If progressScore < 0 -> 0
 */
export function calculateReadinessScore(
  attempts: QuizAttempt[],
  settings: AppSettings = { passingCriteria: 60, riskCriteria: 60, questionsPerSet: 10, isOpenRegistration: true }
): {
  readinessScore: number;
  readinessGrade: "พร้อมมาก" | "ค่อนข้างพร้อม" | "ควรทบทวนเพิ่มเติม" | "ต้องเร่งทบทวน";
  isPreliminary: boolean;
  reason: string;
} {
  const latestPost = getLatestAttemptByType(attempts, "post");
  const latestPre = getLatestAttemptByType(attempts, "pre");
  const latestGeneral = getLatestAttempt(attempts);

  // 1. Post-test score component (50%)
  let postTestScoreSource = 0;
  let isPreliminary = false;

  if (latestPost) {
    postTestScoreSource = latestPost.scorePercentage;
  } else {
    // Warning and fall-back scenario:
    isPreliminary = true;
    postTestScoreSource = latestGeneral ? latestGeneral.scorePercentage : 0;
  }

  // 2. Average of latest topic scores (30%)
  let averageLatestTopicScore = 0;
  const fallbackAttempt = latestPost || latestGeneral;
  if (fallbackAttempt && fallbackAttempt.topicScores && fallbackAttempt.topicScores.length > 0) {
    const sum = fallbackAttempt.topicScores.reduce((acc, t) => acc + t.scorePercentage, 0);
    averageLatestTopicScore = sum / fallbackAttempt.topicScores.length;
  } else {
    averageLatestTopicScore = postTestScoreSource; // Fallback
  }

  // 3. Progress component (20%)
  let progressComponentValue = 0;
  if (latestPre && latestPost) {
    const progressVal = latestPost.scorePercentage - latestPre.scorePercentage;
    if (progressVal >= 20) {
      progressComponentValue = 100;
    } else if (progressVal >= 0) {
      progressComponentValue = progressVal * 5;
    } else {
      progressComponentValue = 0;
    }
  } else if (latestPre && latestGeneral && latestGeneral !== latestPre) {
    const progressVal = latestGeneral.scorePercentage - latestPre.scorePercentage;
    if (progressVal >= 20) {
      progressComponentValue = 100;
    } else if (progressVal >= 0) {
      progressComponentValue = progressVal * 5;
    } else {
      progressComponentValue = 0;
    }
  } else {
    progressComponentValue = 50; // default medium credit
  }

  // Compute final score
  const readinessValue = postTestScoreSource * 0.5 + averageLatestTopicScore * 0.3 + progressComponentValue * 0.2;
  const readinessScore = Math.min(100, Math.max(0, Math.round(readinessValue)));

  // Classify level
  let readinessGrade: "พร้อมมาก" | "ค่อนข้างพร้อม" | "ควรทบทวนเพิ่มเติม" | "ต้องเร่งทบทวน" = "ต้องเร่งทบทวน";
  if (readinessScore >= 80) {
    readinessGrade = "พร้อมมาก";
  } else if (readinessScore >= 70) {
    readinessGrade = "ค่อนข้างพร้อม";
  } else if (readinessScore >= 60) {
    readinessGrade = "ควรทบทวนเพิ่มเติม";
  } else {
    readinessGrade = "ต้องเร่งทบทวน";
  }

  // Tailor diagnostic reasons
  let reason = "หากยังไม่มีสถิติตัวเลขวิเคราะห์ความพร้อม กรุณาเริ่มทำ Pre-test เพื่อจุดประกายคะแนนเบื้องต้น";
  if (attempts.length > 0) {
    if (readinessScore >= 80) {
      reason = "คุณมีความแข็งกร้าวทางวิชาการและการผ่าทางเลือกระยะคลอดที่สมบูรณ์แบบ รักษาความสม่ำเสมอพร้อมก้าวสู่ข้อสอบสภา";
    } else if (readinessScore >= 70) {
      reason = "คุณเข้าใจภาพรวมแต่มีสับสนใจหัวข้อย่อยที่มีนัยสำคัญอีกเล็กน้อย ทบทวนข้อสอบบกพร่องสะสมเพื่อดันคะแนนแตะ 80%";
    } else if (readinessScore >= 60) {
      reason = "ระดับคะแนนค่อนข้างเปราะบางและยังต่ำกว่าเกณฑ์ความปลอดภัย ทบทวนหัวข้อ Partograph และภาวะวิกฤตสูติกรรมเป็นหลัก";
    } else {
      reason = "คะแนนเฉลี่ยต่ำกว่าระดับส่งเสริมความมั่นคงสภาอย่างจำเป็น ควรกลับไปไล่เนื้อหากิจกรรมการฝากครรภ์หลังคลอดเชิงประเมินและทบทวนอย่างเร่งด่วน";
    }
  }

  return {
    readinessScore,
    readinessGrade,
    isPreliminary,
    reason,
  };
}

// ----------------------------------------------------
// PERSONAL RECOMMENDATIONS GENERATOR
// ----------------------------------------------------

/**
 * Builds custom rule-based student advice messages (Requirement #10)
 */
export function buildPersonalRecommendations(
  attempts: QuizAttempt[],
  topics: { id: string; name: string }[] = ALL_MIDWIFERY_TOPICS,
  settings: AppSettings = { passingCriteria: 60, riskCriteria: 60, questionsPerSet: 10, isOpenRegistration: true }
): string[] {
  const recommendations: string[] = [];

  const latestPre = getLatestAttemptByType(attempts, "pre");
  const latestPost = getLatestAttemptByType(attempts, "post");
  const practiceAttempts = attempts.filter((a) => a.quizType === "practice");
  const latestAttempt = getLatestAttempt(attempts);

  // Rule 1: No Pre-test
  if (!latestPre) {
    recommendations.push("🚨 เริ่มทำ Pre-test เพื่อประเมินระดับพื้นฐานและเตรียมแผนศึกษาสัมประสิทธิ์ความรู้ก่อนทบทวน");
  }

  // Rule 2: Has pre but no practice
  if (latestPre && practiceAttempts.length === 0) {
    recommendations.push("📖 ทำแบบฝึกข้อสอบสถานการณ์ (Practice Mode) เพื่อคุ้นเคยกับการคำนวณกราฟพาร์โทกราฟและการคิดวิเคราะห์ระดับคลินิก");
  }

  // Rule 3: Practice average is below criteria
  if (practiceAttempts.length > 0) {
    const practiceAvg = practiceAttempts.reduce((sum, a) => sum + a.scorePercentage, 0) / practiceAttempts.length;
    if (practiceAvg < settings.passingCriteria) {
      recommendations.push("🔄 ทบทวนวิเคราะห์เฉลยข้อผิดพลาดรายข้อในแบบฝึกซ้ำๆ มีอัตราส่วนการตกข้อสอบเฉลี่ยต่ำกว่าเกณฑ์มาตรฐานวิชาการ");
    }
  }

  // Rule 4: Post-test below criteria
  if (latestPost && latestPost.scorePercentage < settings.passingCriteria) {
    recommendations.push("📍 การทดสอบ Post-test สิ้นสุดมีคะแนนที่น่ากังวลต่ำกว่าดัชนีผ่านประเมินสภา ควรวางแผนเร่งทำความเข้าใจกลุ่มหัวข้อที่ยังมีระดับธงแดงประกอบสถานภาพ");
  }

  // Rule 5: Strong progress
  if (latestPre && latestPost) {
    const progress = latestPost.scorePercentage - latestPre.scorePercentage;
    if (progress > 10) {
      recommendations.push(`✨ มีการพัฒนาที่ดีขึ้นอย่างยิ่งยวดถึง +${progress}% แนะนำให้รักษาความคงเส้นคงวาและเจาะลึกเฉพาะหัวข้อย่อยที่บกพร่อง`);
    }
  }

  // Rule 6: Check specific catastrophic topics
  if (latestAttempt && latestAttempt.topicScores) {
    latestAttempt.topicScores.forEach((t) => {
      if (t.scorePercentage < settings.passingCriteria) {
        if (t.topicName.includes("ฉุกเฉิน") || t.topicName.includes("สูติกรรม")) {
          recommendations.push("⚠️ เน้นการคัดกรองจัดลำดับความสำคัญและการบริหารยาเร่งด่วนในภาวะฉุกเฉินทางสูติกรรม (เช่น PPH, Eclampsia)");
        }
        if (t.topicName.includes("Partograph") || t.topicName.includes("ความก้าวหน้า")) {
          recommendations.push("⚠️ เคลียร์แนวคิดการลากเส้นกราฟความก้าวหน้าคลอดและการตัดข้ามเส้น ALERT/ACTION เพื่อประกอบการรายงานเฝ้าระวังอย่างทันท่วงที");
        }
      }
    });
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ คุณมีสถานะสมบูรณ์แบบครอบคลุมวิชาวิทยาการและการวัดผล สอบถามข้อสับสนเล็กน้อยกับผู้คุมวิชาและเตรียมสอบสภาได้ทันที");
  }

  return recommendations;
}

// ----------------------------------------------------
// COMPARISON ENGINE
// ----------------------------------------------------

export function compareAttempts(attemptA: QuizAttempt, attemptB: QuizAttempt): AttemptComparisonResult {
  const scoreA = attemptA.scorePercentage;
  const scoreB = attemptB.scorePercentage;
  const diffScore = Math.round((scoreB - scoreA) * 10) / 10;

  const improvedTopics: string[] = [];
  const declinedTopics: string[] = [];
  const persistentlyWeakTopics: string[] = [];

  const topicComparison: AttemptComparisonResult["topicComparison"] = [];

  // Union of all available topics from both snaps
  const allTopicNames = new Set<string>();
  attemptA.topicScores?.forEach((t) => allTopicNames.add(t.topicName));
  attemptB.topicScores?.forEach((t) => allTopicNames.add(t.topicName));

  allTopicNames.forEach((name) => {
    const tA = attemptA.topicScores?.find((t) => t.topicName === name);
    const tB = attemptB.topicScores?.find((t) => t.topicName === name);

    const sA = tA ? tA.scorePercentage : null;
    const sB = tB ? tB.scorePercentage : null;

    let diff: number | null = null;
    if (sA !== null && sB !== null) {
      diff = Math.round((sB - sA) * 10) / 10;
      if (diff > 0) {
        improvedTopics.push(name);
      } else if (diff < 0) {
        declinedTopics.push(name);
      }

      if (sA < attemptA.passingCriteria && sB < attemptB.passingCriteria) {
        persistentlyWeakTopics.push(name);
      }
    }

    topicComparison.push({
      topicName: name,
      scoreA: sA,
      scoreB: sB,
      diff,
    });
  });

  return {
    scoreA,
    scoreB,
    diffScore,
    improvedTopics,
    declinedTopics,
    persistentlyWeakTopics,
    topicComparison,
  };
}

// ----------------------------------------------------
// SORTING & GROUPING HELPER SERVICES
// ----------------------------------------------------

export function groupAttemptsByQuizType(attempts: QuizAttempt[]): {
  pre: QuizAttempt[];
  practice: QuizAttempt[];
  post: QuizAttempt[];
} {
  return {
    pre: attempts.filter((a) => a.quizType === "pre"),
    practice: attempts.filter((a) => a.quizType === "practice"),
    post: attempts.filter((a) => a.quizType === "post"),
  };
}

export function sortAttempts(
  attempts: QuizAttempt[],
  sortMode: "date_desc" | "date_asc" | "score_desc" | "score_asc"
): QuizAttempt[] {
  const list = [...attempts];
  if (sortMode === "date_desc") {
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }
  if (sortMode === "date_asc") {
    return list.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  }
  if (sortMode === "score_desc") {
    return list.sort((a, b) => b.scorePercentage - a.scorePercentage);
  }
  if (sortMode === "score_asc") {
    return list.sort((a, b) => a.scorePercentage - b.scorePercentage);
  }
  return list;
}

// ----------------------------------------------------
// DEMO DATA SEEDING (Requirement #2 Requirement #12)
// ----------------------------------------------------

export function getDemoStudentAttempts(): QuizAttempt[] {
  return [
    {
      attemptId: "demo_attempt_post",
      uid: "demo_student_uid",
      studentId: "651101001",
      studentName: "นางสาวกานดา วิชิตสกุล",
      studentEmail: "kanda.w@stin.ac.th",
      section: "ห้อง A1",
      year: "2569",
      quizSetId: "QS003",
      quizSetTitle: "แบบทดสอบหลังทบทวนความรู้ (Post-test) - ประเมินมิติสมรรถนะปัญญาครบถ้วน",
      quizType: "post",
      attemptNo: 1,
      submittedAt: new Date(Date.now() - 1 * 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      totalQuestions: 10,
      correctAnswers: 8,
      wrongAnswers: 2,
      scorePercentage: 80.0,
      passingCriteria: 60,
      topicPassingCriteria: 60,
      resultStatus: "ผ่านเกณฑ์",
      reviewTopics: ["การช่วยเหลือและการส่งต่อผู้ป่วยวิกฤตทางสูติกรรม"],
      topicScores: [
        { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100.0, status: "ผ่านเกณฑ์" },
        { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100.0, status: "ผ่านเกณฑ์" },
        { topicId: "T003", topicName: "การประเมินความก้าวหน้าของการคลอดและ Partograph", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100.0, status: "ผ่านเกณฑ์" },
        { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 2, correctAnswers: 0, scorePercentage: 0.0, status: "ควรทบทวนเพิ่มเติม" },
        { topicId: "T005", topicName: "การดูแลมารดาหลังคลอด", totalQuestions: 1, correctAnswers: 1, scorePercentage: 100.0, status: "ผ่านเกณฑ์" },
        { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 1, correctAnswers: 1, scorePercentage: 100.0, status: "ผ่านเกณฑ์" },
      ],
      answers: [
        { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "a", correctOption: "a", isCorrect: true },
        { questionId: "Q002", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "b", correctOption: "b", isCorrect: true },
        { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "c", correctOption: "c", isCorrect: true },
        { questionId: "Q004", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "a", correctOption: "a", isCorrect: true },
        { questionId: "Q005", topicId: "T003", topicName: "การประเมินความก้าวหน้าของการคลอดและ Partograph", selectedOption: "d", correctOption: "d", isCorrect: true },
        { questionId: "Q006", topicId: "T003", topicName: "การประเมินความก้าวหน้าของการคลอดและ Partograph", selectedOption: "b", correctOption: "b", isCorrect: true },
        { questionId: "Q007", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "a", correctOption: "c", isCorrect: false },
        { questionId: "Q008", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "b", correctOption: "d", isCorrect: false },
        { questionId: "Q009", topicId: "T005", topicName: "การดูแลมารดาหลังคลอด", selectedOption: "a", correctOption: "a", isCorrect: true },
        { questionId: "Q010", topicId: "T006", topicName: "การดูแลทารกแรกเกิด", selectedOption: "b", correctOption: "b", isCorrect: true },
      ],
      questionSnapshot: [],
      revealPolicy: "full_reveal",
      createdAt: new Date().toISOString()
    },
    {
      attemptId: "demo_attempt_practice_1",
      uid: "demo_student_uid",
      studentId: "651101001",
      studentName: "นางสาวกานดา วิชิตสกุล",
      studentEmail: "kanda.w@stin.ac.th",
      section: "ห้อง A1",
      year: "2569",
      quizSetId: "QS002",
      quizSetTitle: "แบบทดสอบฝึกทักษะระดับคลินิก (Practice) - มีเฉลยและทฤษฎีละเอียด",
      quizType: "practice",
      attemptNo: 1,
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      totalQuestions: 10,
      correctAnswers: 7,
      wrongAnswers: 3,
      scorePercentage: 70.0,
      passingCriteria: 60,
      topicPassingCriteria: 60,
      resultStatus: "ผ่านเกณฑ์",
      reviewTopics: ["ภาวะฉุกเฉินทางสูติกรรม", "การประเมินความก้าวหน้าของการคลอดและ Partograph"],
      topicScores: [
        { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100.0, status: "ผ่านเกณฑ์" },
        { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100.0, status: "ผ่านเกณฑ์" },
        { topicId: "T003", topicName: "การประเมินความก้าวหน้าของการคลอดและ Partograph", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" },
        { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 2, correctAnswers: 0, scorePercentage: 0.0, status: "ควรทบทวนเพิ่มเติม" },
        { topicId: "T005", topicName: "การดูแลมารดาหลังคลอด", totalQuestions: 1, correctAnswers: 1, scorePercentage: 100.0, status: "ผ่านเกณฑ์" },
        { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 1, correctAnswers: 1, scorePercentage: 100.0, status: "ผ่านเกณฑ์" },
      ],
      answers: [],
      questionSnapshot: [],
      revealPolicy: "full_reveal",
      createdAt: new Date().toISOString()
    },
    {
      attemptId: "demo_attempt_pre",
      uid: "demo_student_uid",
      studentId: "651101001",
      studentName: "นางสาวกานดา วิชิตสกุล",
      studentEmail: "kanda.w@stin.ac.th",
      section: "ห้อง A1",
      year: "2569",
      quizSetId: "QS001",
      quizSetTitle: "แบบทดสอบวัดระดับพื้นฐานแรกตั้งครรภ์ (Pre-test) - วัดระดับเบื้องต้นก่อนการเรียนรู้กระชับ",
      quizType: "pre",
      attemptNo: 1,
      submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      totalQuestions: 10,
      correctAnswers: 5,
      wrongAnswers: 5,
      scorePercentage: 50.0,
      passingCriteria: 60,
      topicPassingCriteria: 60,
      resultStatus: "ควรทบทวนเพิ่มเติม",
      reviewTopics: ["การพยาบาลระยะคลอด", "การประเมินความก้าวหน้าของการคลอดและ Partograph", "ภาวะฉุกเฉินทางสูติกรรม"],
      topicScores: [
        { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" },
        { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" },
        { topicId: "T003", topicName: "การประเมินความก้าวหน้าของการคลอดและ Partograph", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" },
        { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 2, correctAnswers: 0, scorePercentage: 0.0, status: "ควรทบทวนเพิ่มเติม" },
        { topicId: "T005", topicName: "การดูแลมารดาหลังคลอด", totalQuestions: 1, correctAnswers: 1, scorePercentage: 100.0, status: "ผ่านเกณฑ์" },
        { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 1, correctAnswers: 1, scorePercentage: 100.0, status: "ผ่านเกณฑ์" },
      ],
      answers: [],
      questionSnapshot: [],
      revealPolicy: "score_only",
      createdAt: new Date().toISOString()
    }
  ];
}
