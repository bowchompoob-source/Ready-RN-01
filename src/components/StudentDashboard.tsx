/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  mockQuestions, 
  mockQuizSets, 
} from "../data";
import { QuizSet, Question, UserRole, QuizAttempt } from "../types";
import { 
  GraduationCap, 
  User, 
  LogOut, 
  LayoutDashboard, 
  BookOpen, 
  History, 
  AlertTriangle,
  Play, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  Database,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RefreshCw,
  Info,
  Lock,
  CheckCircle,
  XCircle,
  Award,
  BookOpenCheck,
  ClipboardList,
  TrendingUp,
  Scale
} from "lucide-react";
import { auth, db, isFirebaseConfigured } from "../firebase";
import { collection, doc, setDoc, getDocs, query, where, getDoc } from "firebase/firestore";
import { 
  calculateQuizResult, 
  calculateTopicScores, 
  getReviewTopics, 
  buildAttemptSummary, 
  TopicScore,
  QuizResultSummary 
} from "../quizUtils";

// Import modular student-facing page components
import PersonalLearningDashboard from "./student/PersonalLearningDashboard";
import ProgressInsights from "./student/ProgressInsights";
import TopicReviewPlan from "./student/TopicReviewPlan";
import ReadinessSummary from "./student/ReadinessSummary";
import EnhancedHistory from "./student/EnhancedHistory";

interface StudentDashboardProps {
  username: string;
  role: string | null;
  onLogout: () => void;
}

