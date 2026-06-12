/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "student" | "teacher";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  studentId?: string; // Only for students
  section?: string;   // Only for students
  createdAt: string;
}

export interface Student {
  studentId: string;
  uid: string;
  displayName: string;
  section: string;
  email: string;
  status: "excellent" | "safe" | "risk";
  preTestScore: number | null;
  postTestScore: number | null;
  practiceCount: number;
}

export interface Question {
  questionId: string;
  topic: string;
  scenario: string; // Clinical Scenario in Thai (สถานการณ์ทางคลินิก)
  questionText: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer: "a" | "b" | "c" | "d";
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  status: "active" | "draft";
}

export interface QuizSet {
  quizSetId: string;
  title: string;
  type: "pre_test" | "practice" | "post_test";
  description: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  status: "ready" | "not_started" | "completed";
}

export interface QuizAttempt {
  attemptId: string;
  uid: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  section: string;
  year: string;
  quizSetId: string;
  quizSetTitle: string;
  quizType: "pre" | "practice" | "post";
  attemptNo: number;
  submittedAt: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  scorePercentage: number;
  passingCriteria: number;
  topicPassingCriteria: number;
  resultStatus: "ผ่านเกณฑ์" | "ควรทบทวนเพิ่มเติม";
  reviewTopics: string[];
  topicScores: {
    topicId: string;
    topicName: string;
    totalQuestions: number;
    correctAnswers: number;
    scorePercentage: number;
    status: "ผ่านเกณฑ์" | "ควรทบทวนเพิ่มเติม";
  }[];
  answers: {
    questionId: string;
    topicId: string;
    topicName: string;
    selectedOption: string;
    correctOption: string;
    isCorrect: boolean;
  }[];
  questionSnapshot: {
    questionId: string;
    topicId: string;
    topicName: string;
    subtopicName: string;
    questionText: string;
    scenario: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
    correctExplanation: string;
    wrongExplanationA: string;
    wrongExplanationB: string;
    wrongExplanationC: string;
    wrongExplanationD: string;
  }[];
  revealPolicy: "score_only" | "full_reveal";
  createdAt: string;
}

export interface QuizAttemptSummary {
  attemptId: string;
  studentId: string;
  studentName: string;
  quizSetId: string;
  quizSetTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  isPassed: boolean;
  topicBreakdown: {
    topic: string;
    correct: number;
    total: number;
  }[];
}


export interface AppSettings {
  passingCriteria: number;     // e.g., 60%
  riskCriteria: number;        // e.g., 60% (Below this is risk)
  questionsPerSet: number;     // e.g., 40 questions
  isOpenRegistration: boolean;  // Student self-register open
}
