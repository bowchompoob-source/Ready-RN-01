/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, AppSettings } from "./types";

export interface TopicScore {
  topicId: string;
  topicName: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  status: "ผ่านเกณฑ์" | "ควรทบทวนเพิ่มเติม";
}

export interface QuizResultSummary {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  scorePercentage: number;
  resultStatus: "ผ่านเกณฑ์" | "ควรทบทวนเพิ่มเติม";
}

/**
 * Normalizes topic names to standardized IDs/categories for easier matching
 */
export function getTopicIdByName(name: string): string {
  if (name.includes("ฝากครรภ์") || name.includes("ระยะตั้งครรภ์")) return "T001";
  if (name.includes("ระยะคลอด") || name.includes("รับใหม่")) return "T002";
  if (name.includes("ประเมินความก้าวหน้า") || name.includes("Partograph") || name.includes("พาร์โทกราฟ")) return "T003";
  if (name.includes("ฉุกเฉิน") || name.includes("สูติกรรม")) return "T004";
  if (name.includes("หลังคลอด") || name.includes("ระยะหลังคลอด")) return "T005";
  if (name.includes("แรกเกิด") || name.includes("ทารก")) return "T006";
  return "T007"; // General or other
}

/**
 * Calculates raw score, percentage, correct/wrong counts, and checks passing criteria.
 */
export function calculateQuizResult(
  questions: Question[],
  answers: Record<string, "a" | "b" | "c" | "d">,
  settings: AppSettings
): QuizResultSummary {
  if (!questions || questions.length === 0) {
    return {
      totalQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      scorePercentage: 0,
      resultStatus: "ควรทบทวนเพิ่มเติม"
    };
  }

  let correctCount = 0;
  questions.forEach((q) => {
    const userAnswer = answers[q.questionId];
    if (userAnswer && userAnswer.toLowerCase() === q.correctAnswer.toLowerCase()) {
      correctCount++;
    }
  });

  const total = questions.length;
  // Guard against division by zero
  const rawPercentage = total > 0 ? (correctCount / total) * 100 : 0;
  const scorePercentage = Math.round(rawPercentage * 10) / 10; // Round to 1 decimal place

  const passingCriteria = settings?.passingCriteria ?? 60;
  const resultStatus = scorePercentage >= passingCriteria ? "ผ่านเกณฑ์" : "ควรทบทวนเพิ่มเติม";

  return {
    totalQuestions: total,
    correctAnswers: correctCount,
    wrongAnswers: total - correctCount,
    scorePercentage,
    resultStatus
  };
}

/**
 * Breaks down questions and user answers per topic, calculating correctness percentage.
 */
export function calculateTopicScores(
  questions: Question[],
  answers: Record<string, "a" | "b" | "c" | "d">,
  topicPassingCriteria: number = 60
): TopicScore[] {
  const topicsMap: Record<string, { topicName: string; total: number; correct: number }> = {};

  questions.forEach((q) => {
    const topicId = getTopicIdByName(q.topic);
    const isCorrect = answers[q.questionId]?.toLowerCase() === q.correctAnswer.toLowerCase();

    if (!topicsMap[topicId]) {
      topicsMap[topicId] = {
        topicName: q.topic || "หัวข้อทั่วไป",
        total: 0,
        correct: 0
      };
    }

    topicsMap[topicId].total += 1;
    if (isCorrect) {
      topicsMap[topicId].correct += 1;
    }
  });

  return Object.entries(topicsMap).map(([topicId, item]) => {
    const rawPercentage = item.total > 0 ? (item.correct / item.total) * 100 : 0;
    const scorePercentage = Math.round(rawPercentage * 10) / 10;
    const isPassed = scorePercentage >= topicPassingCriteria;

    return {
      topicId,
      topicName: item.topicName,
      totalQuestions: item.total,
      correctAnswers: item.correct,
      scorePercentage,
      status: isPassed ? "ผ่านเกณฑ์" : "ควรทบทวนเพิ่มเติม"
    };
  });
}

/**
 * Returns names of topics that score below the passing criteria
 */