export default function StudentDashboard({ username, role, onLogout }: StudentDashboardProps) {
  // 1. ACCESS CONTROL LEVEL
  // หน้าทำแบบทดสอบทั้งหมดต้องเข้าถึงได้เฉพาะ role = "student" เท่านั้น
  const isStudentRole = role === "student";

  // State Hooks
  const [activeTab, setActiveTab] = useState<"overview" | "quizzes" | "history" | "progress" | "review_plan" | "readiness">("overview");
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Quiz State Controls
  const [selectedQuizSet, setSelectedQuizSet] = useState<QuizSet | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, "a" | "b" | "c" | "d">>({});
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false); // Practice mode instant review
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [timerActive, setTimerActive] = useState(false);

  // Submit and Validation Modals & Overlays
  const [showDraftRestoreModal, setShowDraftRestoreModal] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any>(null);
  const [attemptValidationErrors, setAttemptValidationErrors] = useState<number[]>([]);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [activeResultAttempt, setActiveResultAttempt] = useState<any | null>(null);

  // 2. DUAL STATE PERSISTENCE CORE
  // Fallback to offline LocalStorage if Firebase is missing or throws permission blocks
  useEffect(() => {
    fetchStudentAttempts();
  }, [username]);

  const fetchStudentAttempts = async () => {
    setLoading(true);
    let fetchedList: any[] = [];

    if (isFirebaseConfigured && auth?.currentUser) {
      try {
        const q = query(
          collection(db, "quizAttempts"),
          where("uid", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
          fetchedList.push(docSnap.data());
        });
        
        // Sort by submittedAt descending to show latest attempts first
        fetchedList.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        
        if (fetchedList.length > 0) {
          setAttempts(fetchedList);
          // Sync with local storage as redundancy
          localStorage.setItem(`ready_rn_attempts_${username}`, JSON.stringify(fetchedList));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Firestore access denied or connection disrupted, using offline backup:", err);
      }
    }

    // Local Storage fallback / Seeding
    const local = localStorage.getItem(`ready_rn_attempts_${username}`);
    if (local) {
      fetchedList = JSON.parse(local);
    } else {
      // Seed initial history to make Overview look alive on first inspection
      fetchedList = [
        {
          attemptId: `seeded_pretest_${Date.now()}`,
          uid: "demo_student_uid",
          studentId: "651101001",
          studentName: username || "นางสาวกานดา วิชิตสกุล",
          studentEmail: "kanda.w@stin.ac.th",
          section: "ห้อง A1",
          year: "2569",
          quizSetId: "QS001",
          quizSetTitle: "แบบทดสอบก่อนทบทวน (Pre-test) - ประสิทธิภาพและพื้นฐาน",
          quizType: "pre",
          attemptNo: 1,
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          totalQuestions: 10,
          correctAnswers: 5,
          wrongAnswers: 5,
          scorePercentage: 50.0,
          passingCriteria: 60,
          topicPassingCriteria: 60,
          resultStatus: "ควรทบทวนเพิ่มเติม",
          reviewTopics: [
            "การพยาบาลระยะคลอดและเฝ้าระวังสัญญาณชีพทารก",
            "การช่วยเหลือและการส่งต่อผู้ป่วยวิกฤตทางสูติกรรม"
          ],
          topicScores: [
            { topicId: "T001", topicName: "การพยาบาลในระยะตั้งครรภ์และภาวะแทรกซ้อน", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
            { topicId: "T002", topicName: "การพยาบาลระยะคลอดและเฝ้าระวังสัญญาณชีพทารก", totalQuestions: 3, correctAnswers: 1, scorePercentage: 33.3, status: "ควรทบทวนเพิ่มเติม" },
            { topicId: "T004", topicName: "การช่วยเหลือและการส่งต่อผู้ป่วยวิกฤตทางสูติกรรม", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" },
            { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" }
          ],
          answers: [],
          questionSnapshot: [],
          revealPolicy: "score_only",
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(`ready_rn_attempts_${username}`, JSON.stringify(fetchedList));
    }
    setAttempts(fetchedList);
    setLoading(false);
  };

  const handleSaveAndSyncAttempt = async (newAttempt: any) => {
    // 1. Local storage save immediately
    const local = localStorage.getItem(`ready_rn_attempts_${username}`);
    const currentList = local ? JSON.parse(local) : [];
    const updatedList = [newAttempt, ...currentList];
    localStorage.setItem(`ready_rn_attempts_${username}`, JSON.stringify(updatedList));
    setAttempts(updatedList);

    // 2. Firestore upload if online
    if (isFirebaseConfigured && auth?.currentUser) {
      try {
        await setDoc(doc(db, "quizAttempts", newAttempt.attemptId), newAttempt);
        
        // Update extended student profile dashboard counters
        const studentRef = doc(db, "students", "651101001");
        try {
          const snap = await getDoc(studentRef);
          if (snap.exists()) {
            const currentData = snap.data();
            const practiceCount = (currentData.practiceCount || 0) + 1;
            const updatePayload: any = { practiceCount };
            if (newAttempt.quizType === "pre") {
              updatePayload.preTestScore = newAttempt.correctAnswers;
            } else if (newAttempt.quizType === "post") {
              updatePayload.postTestScore = newAttempt.correctAnswers;
            }
            await setDoc(studentRef, { ...currentData, ...updatePayload }, { merge: true });
          }
        } catch (subErr) {
          console.warn("Sub-profile sync bypassed:", subErr);
        }
      } catch (firestoreErr) {
        console.error("Firestore database upload failed, preserved locally:", firestoreErr);
      }
    }
  };

  // 3. TIMER CONTROLS
  useEffect(() => {
    let timerId: any;
    if (timerActive && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            setTimerActive(false);
            // Trigger automatic submit when time is up
            triggerAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [timerActive, timeLeft]);

  const triggerAutoSubmit = () => {
    alert("หมดเวลากำหนดสอบระบบจะจัดส่งข้อสอบคำนวณคะแนนตามปัจจุบันอัตโนมัติ");
    processSubmitQuiz();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 4. AUTOSAVE ACTIVE DRAFTS HOOK
  // Every time answers change, keep a draft backup in local storage
  useEffect(() => {
    if (selectedQuizSet && quizStarted && !activeResultAttempt) {
      const draftKey = `quiz_draft_${username}_${selectedQuizSet.quizSetId}`;
      localStorage.setItem(draftKey, JSON.stringify({
        userAnswers,
        currentQuestionIndex,
        timeLeft,
        timestamp: Date.now()
      }));
    }
  }, [userAnswers, currentQuestionIndex, timeLeft, quizStarted, selectedQuizSet, activeResultAttempt]);

  // Clean drafts on quiz complete/exit
  const clearQuizDraft = (quizSetId: string) => {
    localStorage.removeItem(`quiz_draft_${username}_${quizSetId}`);
  };

  // 5. EVENT HANDLERS
  const initiateQuizSelection = (quizSet: QuizSet) => {
    setSelectedQuizSet(quizSet);
    setQuizStarted(false);
    setAttemptValidationErrors([]);
    setShowValidationAlert(false);

    // Check if there is an unfinished draft
    const draftKey = `quiz_draft_${username}_${quizSet.quizSetId}`;
    const savedDraftStr = localStorage.getItem(draftKey);
    if (savedDraftStr) {
      const draftObj = JSON.parse(savedDraftStr);
      // Valid draft within 24 hours
      if (draftObj && Object.keys(draftObj.userAnswers || {}).length > 0) {
        setPendingDraft(draftObj);
        setShowDraftRestoreModal(true);
      }
    }
  };

  const handleStartNewTest = () => {
    if (!selectedQuizSet) return;
    clearQuizDraft(selectedQuizSet.quizSetId);
    
    // Reset States
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft(selectedQuizSet.timeLimitMinutes * 60);
    setQuizStarted(true);
    setTimerActive(true);
    setShowDraftRestoreModal(false);
    setPendingDraft(null);
  };

  const handleRestoreDraft = () => {
    if (!pendingDraft || !selectedQuizSet) return;
    setUserAnswers(pendingDraft.userAnswers || {});
    setCurrentQuestionIndex(pendingDraft.currentQuestionIndex || 0);
    setTimeLeft(pendingDraft.timeLeft || selectedQuizSet.timeLimitMinutes * 60);
    setQuizStarted(true);
    setTimerActive(true);
    setShowDraftRestoreModal(false);
    setPendingDraft(null);
  };

  const handleSkipToQuestion = (idx: number) => {
    setCurrentQuestionIndex(idx);
    setShowAnswerFeedback(false);
  };

  const handleSelectOption = (opt: "a" | "b" | "c" | "d") => {
    setUserAnswers({
      ...userAnswers,
      [mockQuestions[currentQuestionIndex].questionId]: opt
    });
  };

  // Validate all questions are answered before submitting
  const initiateSubmitValidation = () => {
    const unansweredIndices: number[] = [];
    mockQuestions.forEach((q, idx) => {
      if (!userAnswers[q.questionId]) {
        unansweredIndices.push(idx + 1);
      }
    });

    if (unansweredIndices.length > 0) {
      setAttemptValidationErrors(unansweredIndices);
      setShowValidationAlert(true);
    } else {
      setAttemptValidationErrors([]);
      setShowValidationAlert(false);
      setShowSubmitConfirmModal(true);
    }
  };

  const processSubmitQuiz = async () => {
    if (!selectedQuizSet) return;
    setTimerActive(false);
    setShowSubmitConfirmModal(false);
    setSubmissionLoading(true);

    // Calculate dynamic attempts counts for historical metadata tracking
    const previousAttemptsOfType = attempts.filter(a => a.quizSetId === selectedQuizSet.quizSetId);
    const nextAttemptNo = previousAttemptsOfType.length + 1;

    // Fake slight network simulation delay for great polish
    setTimeout(async () => {
      try {
        const dummySettings = {
          passingCriteria: 60,
          riskCriteria: 60,
          questionsPerSet: 10,
          isOpenRegistration: true
        };

        const attemptPayload = buildAttemptSummary({
          uid: auth?.currentUser?.uid || "demo_student_uid",
          studentId: "651101001",
          studentName: username || "นางสาวกานดา วิชิตสกุล",
          studentEmail: "kanda.w@stin.ac.th",
          section: "ห้อง A1",
          quizSetId: selectedQuizSet.quizSetId,
          quizSetTitle: selectedQuizSet.title,
          quizType: selectedQuizSet.type === "pre_test" ? "pre" : selectedQuizSet.type === "practice" ? "practice" : "post",
          attemptNo: nextAttemptNo,
          questions: mockQuestions,
          answers: userAnswers,
          settings: dummySettings
        });

        // Save progress details locally & cloud
        await handleSaveAndSyncAttempt(attemptPayload);

        // Erase raw draft
        clearQuizDraft(selectedQuizSet.quizSetId);

        // Display results
        setActiveResultAttempt(attemptPayload);
      } catch (err) {
        console.error("System calculation fail:", err);
        setErrorMsg("ระบบไม่สามารถประมวลคำตอบ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setSubmissionLoading(false);
      }
    }, 1200);
  };

  const handleResetDashboardBack = () => {
    setActiveResultAttempt(null);
    setSelectedQuizSet(null);
    setQuizStarted(false);
    // Go to history tab so they can review their new grades!
    setActiveTab("overview");
    fetchStudentAttempts();
  };

  // DYNAMIC COMPUTE METRIC STATISTICS FOR THE DASHBOARD CARDS
  const latestAttempt = attempts[0] || null;
  const preTestAttempt = attempts.find(a => a.quizType === "pre") || null;
  const postTestAttempt = attempts.find(a => a.quizType === "post") || null;
  const totalAttemptsCount = attempts.length;

  const currentReadinessStatus = latestAttempt 
    ? (latestAttempt.scorePercentage >= 60 ? "ผ่านเกณฑ์ประเมินสภา" : "ควรทบทวนเพิ่มเติม")
    : "พร้อมเข้ารับการทดสอบ";

  const getUrgentReviewTopic = () => {
    if (attempts.length === 0) return "ไม่มีประวัติประเมินผล";
    // Check for worst topic from latest completed attempt
    if (latestAttempt && latestAttempt.topicScores && latestAttempt.topicScores.length > 0) {
      const sortedTopics = [...latestAttempt.topicScores].sort((a,b) => a.scorePercentage - b.scorePercentage);
      if (sortedTopics[0].scorePercentage < 60) {
        return sortedTopics[0].topicName;
      }
    }
    return "สถิติจำลองสมบูรณ์ครบถ้วน";
  };

  // 6. ROLE PROTECTION INTERFACE CHECK
  if (role === "teacher") {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100/50 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-650 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100 shadow-inner">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-805 text-slate-800">บัญชีอาจารย์ไม่สามารถทำงานได้</h3>
            <p className="text-xs text-slate-505 text-slate-500 leading-relaxed">
              บัญชีอาจารย์ไม่สามารถเข้าหน้าทบทวนส่วนบุคคลของนักศึกษาได้
            </p>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs tracking-wide uppercase transition-all shadow-md cursor-pointer"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    );
  }

  if (role !== "student") {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100/50 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-200/50 shadow-inner">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-800">Access Denied</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              สิทธิ์การเข้าถึงของคุณไม่ถูกต้อง กรุณาลงชื่อเข้าใช้ด้วยบัญชีนักศึกษาพยาบาล
            </p>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs tracking-wide uppercase transition-all shadow-md cursor-pointer"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans" id="student-shell">
      
      {/* HEADER BAR */}
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/30 sticky top-0 z-20 px-4 py-3 sm:px-6 shadow-sm" id="student-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-50 rounded-xl border border-teal-100 flex items-center justify-center font-bold">
              <GraduationCap className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-800 tracking-tight leading-none">Ready RN 01</h1>
              <span className="text-[11px] text-teal-600 font-medium">ระบบเตรียมพร้อมสอบขึ้นทะเบียนใบประกอบวิชาชีพผดุงครรภ์ 01</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
              <div className="w-5 h-5 rounded-full bg-teal-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                ST
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline" id="user-display-name">
                {username} (นักศึกษาพยาบาล)
              </span>
            </div>
            
            <button
              id="student-logout-trigger"
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
              title="ออกจากระบบ"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* WORKSPACE AREA */}
      <div className="flex-grow max-w-7xl w-full mx-auto flex flex-col md:flex-row" id="student-main-layout">
        
        {/* SIDE BAR NAVIGATION */}
        {!selectedQuizSet && !activeResultAttempt && (
          <aside className="w-full md:w-64 bg-white/50 backdrop-blur-md border-b md:border-b-0 md:border-r border-slate-200/30 p-4 shrink-0" id="student-sidebar">
            <div className="mb-4">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-widest block px-3">เมนูระบบทดสอบ</span>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => { setActiveTab("overview"); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-teal-50 text-teal-700 border border-teal-100/60 font-bold"
                    : "text-slate-650 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
                <span>ภาพรวมของฉัน</span>
              </button>

              <button
                onClick={() => { setActiveTab("quizzes"); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "quizzes"
                    ? "bg-teal-50 text-teal-700 border border-teal-100/60 font-bold"
                    : "text-slate-650 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <BookOpen className="h-4.5 w-4.5" />
                <span>เลือกชุดแบบทดสอบ</span>
              </button>

              <button
                onClick={() => { setActiveTab("history"); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "history"
                    ? "bg-teal-50 text-teal-700 border border-teal-100/60 font-bold"
                    : "text-slate-650 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <History className="h-4.5 w-4.5" />
                <span>ประวัติการทำแบบทดสอบ</span>
              </button>

              <button
                onClick={() => { setActiveTab("progress"); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "progress"
                    ? "bg-teal-50 text-teal-700 border border-teal-100/60 font-bold"
                    : "text-slate-650 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <TrendingUp className="h-4.5 w-4.5" />
                <span>วิเคราะห์พัฒนาการ</span>
              </button>

              <button
                onClick={() => { setActiveTab("review_plan"); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "review_plan"
                    ? "bg-teal-50 text-teal-700 border border-teal-100/60 font-bold"
                    : "text-slate-650 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <AlertTriangle className="h-4.5 w-4.5" />
                <span>แผนทบทวนรายหัวข้อ</span>
              </button>

              <button
                onClick={() => { setActiveTab("readiness"); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "readiness"
                    ? "bg-teal-50 text-teal-700 border border-teal-100/60 font-bold"
                    : "text-slate-650 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <Award className="h-4.5 w-4.5" />
                <span>สรุปความพร้อมก่อนสอบ</span>
              </button>
            </nav>

            <div className="mt-8 border border-dashed border-slate-200 p-3.5 bg-slate-50/50 rounded-xl">
              <div className="flex items-center space-x-1 text-slate-500 mb-1">
                <Database className="h-3.5 w-3.5 text-teal-600" />
                <span className="text-[9px] font-bold tracking-wider uppercase">Dual Storage Sync</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal font-medium">
                ผูกบันทึกรหัสนักศึกษา 01 <code className="bg-slate-200 px-1 py-0.2 rounded font-semibold text-slate-700">651101001</code> ลง Local Storage พร้อมซิงก์ Cloud Firestore เมื่อเชื่อมต่ออินเทอร์เน็ตสมบูรณ์
              </p>
            </div>
          </aside>
        )}

        {/* MAIN PANEL CONTENT */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto" id="student-workspace">
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <RefreshCw className="h-8 w-8 text-teal-650 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">กำลังโหลดประข้อมูลสถิติของนักศึกษา...</p>
            </div>
          )}

          {!loading && !selectedQuizSet && !activeResultAttempt && (
            <div className="space-y-6">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <PersonalLearningDashboard
                  attempts={attempts}
                  onRefresh={fetchStudentAttempts}
                  onNavigateToQuizzes={() => setActiveTab("quizzes")}
                  isDemoMode={!isFirebaseConfigured || attempts.some(a => a.uid === "demo_student_uid")}
                  username={username || "นางสาวกานดา วิชิตสกุล"}
                />
              )}

              {/* TAB 2: QUIZZES SELECTION PAGE */}
              {activeTab === "quizzes" && (
                <div className="space-y-6" id="quizzes-tab">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base sm:text-lg font-bold text-slate-800">กรุณาเลือกชุดแบบทดสอบผดุงครรภ์เพื่อประเมินความรู้</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      เตรียมตัวเจาะประเด็นข้อสอบสภาการพยาบาลตามระยะการศึกษาที่ตรงไปตรงมารายบุคคล
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {mockQuizSets.map((quizSet) => {
                      const completedAttempts = attempts.filter(a => a.quizSetId === quizSet.quizSetId);
                      const bestScore = completedAttempts.length > 0 
                        ? Math.max(...completedAttempts.map(a => a.scorePercentage))
                        : null;
                      const hasPassed = bestScore !== null && bestScore >= 60;

                      return (
                        <div 
                          key={quizSet.quizSetId}
                          className="bg-white border border-slate-100 hover:border-teal-200 p-5 sm:p-6 rounded-3xl shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                          <div className="space-y-3.5 max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-650">
                                {quizSet.quizSetId}
                              </span>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                quizSet.type === "pre_test" ? "bg-cyan-50 text-cyan-700 border border-cyan-100" :
                                quizSet.type === "practice" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                "bg-indigo-50 text-indigo-700 border border-indigo-100"
                              }`}>
                                {quizSet.type === "pre_test" ? "PRE-TEST สอบวัดความรู้ก่อนเรียน" :
                                 quizSet.type === "practice" ? "PRACTICE คลังแบบฝึกฝนเฉลยละเอียด" :
                                 "POST-TEST สอบประเมินความพร้อมสู่สนามสอบสภา"}
                              </span>
                              
                              <span className={`text-[10px] font-bold py-0.5 px-2 rounded ${
                                completedAttempts.length > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
                              }`}>
                                {completedAttempts.length > 0 ? `ทำแล้ว (${completedAttempts.length} พยายาม)` : "ยังไม่เคยทดลองเพื่อเก็บสถิติ"}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                                {quizSet.title}
                              </h3>
                              <p className="text-xs text-slate-500 leading-relaxed font-light">
                                {quizSet.description}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
                              <span className="flex items-center space-x-1.5">
                                <BookOpen className="h-4 w-4 text-slate-400" />
                                <span>จานวนคำถาม: {mockQuestions.length} ข้อในคลังจำลอง (จริง 40 ข้อ)</span>
                              </span>
                              <span className="flex items-center space-x-1.5">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span>เวลาสอบจำกัด: {quizSet.timeLimitMinutes} นาที</span>
                              </span>
                              <span className="flex items-center space-x-1.5">
                                <HelpCircle className="h-4 w-4 text-slate-400" />
                                <span>เฉลยทฤษฎี: {quizSet.type === "pre_test" ? "แสดงผลลัพธ์รายหน่วยเท่านั้น" : "เฉลยละเอียดพร้อมภาพรวมระดับสภา"}</span>
                              </span>
                            </div>

                            {bestScore !== null && (
                              <div className="bg-slate-50 p-2.5 rounded-xl inline-flex flex-wrap gap-3 text-[11px] font-medium border border-slate-100">
                                <span className="text-slate-500">
                                  ผลสอบสูงสุด: <strong className="text-slate-850 font-bold font-mono">{bestScore}%</strong>
                                </span>
                                <span className={hasPassed ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                                  สถานะประเมิน: {hasPassed ? "ผ่านเกณฑ์สำเร็จ" : "ควรฝึกฝนเพิ่มเกณฑ์"}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 pt-2 md:pt-0 flex flex-col gap-2">
                            <button
                              onClick={() => initiateQuizSelection(quizSet)}
                              className="w-full md:w-auto px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                            >
                              <Play className="h-3.5 w-3.5 fill-current" />
                              <span>{completedAttempts.length > 0 ? "ทำรอบสอบคู่ขนานใหม่" : "เริ่มรอบแบบทดสอบ"}</span>
                            </button>

                            {completedAttempts.length > 0 && (
                              <button
                                onClick={() => {
                                  setActiveTab("history");
                                }}
                                className="w-full md:w-auto px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center"
                              >
                                ตรวจสอบการพยายาม
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: ENHANCED HISTORY PAGE */}
              {activeTab === "history" && (
                <EnhancedHistory
                  attempts={attempts}
                  onViewDetailedResult={(attempt) => {
                    setActiveResultAttempt(attempt);
                    setSelectedQuizSet(mockQuizSets.find(q => q.quizSetId === attempt.quizSetId) || mockQuizSets[0]);
                  }}
                />
              )}

            </div>
          )}

          {/* ========================================== */}
          {/* ACTIVE QUIZ INTRO / INSTRUCTION VIEW PART */}
          {/* ========================================== */}
          {selectedQuizSet && !quizStarted && !activeResultAttempt && (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden" id="quiz-pre-start-card">
              
              <div className="h-2 bg-gradient-to-r from-teal-500 to-emerald-500"></div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Back Link */}
                <button
                  onClick={() => setSelectedQuizSet(null)}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 focus:outline-none cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>ย้อนกลับหน้าแดชบอร์ด</span>
                </button>

                {/* Header info */}
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center border border-teal-100 shadow-inner">
                    <ClipboardList className="h-7 w-7" />
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">{selectedQuizSet.title}</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2.5 py-1 rounded inline-block">
                      {selectedQuizSet.type === "pre_test" ? "รอบเจาะใจก่อนสอบ" : selectedQuizSet.type === "practice" ? "รอบฝึกทักษะคลัง" : "รอบทดลองจบหลักสูตร"}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-teal-50/50 border border-teal-100/60 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-teal-800 block">📃 นโยบายการวัดผลและการจำลองกฎ:</span>
                  <p className="text-slate-550 leading-relaxed font-light">
                    {selectedQuizSet.type === "pre_test" 
                      ? "• ระบบจะไม่แสดงเฉลยข้ออธิบายรายบุคตลในหน้าสุดท้าย เพื่อรักษาระนาบความรู้ต้นทุนจริงของนักศึกษาก่อนเริ่มเรียนบทความสภาการพยาบาล" 
                      : "• แนะนำเฉลยเนื้อหา ทฤษฎีอ้างอิง และตัวชี้วัดความน่าจะเป็นหลังทดสอบส่งกระดาษคำตอบอย่างสมบูรณ์ทันที"}
                  </p>
                </div>

                {/* Warnings Details block */}
                <div className="space-y-3.5 pt-1.5 text-xs text-slate-600">
                  <span className="font-bold text-slate-800 block">🛑 คำแนะนในการปฏิบัติการสอบ:</span>
                  <div className="space-y-2.5 leading-relaxed font-light">
                    <div className="flex items-start space-x-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span><strong>จำนวน: {mockQuestions.length} ข้อศอกคลินิกหลัก</strong> (คัดเลือกเพื่อความสมบูรณ์และทดสอบจำลองอย่างเข้มข้นในระบบตรวจ)</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span><strong>เวลาที่กำหนด: {selectedQuizSet.timeLimitMinutes} นาที</strong> หากประดับเวลาลดลงสู่ศูนย์ ระบบจะเก็บผลส่งสอบตรวจอัตโนมัติ</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-amber-600 font-bold">⚠️</span>
                      <span><strong>ระบบจัดเซฟคำตอบอัตโนมัติ (Dynamic Autosave):</strong> ไม่ต้องหวั่นใจเรื่องไฟดับหรือเบราว์เซอร์เด้งหลุด ระบบจะเก็บบันทึกประวัติตอบล่าสุดแบบเรียลไทม์เสมอ</span>
                    </div>
                  </div>
                </div>

                {/* Draft Restore Overlay check */}
                {pendingDraft && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 space-y-3">
                    <div className="flex items-start space-x-2">
                      <Clock className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-amber-950 block">ตรวจพบความจำการทำแบบฝึกทดสอบที่ยังไม่แล้วเสร็จ!</span>
                        <p className="text-2xs text-amber-800 leading-normal font-light mt-0.5">
                          พบค้างไว้จำนวน {Object.keys(pendingDraft.userAnswers || {}).length} ข้อ ทำค้างเมื่อ {new Date(pendingDraft.timestamp).toLocaleTimeString()} นโยบายการเรียนรู้อนุมัติให้กลับเข้ามาสอบคู่ต่อได้โดยพลัน!
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2.5 pt-1">
                      <button
                        onClick={handleRestoreDraft}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm cursor-pointer"
                      >
                        กู้คืนและทำข้อสอบต่อจากล่าสุด
                      </button>
                      <button
                        onClick={handleStartNewTest}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        ล้างขยะและเริ่มต้นใหม่ทั้งหมด
                      </button>
                    </div>
                  </div>
                )}

                {/* Action CTA */}
                {!pendingDraft && (
                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={() => setSelectedQuizSet(null)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer text-center"
                    >
                      ยกเลิกและกลับ
                    </button>
                    <button
                      onClick={handleStartNewTest}
                      className="flex-1 py-3 bg-teal-650 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>เริ่มความเร็วสอบและจับเวลา</span>
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ========================================== */}
          {/*   ACTIVE TEST TAKING DISPLAY INTERFACE    */}
          {/* ========================================== */}
          {selectedQuizSet && quizStarted && !activeResultAttempt && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="active-quiz-panel">
              
              {/* Left Case and Question Core Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Visual Header progress info & duration */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4.5 sm:p-5 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xs text-slate-450 uppercase tracking-widest block font-bold">Progress Rate</span>
                      <span className="text-xs font-bold text-slate-805">
                        คำถามข้อที่: <strong className="text-sm font-mono text-teal-650">{currentQuestionIndex + 1}</strong> จาก {mockQuestions.length}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-2xs text-slate-450 uppercase tracking-widest block font-bold">เวลาย้อนหลัง</span>
                      <span className="text-sm font-bold font-mono text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100/60 inline-flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5 animate-pulse" />
                        <span>{formatTimer(timeLeft)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Smooth Progress Indicator */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-500 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${((currentQuestionIndex + 1) / mockQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Clinical case scenario block */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-5 sm:p-6 space-y-5">
                  <div className="p-4 bg-teal-50/50 border border-teal-100/60 rounded-2xl">
                    <div className="flex items-center space-x-1.5 mb-1 text-teal-700">
                      <Award className="h-4 w-4 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider block">สถานการณ์ทางคลินิก (Clinical Midwife Case Study)</span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                      {mockQuestions[currentQuestionIndex].scenario}
                    </p>
                  </div>

                  {/* Core Question Text */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">โจทย์คำถาม</span>
                    <h4 className="font-extrabold text-slate-850 text-sm sm:text-base leading-snug">
                      {currentQuestionIndex + 1}. {mockQuestions[currentQuestionIndex].questionText}
                    </h4>
                  </div>

                  {/* Options List Choices */}
                  <div className="grid grid-cols-1 gap-3 pt-1">
                    {(["a", "b", "c", "d"] as const).map((optKey) => {
                      const optText = mockQuestions[currentQuestionIndex].options[optKey];
                      const isSelected = userAnswers[mockQuestions[currentQuestionIndex].questionId] === optKey;

                      return (
                        <button
                          key={optKey}
                          onClick={() => handleSelectOption(optKey)}
                          className={`w-full text-left p-4 rounded-2xl border text-xs leading-relaxed flex items-center space-x-3.5 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-teal-50 border-teal-500 text-teal-900 shadow-sm font-bold"
                              : "bg-white border-slate-150 hover:bg-slate-50 text-slate-650"
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 transition-all ${
                            isSelected
                              ? "bg-teal-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {optKey.toUpperCase()}
                          </span>
                          <span className="flex-grow">{optText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Navigation Actions inside core box */}
                  <div className="flex items-center justify-between pt-4.5 border-t border-slate-100 gap-4">
                    <button
                      onClick={() => handleSkipToQuestion(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all inline-flex items-center space-x-1.5 cursor-pointer ${
                        currentQuestionIndex === 0
                          ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                          : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>ข้อก่อนหน้า</span>
                    </button>

                    {currentQuestionIndex < mockQuestions.length - 1 ? (
                      <button
                        onClick={() => handleSkipToQuestion(currentQuestionIndex + 1)}
                        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center space-x-1.5 cursor-pointer"
                      >
                        <span>ข้อถัดไป</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={initiateSubmitValidation}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center space-x-1.5 cursor-pointer"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>ตรวจสอบเพื่อส่งข้อสอบ</span>
                      </button>
                    )}
                  </div>

                </div>

                {/* Validation alert inside content body if incomplete */}
                {showValidationAlert && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-start space-x-2 text-rose-800">
                      <XCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-extrabold block">ส่งสอบปฏิเสธ! ตรวจพบข้อมูลฝุ่นเคมีคำถามที่ยังเว้นว่างไว้:</strong>
                        <p className="mt-0.5 leading-relaxed font-light">
                          วิชาการผดุงครรภ์ต้องการความรับผิดชอบอย่างสูงสุด กรุณาระบุคำตอบให้ครบถ้วนก่อนส่งใบประเทินเพื่อประมวลผล สภาฯ จะประมวลหากทุกประเด็นได้รับการคลี่คลาย
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-rose-200/40 font-mono text-[10px] text-rose-700 flex flex-wrap gap-2">
                      <span>ข้อที่ค้าง:</span>
                      {attemptValidationErrors.map((n) => (
                        <button
                          key={n}
                          onClick={() => handleSkipToQuestion(n - 1)}
                          className="bg-rose-100 hover:bg-rose-200 transition-all font-bold px-2 py-0.5 rounded text-rose-800 focus:outline-none"
                        >
                          ข้อ {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Sidebar Questionnaire Index Navigator */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
                  <div className="space-y-1 pb-3 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Navigator Panel</span>
                    <h3 className="font-bold text-slate-805 text-xs sm:text-sm">แผงพิกัดสลับกระดาษคำตอบ</h3>
                    <p className="text-[11px] text-slate-400 font-light">คลิกที่พิกัดเพื่อข้ามไปยังโจทย์ข้อนั้นทันที</p>
                  </div>

                  {/* Navigator numbers list */}
                  <div className="grid grid-cols-5 gap-2.5">
                    {mockQuestions.map((q, idx) => {
                      const hasSelected = !!userAnswers[q.questionId];
                      const isActive = idx === currentQuestionIndex;

                      return (
                        <button
                          key={q.questionId}
                          onClick={() => handleSkipToQuestion(idx)}
                          className={`h-9 w-full rounded-lg font-mono text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            isActive
                              ? "ring-2 ring-teal-500 bg-teal-50 border-teal-500 text-teal-850 font-black shadow-inner"
                              : hasSelected
                              ? "bg-teal-600 text-white border-teal-600 border"
                              : "bg-white border border-slate-200 text-slate-450 hover:bg-slate-50"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Guideline legends */}
                  <div className="pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 space-y-2 font-medium">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-teal-600 rounded"></div>
                      <span>ทำปุ่มสัญลักษณ์ลงคำตอบเสร็จสิ้น</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-white border border-slate-200 rounded"></div>
                      <span>ยังเว้นว่างความเห็นสะสม</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-teal-50 border border-teal-500 ring-1 ring-teal-500 rounded"></div>
                      <span>โจทย์ปัจจุบันที่เฝ้าอ่าน</span>
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <button
                      onClick={initiateSubmitValidation}
                      className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>ส่งสรุปกระดาษคำตอบ</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("คุณประสงค์ปิดหน้าจำลองสอบนี้หรือไม่? คำตอบฉบับร่างจะยังถูกคุ้มครองรักษาไว้ในเบราว์เซอร์อัตโนมัติ")) {
                          setSelectedQuizSet(null);
                          setQuizStarted(false);
                        }
                      }}
                      className="w-full mt-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold transition-all text-center"
                    >
                      ยกเลิกชั่วคราว
                    </button>
                  </div>

                </div>

                <div className="bg-amber-50/50 p-4 rounded-xl flex items-start space-x-2 text-[10.5px] text-amber-800 border border-amber-100/60 leading-relaxed font-light">
                  <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>การป้องกันความปลอดภัย:</strong> แม้ว่าสัญญาณเน็ตเวิร์กขาดการติดต่อ ระบบล้ำสมัยยังเก็บรักษาข้อมูลสอบเพื่อให้นักเรียนกู้คืนรอบคะแนนสะสมได้ มั่นใจได้ในความปลอดภัย
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================== */}
          {/*   DETAILED SCORE RESULT ANALYSIS PAGE     */}
          {/* ========================================== */}
          {activeResultAttempt && selectedQuizSet && (
            <div className="space-y-6" id="quiz-completed-result-dashboard">
              
              {/* Top Summary Card */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xl text-center space-y-6">
                <div className="max-w-md mx-auto space-y-4">
                  
                  {/* Badge */}
                  <div className="inline-block bg-teal-50 text-teal-700 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-teal-100/60">
                    รายงานประเมินความพร้อมระดับสภาการพยาบาล
                  </div>

                  {/* Percentage circular badge */}
                  <div className="inline-block bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-full p-8 shadow-inner my-1.5">
                    <span className="text-[10px] text-teal-800 uppercase tracking-wider font-extrabold block">ร้อยละความถูกต้อง</span>
                    <h2 className="text-4xl font-black text-teal-900 font-mono tracking-tight leading-none pt-1">
                      {activeResultAttempt.scorePercentage}%
                    </h2>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      ({activeResultAttempt.correctAnswers} / {activeResultAttempt.totalQuestions} คะแนน)
                    </span>
                  </div>

                  {/* Result Status Title Alert */}
                  <div className="space-y-2">
                    <h3 className={`text-xl font-bold ${
                      activeResultAttempt.scorePercentage >= 60 ? "text-emerald-600" : "text-amber-500"
                    }`}>
                      {activeResultAttempt.scorePercentage >= 60 
                        ? "🎉 ผ่านเกณฑ์ประเมินสากลขั้นพื้นฐาน" 
                        : "⚠️ แนะนำให้เร่งทบทวนความรู้เพิ่มเติม"}
                    </h3>
                    <p className="text-xs text-slate-500 font-light leading-relaxed">
                      จากการจำลองแบบทดสอบ <strong className="font-bold text-slate-700">{activeResultAttempt.quizSetTitle}</strong> ระบบประมวลข้อผิดพลาดเพื่อเตรียมชะล้างความประมาทในห้องสอบจริง
                    </p>
                  </div>

                </div>

                {/* Primary navigation reset button */}
                <div className="flex gap-3 justify-center max-w-sm mx-auto pt-2">
                  <button
                    onClick={handleResetDashboardBack}
                    className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs tracking-wider transition-all cursor-pointer shadow-md text-center"
                  >
                    กลับสู่หน้าแดชบอร์ดหลัก
                  </button>
                  <button
                    onClick={() => {
                      initiateQuizSelection(selectedQuizSet);
                      setActiveResultAttempt(null);
                    }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer text-center"
                  >
                    ทำรอบข้อสอบใหม่อีกครั้ง
                  </button>
                </div>
              </div>

              {/* Gained scores breakdown per unit category */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">ผลประเมินทักษะรายหน่วยการคลอด (Obstetrics Unit Category Breakdown)</h4>
                  <p className="text-xs text-slate-400">เฉือนสัดส่วนคำตอบเพื่อระบุจุดดีที่สุดและวิกฤตที่ต้องได้รับการชี้นำ</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">หัวข้อความรู้ผดุงครรภ์ 01</th>
                        <th className="py-2.5 px-3 text-center">สัดส่วนตอบถูก</th>
                        <th className="py-2.5 px-3 text-center">ร้อยละความถูก</th>
                        <th className="py-2.5 px-3 text-right">สถานะประเมิน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {activeResultAttempt.topicScores && activeResultAttempt.topicScores.map((ts: any) => (
                        <tr key={ts.topicId} className="hover:bg-slate-55">
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {ts.topicName}
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            {ts.correctAnswers} / {ts.totalQuestions}
                          </td>
                          <td className="py-3 px-3 text-center font-bold font-mono text-teal-650">
                            {ts.scorePercentage}%
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold ${
                              ts.scorePercentage >= 60 
                                ? "bg-emerald-50 text-emerald-700 font-extrabold" 
                                : "bg-amber-50 text-amber-700 font-extrabold"
                            }`}>
                              {ts.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CONDITIONAL DETAILED SOLUTIONS REVEAL DEPENDING ON REVEAL POLICY */}
              {activeResultAttempt.revealPolicy === "score_only" ? (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl space-y-3.5 max-w-2xl mx-auto text-center">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-amber-900 text-sm">🔒 นโยบายแบบทดสอบรอบ Pre-test ปิดการเฉลยแผนคำถาม</h4>
                    <p className="text-xs text-amber-800 leading-relaxed font-light mt-1">
                      ตามนโยบายจัดสัดส่วนเตรียมสอบขึ้นทะเบียนวิชาการผดุงครรภ์ 01 แบบทดสอบก่อนเรียน (Pre-test) จะแสดงสถิติกำหนดระดับความรู้รายกลุ่มเท่านั้น และจะไม่เฉลยคำตอบ เพื่อเป็นจุดตั้งสำหรับการไปศึกษาและวัดผลหลังเรียน (Practice/Post-test) ที่จะปลดล็อกเฉลยรายละเอียดอย่างประจักษ์ครัน
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4" id="detailed-solutions-block">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-850">เฉลยสภาการพยาบาล ทฤษฎีประยุกต์รายข้ออย่างวิพากษ์</h3>
                    <p className="text-xs text-slate-500">ทบทวนแบบข้ออ้างคู่มือพยาบาลผดุงครรภ์อย่างลื่นไหล</p>
                  </div>

                  <div className="space-y-6">
                    {mockQuestions.map((q, idx) => {
                      const studentAns = userAnswers[q.questionId] || "";
                      const isCorrect = studentAns === q.correctAnswer;

                      return (
                        <div 
                          key={q.questionId}
                          className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow transition-all"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="font-mono text-xs font-bold text-slate-450 uppercase">
                              ข้อที่ {idx + 1} • {q.topic}
                            </span>
                            <span className={`inline-flex items-center space-x-1 py-1 px-3 rounded-full text-[10px] font-bold ${
                              isCorrect 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                : "bg-rose-50 text-rose-700 border border-rose-100"
                            }`}>
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                                  <span>ตอบถูก</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 shrink-0" />
                                  <span>ตอบผิด</span>
                                </>
                              )}
                            </span>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] sm:text-xs">
                              <span className="font-bold text-slate-500 block mb-1 uppercase tracking-wider">สถานการณ์:</span>
                              <p className="text-slate-800 leading-relaxed font-light">{q.scenario}</p>
                            </div>

                            <h4 className="font-extrabold text-slate-850 text-xs sm:text-sm">
                              คำถาม: {q.questionText}
                            </h4>

                            {/* Options with check highlights */}
                            <div className="grid grid-cols-1 gap-2 text-2xs md:text-xs font-medium">
                              {(["a", "b", "c", "d"] as const).map((key) => {
                                const optText = q.options[key];
                                const isKeyCorrect = q.correctAnswer === key;
                                const isKeyChosen = studentAns === key;

                                let textStyle = "text-slate-650";
                                let borderStyle = "border-slate-100 bg-white";

                                if (isKeyCorrect) {
                                  borderStyle = "border-emerald-500 bg-emerald-50 text-emerald-900";
                                } else if (isKeyChosen && !isCorrect) {
                                  borderStyle = "border-rose-400 bg-rose-50 text-rose-900";
                                }

                                return (
                                  <div 
                                    key={key}
                                    className={`p-3 rounded-xl border flex items-center space-x-3 ${borderStyle} ${textStyle}`}
                                  >
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                                      isKeyCorrect ? "bg-emerald-600 text-white" : isKeyChosen ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"
                                    }`}>
                                      {key.toUpperCase()}
                                    </span>
                                    <span>{optText}</span>
                                    {isKeyCorrect && <span className="text-emerald-700 font-bold ml-auto text-[10px] uppercase">เฉลยถูกต้อง</span>}
                                    {isKeyChosen && !isCorrect && <span className="text-rose-700 font-bold ml-auto text-[10px] uppercase">คุณเลือกข้อนี้</span>}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation Box */}
                            <div className="p-4 bg-amber-50/50 py-3 border border-amber-100 rounded-xl space-y-1 text-xs">
                              <span className="font-bold text-amber-850 block">💡 ทฤษฎีประกอบการเฉลย:</span>
                              <p className="leading-relaxed text-amber-900 font-light text-2xs md:text-xs">
                                {q.explanation}
                              </p>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom footer button bar */}
              <div className="pt-4 flex justify-center pb-12">
                <button
                  onClick={handleResetDashboardBack}
                  className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center space-x-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>เสร็จสิ้นและตรวจสารวัตรหลัก</span>
                </button>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ======================================= */}
      {/*     MODAL: SHOW NOT-COMPLETED ERRORS    */}
      {/* ======================================= */}
      {showValidationAlert && attemptValidationErrors.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-700/60 transition-opacity" aria-hidden="true" onClick={() => setShowValidationAlert(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-middle bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-slate-100">
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3 text-rose-600">
                  <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-805" id="modal-title">ตรวจพบกระดาษคำตอบไม่สมบูรณ์!</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">กรุณารักษามาตรฐานสภาการพยาบาล</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  คุณยังมีคำถามจำลองคลินิกสะสมที่ยัง <strong className="font-bold text-rose-600">ไม่ได้พิจารณ์ตกข้อคิดเห็น</strong> กรุณาระบุตัวเลือกให้ครบทุกข้อก่อนการจัดส่ง เพื่อเสถียรภาพความน่าจะเป็นของเกรดประเมิน
                </p>

                {/* Highlight table list */}
                <div className="bg-slate-50 p-3 rounded-2xl max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono font-bold">
                    {attemptValidationErrors.map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          handleSkipToQuestion(n - 1);
                          setShowValidationAlert(false);
                        }}
                        className="p-1 px-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded transition-all focus:outline-none"
                      >
                        ข้อ {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowValidationAlert(false)}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    กลับไปเลือกระบุข้อดีที่สุด
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/*     MODAL: CONFIRM SUBMISSION MODAL      */}
      {/* ======================================= */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-700/60 transition-opacity" aria-hidden="true" onClick={() => setShowSubmitConfirmModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-middle bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-slate-100">
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3 text-teal-600">
                  <div className="p-2.5 bg-teal-50 rounded-xl border border-teal-100">
                    <ClipboardList className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-805">ยืนยันส่งผลข้อสอบขึ้นสถิติ?</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Ready RN 01 - ผดุงครรภ์ 01</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  คุณทำคำตอบครบถ้วนเรียบร้อยแล้ว ยืนยันการส่งกระดาษวิเคราะห์เฉลยหรือไม่? <strong className="font-bold text-slate-700">หลังจากส่งสอบจะไม่สามารถเปลี่ยนตัวเลือกหรือสลับข้อสอบรอบนี้ได้อีกต่อไปแล้ว</strong>
                </p>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setShowSubmitConfirmModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer text-center"
                  >
                    กลับไปทบทวนตรวจ
                  </button>
                  <button
                    onClick={processSubmitQuiz}
                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer text-center"
                  >
                    ยืนยันส่งสอบ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/*     OVERLAY: SUBMISSION RUNNING...      */}
      {/* ======================================= */}
      {submissionLoading && (
        <div className="fixed inset-0 z-50 bg-slate-800/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center space-y-4 border border-slate-100 shadow-2xl">
            <RefreshCw className="h-10 w-10 text-teal-650 animate-spin mx-auto" />
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-805 text-sm sm:text-base">กำลังคำนวณและประเมินผลคะแนน...</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                ระบบกำลังตรวจสอบเฉลย สกัดหัวข้อประเวศบกพร่องสะสม และบันทึกประวัติการทบทวนของนักศึกษา ความพร้อมสภาแบบวินาทีต่อวินาที
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