export function getReviewTopics(
  topicScores: TopicScore[],
  topicPassingCriteria: number = 60
): string[] {
  return topicScores
    .filter((t) => t.scorePercentage < topicPassingCriteria)
    .map((t) => t.topicName);
}

/**
 * Compares post-test score percentage and pre-test score percentage
 */
export function calculateProgress(
  preTestScorePercent: number | null,
  postTestScorePercent: number | null
): number {
  if (preTestScorePercent === null || postTestScorePercent === null) {
    return 0;
  }
  return Math.round((postTestScorePercent - preTestScorePercent) * 10) / 10;
}

/**
 * Builder utility helper for high-fidelity assembly of a detailed attempt payload
 */
export function buildAttemptSummary({
  uid,
  studentId,
  studentName,
  studentEmail,
  section,
  year = "2569",
  quizSetId,
  quizSetTitle,
  quizType,
  attemptNo,
  questions,
  answers,
  settings
}: {
  uid: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  section: string;
  year?: string;
  quizSetId: string;
  quizSetTitle: string;
  quizType: "pre" | "practice" | "post";
  attemptNo: number;
  questions: Question[];
  answers: Record<string, "a" | "b" | "c" | "d">;
  settings: AppSettings;
}) {
  const ratingThrs = settings.passingCriteria ?? 60;
  const result = calculateQuizResult(questions, answers, settings);
  const topicScores = calculateTopicScores(questions, answers, ratingThrs);
  const reviewTopics = getReviewTopics(topicScores, ratingThrs);

  const attemptId = `${uid}_${quizSetId}_${Date.now()}`;

  // Pack structured snapshots of questions for retroactive grading freeze
  const questionSnapshot = questions.map((q) => ({
    questionId: q.questionId,
    topicId: getTopicIdByName(q.topic),
    topicName: q.topic,
    subtopicName: "",
    questionText: q.questionText,
    scenario: q.scenario || "",
    optionA: q.options.a,
    optionB: q.options.b,
    optionC: q.options.c,
    optionD: q.options.d,
    correctOption: q.correctAnswer,
    correctExplanation: q.explanation || "ไม่มีคำอธิบายเพิ่มเติม",
    wrongExplanationA: `พิจารณาตัวเลือก A: ${q.options.a} ซึ่งไม่สอดคล้องกับพญาธิสภาพหรือแผนการรักษาที่เหมาะสมที่สุด`,
    wrongExplanationB: `พิจารณาตัวเลือก B: ${q.options.b} มีความเกี่ยวข้องแต่ยังไม่ใช่กิจกรรมเร่งด่วนหรืออันดับแรก`,
    wrongExplanationC: `พิจารณาตัวเลือก C: ${q.options.c} ทฤษฎียังไม่ระบุว่าเป็นกิจกรรมระดับสูงสุดในขั้นตอนนี้`,
    wrongExplanationD: `พิจารณาตัวเลือก D: ${q.options.d} ยังไม่ใช่วิธีบริหารดูแลหลักสุขภาวะที่เกิดสัมฤทธิผลโดยไว`
  }));

  const answersMapped = questions.map((q) => {
    const selected = answers[q.questionId] || "";
    return {
      questionId: q.questionId,
      topicId: getTopicIdByName(q.topic),
      topicName: q.topic,
      selectedOption: selected,
      correctOption: q.correctAnswer,
      isCorrect: selected.toLowerCase() === q.correctAnswer.toLowerCase()
    };
  });

  return {
    attemptId,
    uid,
    studentId,
    studentName,
    studentEmail,
    section,
    year,
    quizSetId,
    quizSetTitle,
    quizType,
    attemptNo,
    submittedAt: new Date().toISOString(),
    totalQuestions: result.totalQuestions,
    correctAnswers: result.correctAnswers,
    wrongAnswers: result.wrongAnswers,
    scorePercentage: result.scorePercentage,
    passingCriteria: ratingThrs,
    topicPassingCriteria: ratingThrs,
    resultStatus: result.resultStatus,
    reviewTopics,
    topicScores,
    answers: answersMapped,
    questionSnapshot,
    revealPolicy: quizType === "pre" ? "score_only" : "full_reveal",
    createdAt: new Date().toISOString()
  };
}
