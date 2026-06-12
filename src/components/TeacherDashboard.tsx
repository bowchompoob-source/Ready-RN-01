/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { auth, db, isFirebaseConfigured } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { parseCSV, validateStudentCSV, validateQuestionCSV } from "../utils/csvParser";
import { 
  mockStudents, 
  mockQuestions, 
  mockQuizSets, 
  mockSettings 
} from "../data";
import { Student, Question, QuizSet, AppSettings } from "../types";
import { 
  GraduationCap, 
  LogOut, 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  Database, 
  Plus, 
  Edit, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Eye,
  Info,
  Sliders,
  Sparkles,
  Search,
  RefreshCw,
  Download,
  ShieldAlert,
  Calendar,
  X,
  Filter,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronDown,
  Clock,
  Upload,
  FileUp
} from "lucide-react";
import { 
  loadTeacherReportData,
  applyReportFilters,
  buildTeacherOverview,
  buildIndividualScoreReport,
  buildTopicScoreReport,
  buildMostWrongQuestionsReport,
  buildAtRiskStudentsReport,
  exportToCsv,
  formatDate,
  ReportFilters,
  DashboardOverview,
  IndividualScoreRow,
  TopicScoreRow,
  WrongQuestionRow,
  AtRiskRow,
  safePercentage
} from "../reportService";

interface TeacherDashboardProps {
  username: string;
  role: string | null;
  onLogout: () => void;
}

export default function TeacherDashboard({ username, role, onLogout }: TeacherDashboardProps) {
  // --- 1. STRICT ACCESS CONTROL SECURITY GATES ---
  const [authorizedState, setAuthorizedState] = useState<"checking" | "authorized" | "denied_student" | "denied_untrusted">("checking");
  const [verifiedRole, setVerifiedRole] = useState<string | null>(null);

  useEffect(() => {
    async function verifyUserAuthorization() {
      // First, check basic context prop
      if (role === "student") {
        setAuthorizedState("denied_student");
        return;
      }

      // Live Firestore authorization verify
      if (isFirebaseConfigured && auth?.currentUser) {
        try {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const userData = snap.data();
            const actualRole = userData.role;
            setVerifiedRole(actualRole);
            if (actualRole === "teacher") {
              setAuthorizedState("authorized");
            } else if (actualRole === "student") {
              setAuthorizedState("denied_student");
            } else {
              setAuthorizedState("denied_untrusted");
            }
          } else {
            // Document missing, fallback to prop
            if (role === "teacher") {
              setAuthorizedState("authorized");
            } else {
              setAuthorizedState("denied_untrusted");
            }
          }
        } catch (err) {
          console.error("Authorization check failed: ", err);
          // Fallback to prop-based role in case of standard Firestore queries blockages
          if (role === "teacher") {
            setAuthorizedState("authorized");
          } else {
            setAuthorizedState("denied_untrusted");
          }
        }
      } else {
        // Demo Mode / prop fallback
        if (role === "teacher") {
          setAuthorizedState("authorized");
        } else {
          setAuthorizedState("denied_untrusted");
        }
      }
    }
    verifyUserAuthorization();
  }, [role]);

  // --- 2. REPORT STATE MANAGERS ---
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "individual_report" | "topic_report" | "wrong_questions" | "at_risk" | "students" | "questions" | "quizsets" | "settings"
  >("dashboard");

  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: "success" | "warning" | "error" } | null>(null);
  
  // Real Loaded Datasets (Fetched once and aggregated client-side for Spark Plan efficiency)
  const [rawStudents, setRawStudents] = useState<Student[]>([]);
  const [rawAttempts, setRawAttempts] = useState<any[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(mockSettings);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [hasIndexError, setHasIndexError] = useState(false);

  // Filter conditions
  const [rawFilters, setRawFilters] = useState<ReportFilters>({
    section: "all",
    quizType: "all",
    startDate: "",
    endDate: "",
    passingStatus: "all",
    searchKeyword: ""
  });
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>({
    section: "all",
    quizType: "all",
    startDate: "",
    endDate: "",
    passingStatus: "all",
    searchKeyword: ""
  });

  // Detailed Modal triggers
  const [selectedStudentRow, setSelectedStudentRow] = useState<IndividualScoreRow | null>(null);
  const [selectedQuestionRow, setSelectedQuestionRow] = useState<WrongQuestionRow | null>(null);

  // Administrative local states (backwards-compatibility legacy screens context)
  const [localStudentsEditable, setLocalStudentsEditable] = useState<Student[]>([]);
  const [localQuestionsEditable, setLocalQuestionsEditable] = useState<Question[]>([]);
  const [localQuizSetsEditable, setLocalQuizSetsEditable] = useState<QuizSet[]>([]);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  // --- 3. FETCH DATA HANDLERS (SPARKS COMPLIANT) ---
  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    const result = await loadTeacherReportData();
    
    setRawStudents(result.students);
    setRawAttempts(result.attempts);
    setAppSettings(result.settings);
    setIsDemoMode(result.isDemoMode);
    setHasIndexError(!!result.hasIndexError);

    // Sync administrative lists
    setLocalStudentsEditable(result.students);
    setLocalQuestionsEditable(mockQuestions);
    setLocalQuizSetsEditable(mockQuizSets);

    if (result.error) {
      setAlertMsg({ text: result.error, type: "warning" });
    } else if (!silent) {
      setAlertMsg({ text: "อัปเดตข้อมูลสัมฤทธิ์สัมบูรณ์ทางระบบเรียบร้อย", type: "success" });
    }

    if (!silent) setLoading(false);
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  // Filter application triggers
  const handleApplyFilters = () => {
    setAppliedFilters({ ...rawFilters });
    setAlertMsg({ text: "ประยุกต์ใช้ตัวกรองที่เลือกเรียบร้อยแล้ว", type: "success" });
  };

  const handleClearFilters = () => {
    const wiped = {
      section: "all",
      quizType: "all",
      startDate: "",
      endDate: "",
      passingStatus: "all",
      searchKeyword: ""
    };
    setRawFilters(wiped);
    setAppliedFilters(wiped);
    setAlertMsg({ text: "ล้างตัวคัดกรองทั้งหมดกลับสู่ค่าเริ่มต้น", type: "success" });
  };

  // --- 3.5. DRAG & DROP CSV IMPORTERS (REALTIME AND SANDBOX) ---
  const [isStudentDrag, setIsStudentDrag] = useState(false);
  const [isQuestionDrag, setIsQuestionDrag] = useState(false);

  const handleStudentFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        const rows = validateStudentCSV(parsed);
        
        if (isFirebaseConfigured) {
          setLoading(true);
          for (const row of rows) {
            const email_normalized = row.email.toLowerCase().trim();
            // Allowlist schema
            await setDoc(doc(db, "studentsByEmail", email_normalized), {
              studentId: row.studentId,
              displayName: row.displayName,
              email: row.email,
              section: row.section,
              year: "2569"
            });
            // Detailed student state
            await setDoc(doc(db, "students", row.studentId), {
              studentId: row.studentId,
              displayName: row.displayName,
              email: row.email,
              section: row.section,
              status: "safe",
              preTestScore: null,
              postTestScore: null,
              practiceCount: 0
            }, { merge: true });
          }
          setLoading(false);
        }

        const converted = rows.map(r => ({
          studentId: r.studentId,
          displayName: r.displayName,
          section: r.section,
          email: r.email,
          status: "safe" as const,
          preTestScore: null,
          postTestScore: null,
          practiceCount: 0
        }));

        setRawStudents(prev => {
          const dict = [...prev];
          converted.forEach(x => {
            const idx = dict.findIndex(s => s.studentId === x.studentId);
            if (idx >= 0) dict[idx] = x;
            else dict.push(x);
          });
          return dict;
        });

        setLocalStudentsEditable(prev => {
          const dict = [...prev];
          converted.forEach(x => {
            const idx = dict.findIndex(s => s.studentId === x.studentId);
            if (idx >= 0) dict[idx] = x;
            else dict.push(x);
          });
          return dict;
        });

        setAlertMsg({
          text: `นำรายชื่อนักศึกษาผ่าน CSV สำเร็จรวม ${rows.length} คน!`,
          type: "success"
        });
      } catch (err: any) {
        setAlertMsg({
          text: `เกิดข้อผิดพลาดในการโหลดไฟล์ CSV: ${err.message}`,
          type: "error"
        });
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleQuestionFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        const rows = validateQuestionCSV(parsed);

        if (isFirebaseConfigured) {
          setLoading(true);
          for (const row of rows) {
            await setDoc(doc(db, "questions", row.questionId), {
              questionId: row.questionId,
              topic: row.topic,
              scenario: row.scenario,
              questionText: row.questionText,
              optionA: row.optionA,
              optionB: row.optionB,
              optionC: row.optionC,
              optionD: row.optionD,
              correctAnswer: row.correctAnswer,
              explanation: row.explanation,
              difficulty: row.difficulty
            });
          }
          setLoading(false);
        }

        const converted = rows.map(r => ({
          questionId: r.questionId,
          topic: r.topic,
          scenario: r.scenario,
          questionText: r.questionText,
          options: { a: r.optionA, b: r.optionB, c: r.optionC, d: r.optionD },
          correctAnswer: r.correctAnswer,
          explanation: r.explanation,
          difficulty: r.difficulty
        }));

        setLocalQuestionsEditable(prev => {
          const dict = [...prev];
          converted.forEach(x => {
            const idx = dict.findIndex(q => q.questionId === x.questionId);
            if (idx >= 0) dict[idx] = x;
            else dict.push(x);
          });
          return dict;
        });

        setAlertMsg({
          text: `นำเข้าข้อสอบผดุงครรภ์สะสมสำเร็จเรียบร้อยจำนวน ${rows.length} ข้อ!`,
          type: "success"
        });
      } catch (err: any) {
        setAlertMsg({
          text: `ล้มเหลวในการโหลดหัวคอลัมน์คลังข้อสอบ: ${err.message}`,
          type: "error"
        });
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  // --- 4. DATA PRESENTATION PREPARERS ---
  const { students: filteredStudents, attempts: filteredAttempts } = applyReportFilters(
    { students: rawStudents, attempts: rawAttempts },
    appliedFilters
  );

  const overviewKPIs: DashboardOverview = buildTeacherOverview(filteredStudents, filteredAttempts, appSettings);
  const individualReportRecords: IndividualScoreRow[] = buildIndividualScoreReport(filteredStudents, filteredAttempts, appSettings);
  const topicReportRecords: TopicScoreRow[] = buildTopicScoreReport(filteredAttempts, filteredStudents, appSettings);
  const trickyQuestionsRecords: WrongQuestionRow[] = buildMostWrongQuestionsReport(filteredAttempts);
  const atRiskRecords: AtRiskRow[] = buildAtRiskStudentsReport(filteredStudents, filteredAttempts, appSettings);

  // Sort tricky questions by wrong rate descending (default) then total attempts descending.
  const sortedTrickyQuestions = [...trickyQuestionsRecords].sort((a, b) => {
    if (b.wrongRate !== a.wrongRate) return b.wrongRate - a.wrongRate;
    return b.totalAttempts - a.totalAttempts;
  });

  // --- 5. EXPORT UTILITIES HANDLERS ---
  const exportIndividualScoresCsv = () => {
    const headers = [
      "รหัสนักศึกษา", "ชื่อ-นามสกุล", "ห้องเรียน/กลุ่ม", "อีเมล", 
      "คะแนนล่าสุด (%)", "ประเภทแบบทดสอบล่าสุด", "ส่งเมื่อ (ไทย)", "ผลลัพธ์",
      "คะแนน Pre-test ล่าสุด (%)", "คะแนน Post-test ล่าสุด (%)", "คะแนนพัฒนาการ (Progress)",
      "จำนวนครั้งทำข้อสอบรวม", "หัวข้อที่ไม่ผ่านเกณฑ์ล่าสุด"
    ];
    const rows = individualReportRecords.map(r => [
      r.studentId, r.name, r.section, r.email,
      r.latestScore, r.latestQuizType, formatDate(r.latestSubmittedAt), r.latestStatus,
      r.preTestScore !== null ? r.preTestScore : "-", 
      r.postTestScore !== null ? r.postTestScore : "-",
      r.progressScore !== null ? r.progressScore : "-",
      r.totalAttempts, r.weakTopics.join("; ")
    ]);
    exportToCsv("รายงานคะแนนสอบรายบุคคล_ReadyRN.csv", headers, rows);
  };

  const exportTopicScoresCsv = () => {
    const headers = ["หัวข้อวิชาผดุงครรภ์", "จำนวนครั้งที่ถูกทำ", "คะแนนเฉลี่ย (%)", "ร้อยละการสอบผ่านหัวข้อ", "จำนวนเด็กอ่อนเกณฑ์วิกฤต", "สถานการณ์ประเมิน"];
    const rows = topicReportRecords.map(r => [
      r.topicName, r.totalAttemptsIncluded, r.averageTopicScore, r.passRateByTopic, r.numberOfStudentsBelowCriteria, r.trendStatus
    ]);
    exportToCsv("รายงานความรู้สัมฤทธิผลรายหัวข้อ_ReadyRN.csv", headers, rows);
  };

  const exportWrongQuestionsCsv = () => {
    const headers = [
      "รหัสข้อสอบ", "หัวข้อประเด็น", "โจทย์คำถามสำคัญ", "ระดับความเสี่ยงผิดพลาด (%)", 
      "จำนวนครั้งทำรวม", "จำนวนที่ตอบผิด", "ตัวเลือกเฉลยที่ถูกต้อง", "ความยากง่าย", "ระดับสมรรถนะปัญญา"
    ];
    const rows = sortedTrickyQuestions.map(r => [
      r.questionId, r.topicName, r.questionText, r.wrongRate,
      r.totalAttempts, r.wrongAttempts, r.correctOption.toUpperCase(), r.difficulty, r.cognitiveLevel
    ]);
    exportToCsv("รายงานข้อสอบตกเป็นอัตราส่วนวิกฤต_ReadyRN.csv", headers, rows);
  };

  const exportAtRiskCsv = () => {
    const headers = [
      "รหัสนักศึกษา", "ชื่อ-นามสกุล", "ห้องเรียน/กลุ่ม", "อีเมล", 
      "คะแนนดิบล่าสุด (%)", "คะแนน Post-test ล่าสุด (%)", "คะแนนพัฒนาการ", "จำนวนหัวข้ออ่อนสะสม", "สาเหตุหลักแห่งความเสี่ยง", "วันที่ทำล่าสุด"
    ];
    const rows = atRiskRecords.map(r => [
      r.studentId, r.name, r.section, r.email,
      r.latestScore, r.latestPostScore !== null ? r.latestPostScore : "-",
      r.progressScore !== null ? r.progressScore : "-",
      r.weakTopicsCount, r.riskReason, formatDate(r.submittedAt)
    ]);
    exportToCsv("รายชื่อวิเคราะห์นักศึกษากลุ่มเสี่ยงรุนแรง_ReadyRN.csv", headers, rows);
  };

  const exportRawAttemptsCsv = () => {
    const headers = [
      "รหัสทำข้อสอบ", "รหัสนักศึกษา", "ชื่อนักศึกษา", "ห้องเรียน", "ชุดแบบทดสอบ", "ประเภทดึงชุด", 
      "ข้อทำถูก", "กระดาษข้อสอบรวม", "ร้อยละที่ได้", "ระดับสถานภาพ", "วันที่ทำประวัติ"
    ];
    const rows = filteredAttempts.map(a => [
      a.attemptId, a.studentId, a.studentName, a.section, a.quizSetTitle, a.quizType.toUpperCase(),
      a.correctAnswers, a.totalQuestions, a.scorePercentage, a.resultStatus, formatDate(a.submittedAt)
    ]);
    exportToCsv("รายงานผลสอบดิบทั้งหมดในชั้นเรียน_ReadyRN.csv", headers, rows);
  };

  // Safe Settings Form post directly to live Firestore
  const handleSaveAppSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "settings", "app");
        await setDoc(docRef, appSettings);
        setAlertMsg({ text: "บันทึกเกณฑ์คะแนนทดสอบวิชาผดุงครรภ์ไปยัง Firestore เรียบร้อย", type: "success" });
      } catch (err: any) {
        setAlertMsg({ text: `เกิดความผิดพลาดในการเขียนระบบ: ${err?.message || err}`, type: "error" });
      }
    } else {
      localStorage.setItem("ready_rn_appSettings", JSON.stringify(appSettings));
      setAlertMsg({ text: "บันทึกเกณฑ์คะแนนจำลองเข้าสู่ระบบ Demo Local เรียบร้อย", type: "success" });
    }
    setLoading(false);
  };

  // Add dummy/mock student administrative action
  const handleAddSampleStudent = () => {
    const freshId = String(651101000 + localStudentsEditable.length + 1);
    const fresh: Student = {
      studentId: freshId,
      uid: `stu_u_${freshId}`,
      displayName: "นักศึกษาใหม่พยาบาล ทดลองเรียน",
      section: "ห้อง A1",
      email: `${freshId}@stin.ac.th`,
      status: "safe",
      preTestScore: null,
      postTestScore: null,
      practiceCount: 0
    };
    const nextList = [...localStudentsEditable, fresh];
    setLocalStudentsEditable(nextList);
    setRawStudents(nextList);
    setAlertMsg({ text: "เพิ่มข้อมูลนักศึกษารายการจำลองเรียบร้อย", type: "success" });
  };

  // --- ACTION CONTROLS ON SECURITY GATES RENDERERS ---
  if (authorizedState === "checking") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-slate-300 border-t-slate-800 animate-spin mb-4"></div>
        <p className="text-sm font-semibold font-mono text-slate-500">กำลังยืนยันระดับความปลอดภัยของสิทธิ์ผู้ใช้งาน...</p>
      </div>
    );
  }

  if (authorizedState === "denied_student") {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-rose-100 shadow-2xl p-6 text-center space-y-5 animate-scaleUp">
          <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">การเข้าถึงถูกจำกัด (Access Denied)</h2>
            <p className="text-sm text-slate-550 font-semibold text-rose-600 block leading-relaxed px-2">
              “นักศึกษาไม่มีสิทธิ์เข้าถึงรายงานภาพรวมของชั้นเรียน”
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-3 font-medium text-xs text-slate-400">
            <p>ระบบตรวจพบบทบาทนักเรียนในบัญชีของคุณ</p>
            <button
              onClick={onLogout}
              className="py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold font-mono tracking-wide transition-all cursor-pointer"
            >
              กลับสู่การเข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authorizedState === "denied_untrusted") {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-rose-100 shadow-2xl p-6 text-center space-y-5">
          <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100">
            <ShieldAlert className="h-8 w-8 text-rose-600" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">สิทธิ์ไม่น่าเชื่อถือ (Sovereign Block)</h2>
            <p className="text-xs text-rose-650 font-semibold px-4">
              คุณกำลังเข้าสู่ระบบจำลองที่มีบัญชีผู้ใช้ที่ไม่ได้รับสิทธิ์ หรือไม่มีบทบาทของ “อาจารย์ผู้สอน” (role = teacher) ค้นพบทางฐานระบบ
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            กรุณาใช้บัญชีอาจารย์ หรือสลับระบบการสแกน Firestore/users
          </p>
          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2 text-xs">
            <button
              onClick={onLogout}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold"
            >
              ย้อนกลับหน้าเข้าสู่ระบบวิชา
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans relative" id="teacher-shell">
      
      {/* Top Banner Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-250 sticky top-0 z-25 px-4 py-3 sm:px-6 shadow-sm" id="teacher-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-slate-800 text-white rounded-xl flex items-center justify-center font-bold">
              <GraduationCap className="h-5.5 w-5.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-sm sm:text-base text-slate-850 tracking-tight leading-none">Ready RN 01</h1>
                <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold ${isDemoMode ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"}`}>
                  {isDemoMode ? "Demo Mode (จำลอง)" : "Firebase Live (เรียลไทม์)"}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium font-mono block mt-1">ระบบวิเคราะห์ข้อมูลและรายงานการวัดระดับสิทธิ์สำหรับอาจารย์ผู้ควบคุมระบบ</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
              <div className="w-5.5 h-4.5 rounded-full bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center">
                TR
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                {username}
              </span>
            </div>
            
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
              title="ออกจากระบบ"
              id="teacher-logout-btn"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-grow max-w-7xl w-full mx-auto flex flex-col md:flex-row pb-12" id="teacher-main-layout">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white/40 backdrop-blur-md border-b md:border-b-0 md:border-r border-slate-200/50 p-4 shrink-0" id="teacher-sidebar">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-3">เมนูวิเคราะห์และประเมิน</span>
          </div>
          <nav className="space-y-1">
            
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-slate-800 text-white shadow-md border-l-4 border-teal-500"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>แดชบอร์ดสรุปผลภาพรวม</span>
            </button>

            <button
              onClick={() => setActiveTab("individual_report")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "individual_report"
                  ? "bg-slate-800 text-white shadow-md border-l-4 border-teal-500"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>รายงานคะแนนรายบุคคล</span>
            </button>

            <button
              onClick={() => setActiveTab("topic_report")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "topic_report"
                  ? "bg-slate-800 text-white shadow-md border-l-4 border-teal-500"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>ผลสัมฤทธิ์รายหัวข้อ</span>
            </button>

            <button
              onClick={() => setActiveTab("wrong_questions")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "wrong_questions"
                  ? "bg-slate-800 text-white shadow-md border-l-4 border-teal-500"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>ข้อสอบที่ตอบผิดบ่อย</span>
            </button>

            <button
              onClick={() => setActiveTab("at_risk")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "at_risk"
                  ? "bg-slate-800 text-white shadow-md border-l-4 border-teal-500"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>วิเคราะห์นักศึกษากลุ่มเสี่ยง</span>
            </button>

            <div className="pt-4 pb-2 border-t border-slate-100/55 my-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-3">เครื่องมือจัดการวิชา</span>
            </div>

            <button
              onClick={() => setActiveTab("students")}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === "students"
                  ? "bg-slate-100 text-slate-850"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>ทะเบียนรายชื่อทั้งหมด</span>
            </button>

            <button
              onClick={() => setActiveTab("questions")}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === "questions"
                  ? "bg-slate-100 text-slate-850"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>จัดการคลังข้อสอบ</span>
            </button>

            <button
              onClick={() => setActiveTab("quizsets")}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === "quizsets"
                  ? "bg-slate-100 text-slate-850"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>ชุดเฝ้าสอบ (Quiz Sets)</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-slate-100 text-slate-850"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>จัดการเกณฑ์ประเมินคะแนน</span>
            </button>

          </nav>

          {/* Spark Plan Efficiency Note */}
          <div className="mt-8 border border-dashed border-sky-200 p-3 bg-sky-50/50 rounded-2xl space-y-1.5" id="gas-sidebar-note">
            <span className="text-[10px] font-bold text-sky-800 flex items-center space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>SPARK PLAN EFFICIENCY</span>
            </span>
            <p className="text-[10px] text-sky-700/80 leading-relaxed font-medium">
              หลีกเลี่ยงการรวมข้อมูลฝั่งเซิร์ฟเวอร์เพื่อประหยัดจำนวนความถี่อ่าน-เขียน ดึงข้อมูลประวัติสอบแบบครั้งเดียว (One-time fetch / cap 500) และไม่มีตัวคอยเฝ้าจับสังเกตแบบ Realtime-stream
            </p>
          </div>
        </aside>

        {/* Workspace content rendering */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto" id="teacher-workspace">
          
          {/* Global Alert Notification box */}
          {alertMsg && (
            <div 
              className={`p-3.5 mb-6 rounded-2xl border flex items-center justify-between text-xs font-bold leading-normal animate-fadeIn ${
                alertMsg.type === "success" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : alertMsg.type === "warning"
                    ? "bg-amber-50 border-amber-250 text-amber-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
              id="global-alert-toast"
            >
              <div className="flex items-center space-x-2">
                <Info className="h-4.5 w-4.5 shrink-0" />
                <span>{alertMsg.text}</span>
              </div>
              <button onClick={() => setAlertMsg(null)} className="p-1 hover:bg-black/5 rounded-full cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Firestore Index Required Help Overlay */}
          {hasIndexError && (
            <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 mb-6 space-y-3" id="index-error-box">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <span className="text-xs font-extrabold text-amber-800 block">FIRESTORE INDEX REQUIRED (ตรวจพบความล่าช้าในดัชนีจำแนก)</span>
                  <p className="text-11px text-amber-700 mt-1 leading-normal font-semibold">
                    ในการทำแบบทดสอบจริง ดึงอันความสูงต่ำคะแนนเฉลี่ย จำนนวิวัฒนาการ หรือรายการประวัติอาจต้องการ ดัชนีผสม (Composite Index)
                  </p>
                </div>
              </div>
              <div className="bg-white/80 p-3 rounded-2xl border border-amber-250/50 font-mono text-2xs text-slate-650 flex flex-col space-y-1 leading-relaxed">
                <span><strong>Collection</strong>: quizAttempts</span>
                <span><strong>Fields to Index</strong>: submittedAt (Desc)</span>
                <span><strong>URL เพื่อร่วมสถาปัตยกรรม (คลิกเพื่อสร้างทันที)</strong>:</span>
                <span className="text-sky-650 truncate select-all block bg-slate-50 p-1 rounded mt-1 font-bold">
                  https://console.firebase.google.com/project/{isFirebaseConfigured ? db.app.options.projectId : "your-project-id"}/firestore/indexes
                </span>
              </div>
            </div>
          )}

          {/* --- 3. FILTER BOARD PANEL (Present on all Report views) --- */}
          {["dashboard", "individual_report", "topic_report", "wrong_questions", "at_risk"].includes(activeTab) && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-8 space-y-4" id="report-filters-bar">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center space-x-1.5 text-slate-800 font-extrabold text-xs">
                  <Filter className="h-4 w-4 text-slate-550" />
                  <span>ตัวกรองการวิเคราะห์สัมฤทธิผลระดับชั้นเจาะลึก</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 font-bold">
                  ประมวลผล: {filteredAttempts.length} / {rawAttempts.length} รายการทดสอบ
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                
                {/* 1. Section selector */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">กลุ่มห้องเรียน</label>
                  <select
                    value={rawFilters.section}
                    onChange={(e) => setRawFilters({ ...rawFilters, section: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="all">ทั้งหมด (ทุกกลุ่ม)</option>
                    <option value="ห้อง A1">ห้อง A1</option>
                    <option value="ห้อง A2">ห้อง A2</option>
                    <option value="ห้อง B1">ห้อง B1</option>
                    <option value="ห้อง B2">ห้อง B2</option>
                  </select>
                </div>

                {/* 2. Quiz type selector */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">ประเภทการสอบ</label>
                  <select
                    value={rawFilters.quizType}
                    onChange={(e) => setRawFilters({ ...rawFilters, quizType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="all">ทั้งหมด (Pre/Post/Practice)</option>
                    <option value="pre">Pre-test Only</option>
                    <option value="practice">Practice Only</option>
                    <option value="post">Post-test Only</option>
                  </select>
                </div>

                {/* 3. Passing status selector */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">เกณฑ์ตรวจประเมิน</label>
                  <select
                    value={rawFilters.passingStatus}
                    onChange={(e) => setRawFilters({ ...rawFilters, passingStatus: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="all">ผลสัมฤทธิ์ทั้งหมด (All)</option>
                    <option value="ผ่านเกณฑ์">ผ่านเกณฑ์แล้ว</option>
                    <option value="ควรทบทวนเพิ่มเติม">ควรทบทวนเพิ่มเติม (ต่ำกว่าเกณฑ์)</option>
                  </select>
                </div>

                {/* 4. Date Range */}
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">ตั้งแต่วันที่</label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={rawFilters.startDate}
                      onChange={(e) => setRawFilters({ ...rawFilters, startDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 py-1.5 pl-8 pr-2 rounded-xl text-[11px] font-semibold text-slate-650 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 5. Search keyword input */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">ค้นหาข้อมูลผู้สอบ</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="รหัส นศ., ชื่อ หรืออีเมล..."
                      value={rawFilters.searchKeyword}
                      onChange={(e) => setRawFilters({ ...rawFilters, searchKeyword: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 py-1.5 pl-8 pr-3 rounded-xl text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>

              </div>

              {/* Filter controls triggers */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100/55">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleApplyFilters}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 border border-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    ประยุกต์ใช้ตัวกรอง (Apply Filters)
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-750 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    ล้างตัวกรอง (Clear Filters)
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fetchData(false)}
                    disabled={loading}
                    className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                    <span>ดึงข้อมูลล่าสุด (Refresh)</span>
                  </button>

                  <button
                    onClick={exportRawAttemptsCsv}
                    className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="h-3 w-3 text-teal-650" />
                    <span>ส่งออกดิบสะสม (CSV)</span>
                  </button>
                </div>
              </div>

            </div>
          )}


          {/* =========================================================================
              TAB 1: DASHBOARD OVERVIEW 
              ========================================================================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fadeIn" id="tab-dashboard">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">แดชบอร์ดสรุปผลภาพรวมชั้นเรียน</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    แสดงสถานะผลสัมฤทธิ์ภาพรวมเชิงวิเคราะห์ ดัชนีหลัก 10 ตัวชี้วัดสำหรับนักศึกษาพยาบาล
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-400">
                  เกณฑ์ผ่านปกติ: <span className="text-slate-800 font-mono">{appSettings.passingCriteria}%</span>
                </div>
              </div>

              {/* 10 CONFIGURABLE BENCHMARK CARD GRID LAYOUTS */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="kpi-cards-grid">
                
                {/* 1. Total Students */}
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">นักศึกษาทั้งหมด</h3>
                  <div className="mt-2.5">
                    <span className="text-1.5xl sm:text-2.5xl font-black text-slate-850 block font-mono">{overviewKPIs.totalStudents}</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">ในฐาน Student Registry</span>
                  </div>
                </div>

                {/* 2. Attempted Students */}
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">ผู้ทำแบบทดสอบ</h3>
                  <div className="mt-2.5">
                    <span className="text-1.5xl sm:text-2.5xl font-black text-slate-850 block font-mono">{overviewKPIs.attemptedStudents}</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                      {safePercentage(overviewKPIs.attemptedStudents, overviewKPIs.totalStudents)}% จากทะเบียน
                    </span>
                  </div>
                </div>

                {/* 3. Total Attempts */}
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">จำนวนครั้งรวมสะสม</h3>
                  <div className="mt-2.5">
                    <span className="text-1.5xl sm:text-2.5xl font-black text-slate-850 block font-mono">{overviewKPIs.totalAttempts}</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                      เฉลี่ย {overviewKPIs.attemptedStudents > 0 ? (overviewKPIs.totalAttempts / overviewKPIs.attemptedStudents).toFixed(1) : 0} ครั้ง/คน
                    </span>
                  </div>
                </div>

                {/* 4. Average Test Score */}
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">คะแนนเฉลี่ยรวม</h3>
                  <div className="mt-2.5">
                    <span className="text-1.5xl sm:text-2.5xl font-black text-slate-850 block font-mono">
                      {overviewKPIs.averageScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">รวมทุกแบบคลังสอบ</span>
                  </div>
                </div>

                {/* 5. Pre-test Average */}
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">เฉลี่ย Pre-test</h3>
                  <div className="mt-2.5">
                    <span className="text-1.5xl sm:text-2.5xl font-black text-slate-800 block font-mono">
                      {overviewKPIs.averagePreScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">ก่อนการเรียนรู้</span>
                  </div>
                </div>

                {/* 6. Post-test Average */}
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">เฉลี่ย Post-test</h3>
                  <div className="mt-2.5">
                    <span className="text-1.5xl sm:text-2.5xl font-black text-slate-850 block font-mono">
                      {overviewKPIs.averagePostScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">หลังการทบทวน</span>
                  </div>
                </div>

                {/* 7. Progress Score */}
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">ความก้าวหน้าเฉลี่ย</h3>
                  <div className="mt-2.5">
                    <span className="text-1.5xl sm:text-2.5xl font-black text-teal-650 text-teal-600 block font-mono">
                      +{overviewKPIs.averageProgress}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">สัดส่วน Post-Pre</span>
                  </div>
                </div>

                {/* 8. Pass Rate */}
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">ร้อยละสอบผ่านรวม</h3>
                  <div className="mt-2.5">
                    <span className="text-1.5xl sm:text-2.5xl font-black text-teal-600 block font-mono">
                      {overviewKPIs.passRate}%
                    </span>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-teal-500 h-full" style={{ width: `${overviewKPIs.passRate}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* 9. At-risk Count */}
                <div className="bg-white rounded-3xl border border-red-200 p-4 shadow-2xs flex flex-col justify-between bg-red-50/20">
                  <h3 className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest">กลุ่มนักศึกษาเสี่ยง</h3>
                  <div className="mt-2.5">
                    <span className="text-1.5xl sm:text-2.5xl font-black text-rose-600 block font-mono">
                      {overviewKPIs.atRiskCount} คน
                    </span>
                    <span className="text-[10px] text-rose-450 font-bold block mt-0.5">ต้องดูแลใกล้ชิด</span>
                  </div>
                </div>

                {/* 10. Most Common Weak Topic */}
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between md:col-span-1">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">ประเด็นสำคัญต้องทบทวน</h3>
                  <div className="mt-2 text-xs font-bold text-slate-750 line-clamp-2 leading-relaxed">
                    {overviewKPIs.mostCommonReviewTopic}
                  </div>
                </div>

              </div>

              {/* GRAPHICAL AND LIST ANALYTICS MATRICES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left panel: topic score bar charts */}
                <div className="bg-white rounded-3xl border border-slate-250 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800">ผลสัมฤทธิ์เฉลี่ยแต่ละหัวข้อพยาบาล (%)</h3>
                  
                  <div className="space-y-4 pt-2">
                    {topicReportRecords.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">ไม่พบการจัดอันดับหัวข้อ กรุณาส่งสอบสะสมหรือล้างตัวกรอง</p>
                    ) : (
                      topicReportRecords.map((topic, idx) => {
                        const score = topic.averageTopicScore;
                        const pass = score >= appSettings.passingCriteria;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-700 truncate max-w-[280px]">{topic.topicName}</span>
                              <span className={`font-mono font-bold ${pass ? "text-teal-600" : "text-rose-500"}`}>
                                {score}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  score >= 75 
                                    ? "bg-teal-500" 
                                    : pass
                                      ? "bg-emerald-450 bg-emerald-400"
                                      : "bg-amber-500"
                                }`}
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    💡 สีของแถบความรู้สะท้อนถึงระดับสมรรถนะ: เขียวเข้ม (&gt;=75% ดีเยี่ยม), เขียวอ่อน (ผ่านเกณฑ์ปลอดภัย), ส้ม/เหลือง (อ่อนหัดเกณฑ์ต้องพิจารณา)
                  </p>
                </div>

                {/* Right panel: top review priority list */}
                <div className="bg-white rounded-3xl border border-slate-250 p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold text-slate-800">ลำดับข้อสอบผิดทางสถานการณ์วิกฤต</h3>
                    <p className="text-xs text-slate-400">
                      แสดงรายการข้อสอบที่นักศึกษาส่วนใหญ่เลือกตัวเลือกคำเฉลยผิดพลาดบ่อยที่สุด (Wrong Rate สูงสุด) เพื่ออาจารย์ยกนำไปเน้นย้ำในชั่วโมงบรรยาย
                    </p>

                    <div className="divide-y divide-slate-100 pt-1">
                      {sortedTrickyQuestions.slice(0, 4).map((q, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="space-y-1 truncate pr-3">
                            <span className="font-bold text-slate-800 truncate block max-w-[260px]">{q.questionText}</span>
                            <span className="text-[10px] text-slate-400 font-medium block">หัวข้อ: {q.topicName}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-extrabold text-rose-500 block">{q.wrongRate}% ผิดพลาด</span>
                            <span className="text-[10px] text-slate-400 block">ทำรวม {q.totalAttempts} ครั้ง</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("wrong_questions")}
                    className="w-full py-2.5 mt-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    ดูรายละเอียดคลังโจทย์วิคราะห์ตัวเลือกตอบทั้งหมด
                  </button>
                </div>

              </div>

            </div>
          )}


          {/* =========================================================================
              TAB 2: INDIVIDUAL SCORE REPORT
              ========================================================================= */}
          {activeTab === "individual_report" && (
            <div className="space-y-6 animate-fadeIn" id="tab-individual-report">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">รายงานวิเคราะห์คะแนนสอบรายบุคคล</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    ค้นหาและประเมินผลประสิทธิภาพของนักศึกษาพยาบาลรายบุคคล พร้อมดูประวัติลำดับเวลาสอบย้อนหลัง
                  </p>
                </div>
                <button
                  onClick={exportIndividualScoresCsv}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="h-4.5 w-4.5" />
                  <span>ส่งออกรายงานนักศึกษา (CSV)</span>
                </button>
              </div>

              {/* DATA TABLE */}
              <div className="bg-white rounded-3xl border border-slate-250 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-450 border-b border-slate-150 uppercase text-[10px] font-extrabold tracking-wider">
                        <th className="py-3 px-4">รหัสประสิทธิ์</th>
                        <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                        <th className="py-3 px-4">ห้องเรียน</th>
                        <th className="py-3 px-4 text-center">ทำสอบรวม</th>
                        <th className="py-3 px-4 text-center">คะแนนล่าสุด</th>
                        <th className="py-3 px-4">ชนิดล่าสุด</th>
                        <th className="py-3 px-4 text-center">Pre-test</th>
                        <th className="py-3 px-4 text-center">Post-test</th>
                        <th className="py-3 px-4 text-center">Progress</th>
                        <th className="py-3 px-4 text-center">หัวข้อควรรีวิว</th>
                        <th className="py-3 px-4 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-xs">
                      {individualReportRecords.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-8 text-center text-slate-400 font-bold block">
                            ไม่พบคะแนนจัดเก็บนักศึกษาภายใต้ดัชนีคัดเลือก
                          </td>
                        </tr>
                      ) : (
                        individualReportRecords.map((row, idx) => {
                          const status = row.allAttempts.length > 0 ? row.allAttempts[0].resultStatus : null;
                          const progress = row.progressScore;
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-slate-500">{row.studentId}</td>
                              <td className="py-3 px-4 font-bold text-slate-800 text-slate-900">{row.name}</td>
                              <td className="py-3 px-4 text-slate-600 font-semibold">{row.section}</td>
                              <td className="py-3 px-4 text-center font-bold text-slate-700 font-mono">{row.totalAttempts} ครั้ง</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-block px-2.5 py-1 rounded-xl font-bold font-mono text-[11px] ${
                                  row.latestScore >= appSettings.passingCriteria 
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                                    : "bg-rose-50 text-rose-800 border border-rose-200"
                                }`}>
                                  {row.latestScore}%
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-500">{row.latestQuizType}</td>
                              <td className="py-3 px-4 text-center font-mono font-semibold text-slate-600">
                                {row.preTestScore !== null ? `${row.preTestScore}%` : "-"}
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-semibold text-slate-650">
                                {row.postTestScore !== null ? `${row.postTestScore}%` : "-"}
                              </td>
                              <td className="py-3 px-4 text-center font-mono">
                                {progress !== null ? (
                                  <span className={`font-bold ${progress >= 0 ? "text-teal-600" : "text-rose-500"}`}>
                                    {progress >= 0 ? `+${progress}` : progress}%
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center text-rose-600 font-bold font-mono">
                                {row.reviewTopicsCount > 0 ? `${row.reviewTopicsCount} หัวข้อ` : "ปลอดภัย"}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => setSelectedStudentRow(row)}
                                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>วิเคราะห์</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}


          {/* =========================================================================
              TAB 3: TOPIC SUMMARY REPORT
              ========================================================================= */}
          {activeTab === "topic_report" && (
            <div className="space-y-6 animate-fadeIn" id="tab-topic-report">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">รายงานวิเคราะห์ผลสัมฤทธิ์รายหัวข้อ</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    จัดหมวดหมู่สถิติคะแนนวิชาผดุงครรภ์รายประเด็น เพื่อระบุเนื้อหาที่กลุ่มชั้นเรียนผ่านเกณฑ์น้อยที่สุด
                  </p>
                </div>
                <button
                  onClick={exportTopicScoresCsv}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="h-4.5 w-4.5" />
                  <span>ส่งออกคะแนนรายละเอียดหัวข้อ (CSV)</span>
                </button>
              </div>

              {/* TOPIC Performance Grid lists */}
              <div className="bg-white rounded-3xl border border-slate-250 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-450 border-b border-slate-150 uppercase text-[10px] font-extrabold tracking-wider">
                        <th className="py-3.5 px-4 w-[280px]">หัวข้อวิชาและประเด็นเด่น</th>
                        <th className="py-3.5 px-4 text-center">รวมครั้งพิจารณา</th>
                        <th className="py-3.5 px-4 text-center">คะแนนเฉลี่ยระดับห้อง</th>
                        <th className="py-3.5 px-4 text-center">ร้อยละอัตราสอบผ่าน</th>
                        <th className="py-3.5 px-4 text-center">ผู้เรียนอ่อนวิกฤตสะสม</th>
                        <th className="py-3.5 px-4">สถานะวิเคราะห์</th>
                        <th className="py-3.5 px-4">เป้าหมายความปลอดภัย</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-xs font-semibold">
                      {topicReportRecords.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                            ยังไม่มีบันทึกสถิติหัวข้อภายใต้เงื่อนไขประมวล
                          </td>
                        </tr>
                      ) : (
                        topicReportRecords.map((row, idx) => {
                          const isWarning = row.averageTopicScore < appSettings.passingCriteria;
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-slate-850 text-slate-900">{row.topicName}</td>
                              <td className="py-3.5 px-4 text-center font-mono text-slate-650 font-bold">{row.totalAttemptsIncluded} ครั้ง</td>
                              <td className="py-3.5 px-4 text-center font-mono font-extrabold text-slate-800">{row.averageTopicScore}%</td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="space-y-1">
                                  <span className="font-mono font-extrabold text-teal-600 block">{row.passRateByTopic}%</span>
                                  <div className="w-24 bg-slate-100 h-1 rounded-full overflow-hidden mx-auto">
                                    <div className="bg-teal-500 h-full" style={{ width: `${row.passRateByTopic}%` }}></div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-center text-rose-500 font-mono font-extrabold">{row.numberOfStudentsBelowCriteria} คน</td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  row.trendStatus === "ดีเยี่ยม"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-250"
                                    : row.trendStatus === "ปกติ"
                                      ? "bg-sky-50 text-sky-800 border border-sky-150"
                                      : "bg-rose-50 text-rose-800 border border-rose-200"
                                }`}>
                                  {row.trendStatus}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                {isWarning ? (
                                  <span className="text-[10px] text-amber-600 font-bold flex items-center space-x-1">
                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                    <span>ควรเสริมจัดติวพิเศษ</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-teal-650 text-teal-600 font-bold flex items-center space-x-1">
                                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                                    <span>ผ่านเกณฑ์ประเมินสภา</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}


          {/* =========================================================================
              TAB 4: MOST WRONG QUESTIONS
              ========================================================================= */}
          {activeTab === "wrong_questions" && (
            <div className="space-y-6 animate-fadeIn" id="tab-wrong-questions">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">รายงานวิเคราะห์วิกฤตข้อสอบ (Item Analysis)</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    แสดงรายการข้อสอบที่นักศึกษาส่วนใหญ่เลือกคำตอบผิด จัดอันดับตามเปอร์เซ็นต์อัตราการเลือกข้อเฉลยลวงตา
                  </p>
                </div>
                <button
                  onClick={exportWrongQuestionsCsv}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="h-4.5 w-4.5" />
                  <span>ส่งออกคะแนนความถี่ผิดพลาด (CSV)</span>
                </button>
              </div>

              {/* DATA TABLE WRONG RATES */}
              <div className="bg-white rounded-3xl border border-slate-250 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-450 border-b border-slate-150 uppercase text-[10px] font-extrabold tracking-wider">
                        <th className="py-3 px-4">รหัสข้อ</th>
                        <th className="py-3 px-4">หัวข้อวิชา</th>
                        <th className="py-3 px-4 w-[380px]">เนื้อหาโจทย์ข้อสอบภาพจำลองเชิงคลินิก</th>
                        <th className="py-3 px-4 text-center">ความยาก</th>
                        <th className="py-3 px-4 text-center w-[120px]">ผิดรวมสะสม</th>
                        <th className="py-3 px-4 text-center w-[120px]">ร้อยละผิดพลาด</th>
                        <th className="py-3 px-4 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-xs">
                      {sortedTrickyQuestions.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-500">{row.questionId}</td>
                          <td className="py-3 px-4 font-bold text-slate-600">{row.topicName}</td>
                          <td className="py-3 px-4 pr-6 leading-relaxed">
                            <span className="font-bold text-slate-850 text-slate-900 block">{row.shortQuestionText}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ระดับปัญญา: {row.cognitiveLevel}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              row.difficulty === "ยากมาก"
                                ? "bg-rose-50 text-rose-800 border border-rose-150"
                                : row.difficulty === "ปานกลาง"
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : "bg-sky-50 text-sky-800 border border-sky-150"
                            }`}>
                              {row.difficulty}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-650">
                            {row.wrongAttempts} / {row.totalAttempts} ครั้ง
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2 py-1 rounded-xl font-black font-mono text-[11px] ${
                              row.wrongRate >= 50 
                                ? "bg-rose-50 text-rose-800 border border-rose-200" 
                                : "bg-slate-50 text-slate-850"
                            }`}>
                              {row.wrongRate}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedQuestionRow(row)}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>เลือกดู</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}


          {/* =========================================================================
              TAB 5: AT-RISK CANDIDATES DIRECTORY
              ========================================================================= */}
          {activeTab === "at_risk" && (
            <div className="space-y-6 animate-fadeIn" id="tab-at-risk">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">ทำเนียบวิเคราะห์นักศึกษากลุ่มเสี่ยงรุนแรง</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    รายชื่อผู้เรียนพยาบาลที่มีระดับประสิทธิภาพคะแนนสอบตกต่ำกว่าเกณฑ์อันตรายวิกฤตที่ได้ตั้งไว้ หรือจำเป็นต้องส่งเสริมตัวความรู้เพิ่มเติม
                  </p>
                </div>
                <button
                  onClick={exportAtRiskCsv}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="h-4.5 w-4.5" />
                  <span>ส่งออกทำเนียบกลุ่มเสี่ยง (CSV)</span>
                </button>
              </div>

              {/* Data Safety Note Disclosures (PDPA Compliancy) */}
              <div className="bg-amber-50/50 border border-amber-300 rounded-3xl p-4 text-xs font-bold text-amber-900 space-y-1">
                <div className="flex items-center space-x-1 text-[11px] text-amber-800 font-extrabold">
                  <ShieldAlert className="h-4.5 w-4.5 text-amber-600" />
                  <span>กฎกระทรวงและข้อบังคับความเป็นส่วนตัวระดับนโยบาย (PDPA DISCLOSURE & DATA PRIVACY SAFETY NOTE)</span>
                </div>
                <p className="text-[10px] text-amber-700/80 leading-normal font-medium pl-6">
                  ข้อมูลคะแนนทดสอบเหล่านี้เป็นเอกสารสิทธิ์ภายใน มหาวิทยาลัย เพื่อใช้วัดระดับศึกษาธิการผู้เรียนเท่านั้น อาจารย์ผู้ลากข้อมูลต้องหลีกเลี่ยงการเผยแพร่ภายนอก ตรวจสอบตัวไฟล์ หรือส่งผ่านห้องแชทที่ไม่ปลอดภัยเพื่อหลีกเลี่ยงการถูกล่วงละเมิดสิทธิ์พื้นฐานของผู้เรียนพยาบาล
                </p>
              </div>

              {/* AT-RISK MEMBERS */}
              <div className="bg-white rounded-3xl border border-rose-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-rose-50/50 text-rose-900 border-b border-rose-100 uppercase text-[10px] font-extrabold tracking-wider">
                        <th className="py-3 px-4">รหัสนักศึกษา</th>
                        <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                        <th className="py-3 px-4">ห้องเรียน</th>
                        <th className="py-3 px-4">อีเมลติดต่อ</th>
                        <th className="py-3 px-4 text-center ">คะแนนดิบล่าสุด</th>
                        <th className="py-3 px-4 text-center">Post-test ล่าสุด</th>
                        <th className="py-3 px-4 text-center w-[200px]">สาเหตุความเสี่ยง</th>
                        <th className="py-3 px-4 text-center">วันที่สอบล่าสุด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50 text-xs">
                      {atRiskRecords.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-450 font-bold block">
                            🎉 ยอดเยี่ยม! ไม่พบนร. อ่อนที่ตกอยู่ในสเปกตรัมเกณฑ์ความเสี่ยงวิกฤตภายใต้เงื่อนไขปัจจุบัน
                          </td>
                        </tr>
                      ) : (
                        atRiskRecords.map((row, idx) => (
                          <tr key={idx} className="hover:bg-rose-50/10 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-rose-800">{row.studentId}</td>
                            <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                            <td className="py-3 px-4 text-slate-600 font-semibold">{row.section}</td>
                            <td className="py-3 px-4 font-mono text-slate-500 font-semibold">{row.email}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-block px-2.5 py-1 bg-rose-100 text-rose-800 font-extrabold font-mono rounded-xl">
                                {row.latestScore}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-slate-600">
                              {row.latestPostScore !== null ? `${row.latestPostScore}%` : "-"}
                            </td>
                            <td className="py-3 px-4 text-rose-650 pr-4 leading-normal font-semibold max-w-[2400px]">
                              {row.riskReason}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-500 font-semibold">{formatDate(row.submittedAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}


          {/* =========================================================================
              TAB: STUDENTS (LEGACY REGISTRY & SEEDING)
              ========================================================================= */}
          {activeTab === "students" && (
            <div className="space-y-6 animate-fadeIn" id="tab-legacy-students">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">จัดการทะเบียนรายชื่อนักศึกษา</h2>
                  <p className="text-xs text-slate-500">จัดการ เพิ่ม และตรวจสอบประวัติสถานะสิทธิ์ของผู้เข้าเรียนพยาบาล</p>
                </div>
                <button
                  onClick={handleAddSampleStudent}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>เพิ่มตัวอย่างนักศึกษา</span>
                </button>
              </div>

              {/* CSV IMPORTER DRAG & DROP PLACEMENT */}
              <div 
                className={`border-2 border-dashed rounded-3xl p-6 transition-all text-center flex flex-col items-center justify-center space-y-3 ${
                  isStudentDrag 
                    ? "border-teal-500 bg-teal-50/40" 
                    : "border-slate-200 bg-white/45 hover:border-slate-300 hover:bg-white/60"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsStudentDrag(true);
                }}
                onDragLeave={() => setIsStudentDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsStudentDrag(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleStudentFile(file);
                }}
              >
                <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl border border-teal-100">
                  <FileUp className="h-6 w-6" />
                </div>
                <div className="max-w-md space-y-1">
                  <p className="text-xs font-bold text-slate-800 animate-pulse">
                    นำเข้ารายชื่อนักศึกษาเพื่อประกาศสิทธิ์เข้าใช้งานระบบ (CSV Engine)
                  </p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    ลากและวางไฟล์ CSV ของคุณที่นี่ หรือ{" "}
                    <label className="text-teal-600 hover:text-teal-700 font-semibold underline cursor-pointer">
                      ค้นหาและเลือกไฟล์จากเครื่อง
                      <input 
                        type="file" 
                        accept=".csv" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleStudentFile(file);
                        }}
                      />
                    </label>
                  </p>
                </div>
                <div className="text-[10px] bg-slate-100 text-slate-600 py-1.5 px-3.5 rounded-full font-medium font-mono text-center">
                  บังคับหัวคอลัมน์: studentId, displayName, email, section (รองรับ UTF-8 BOM จาก Excel)
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-150">
                      <th className="p-3">รหัสนักศึกษา</th>
                      <th className="p-3">ชื่อสตรีพยาบาล</th>
                      <th className="p-3">จำแนกห้อง</th>
                      <th className="p-3">อีเมลกลาง</th>
                      <th className="p-3 text-center">สถิติจักระคู่ Pre/Post</th>
                      <th className="p-3 text-center">สถานภาพสิทธิ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localStudentsEditable.map((s, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-500">{s.studentId}</td>
                        <td className="p-3 font-bold text-slate-800">{s.displayName}</td>
                        <td className="p-3 font-semibold text-slate-600">{s.section}</td>
                        <td className="p-3 font-mono text-slate-500">{s.email}</td>
                        <td className="p-3 text-center font-semibold font-mono">
                          Pre: {s.preTestScore !== null ? `${s.preTestScore}/40` : "-"} | Post: {s.postTestScore !== null ? `${s.postTestScore}/40` : "-"}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === "excellent"
                              ? "bg-emerald-100 text-emerald-800"
                              : s.status === "safe"
                                ? "bg-sky-100 text-sky-850"
                                : "bg-rose-100 text-rose-800"
                          }`}>
                            {s.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* =========================================================================
              TAB: QUESTIONS (LEGACY LIST)
              ========================================================================= */}
          {activeTab === "questions" && (
            <div className="space-y-6 animate-fadeIn" id="tab-legacy-questions">
              <div className="border-b pb-4">
                <h2 className="text-lg font-bold text-slate-800">คลังข้อสอบวิชาผดุงครรภ์สะสม</h2>
                <p className="text-xs text-slate-500">ตรวจสอบโจทย์คำถามพร้อมเฉลยในคำวินิจฉัย</p>
              </div>

              {/* CSV QUESTIONS IMPORTER DRAG & DROP PLACEMENT */}
              <div 
                className={`border-2 border-dashed rounded-3xl p-6 transition-all text-center flex flex-col items-center justify-center space-y-3 ${
                  isQuestionDrag 
                    ? "border-emerald-500 bg-emerald-50/40" 
                    : "border-slate-200 bg-white/45 hover:border-slate-300 hover:bg-white/60"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsQuestionDrag(true);
                }}
                onDragLeave={() => setIsQuestionDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsQuestionDrag(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleQuestionFile(file);
                }}
              >
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                  <Database className="h-6 w-6" />
                </div>
                <div className="max-w-md space-y-1">
                  <p className="text-xs font-bold text-slate-800 animate-pulse">
                    นำเข้าข้อสอบผดุงครรภ์ปริมาณมาก (Questions CSV Importer)
                  </p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    ลากและวางไฟล์ CSV ของคุณที่นี่ หรือ{" "}
                    <label className="text-emerald-600 hover:text-emerald-700 font-semibold underline cursor-pointer">
                      ค้นหาและเลือกไฟล์จากเครื่อง
                      <input 
                        type="file" 
                        accept=".csv" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleQuestionFile(file);
                        }}
                      />
                    </label>
                  </p>
                </div>
                <div className="text-[10px] bg-slate-100 text-slate-600 py-1.5 px-3.5 rounded-full font-medium font-mono text-center leading-normal">
                  บังคับหัวแถว: questionId, topic, scenario, questionText, optionA, optionB, optionC, optionD, correctAnswer, explanation, difficulty
                </div>
              </div>

              <div className="space-y-4">
                {localQuestionsEditable.map((q, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] font-bold text-teal-650 text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100 uppercase">
                          {q.questionId} : {q.topic}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-850 pt-1 leading-relaxed">{q.scenario}</h4>
                      </div>
                      <span className="text-[10px] bg-slate-50 border px-2 py-0.5 rounded-full font-bold font-mono uppercase text-slate-500">
                        {q.difficulty}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-650 pl-2 border-l-2 border-slate-300">
                      คำถาม: {q.questionText}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className={`p-2 rounded-xl border ${q.correctAnswer === "a" ? "bg-emerald-50 border-emerald-250 font-bold text-emerald-900" : "bg-slate-50 text-slate-600 border-slate-150"}`}>
                        ก. {q.options.a}
                      </div>
                      <div className={`p-2 rounded-xl border ${q.correctAnswer === "b" ? "bg-emerald-50 border-emerald-250 font-bold text-emerald-900" : "bg-slate-50 text-slate-600 border-slate-150"}`}>
                        ข. {q.options.b}
                      </div>
                      <div className={`p-2 rounded-xl border ${q.correctAnswer === "c" ? "bg-emerald-50 border-emerald-250 font-bold text-emerald-900" : "bg-slate-50 text-slate-600 border-slate-150"}`}>
                        ค. {q.options.c}
                      </div>
                      <div className={`p-2 rounded-xl border ${q.correctAnswer === "d" ? "bg-emerald-50 border-emerald-250 font-bold text-emerald-900" : "bg-slate-50 text-slate-600 border-slate-150"}`}>
                        ง. {q.options.d}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border text-[11px] text-slate-500 leading-normal">
                      <strong className="text-emerald-800">เฉลยและทฤษฎีอ้างอิง:</strong> {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* =========================================================================
              TAB: QUIZ SETS (LEGACY)
              ========================================================================= */}
          {activeTab === "quizsets" && (
            <div className="space-y-6 animate-fadeIn" id="tab-legacy-quizsets">
              <div className="border-b pb-4">
                <h2 className="text-lg font-bold text-slate-800">จัดการชุดแบบทดสอบผดุงครรภ์</h2>
                <p className="text-xs text-slate-500">สถานะเปิดทำการสอบสำหรับห้องเรียน</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {localQuizSetsEditable.map((qs, idx) => (
                  <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-slate-100 border font-mono font-bold text-slate-500 uppercase px-2 py-0.5 rounded">
                          {qs.quizSetId}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          qs.status === "completed" 
                            ? "bg-slate-100 text-slate-600 border" 
                            : qs.status === "ready" 
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}>
                          {qs.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-850 leading-snug">{qs.title}</h4>
                      <p className="text-2xs text-slate-400 font-medium leading-relaxed">{qs.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-mono text-[10px] text-slate-500">
                      <span>ข้อบังคับ: {qs.totalQuestions} ข้อ</span>
                      <span>เวลา: {qs.timeLimitMinutes} นาที</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* =========================================================================
              TAB 6: CRITERIA THRESHOLD SETTINGS (CONFIG)
              ========================================================================= */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fadeIn" id="tab-settings">
              
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-lg font-bold text-slate-800">ตั้งค่าเกณฑ์ประเมินระดับชั้น (AppSettings)</h2>
                <p className="text-xs text-slate-500 mt-1">
                  ปรับปรุงเกณฑ์คัดกรอง เปอร์เซ็นต์ประเมินผ่านใบประกอบสภา เพื่อเชื่อมพารามิเตอร์ตรงไปยังหน้าผู้เรียนและแผงแดชบอร์ด
                </p>
              </div>

              {/* Saved success banner */}
              {isSavedAlert && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-emerald-800 font-bold text-xs flex items-center space-x-2 animate-fadeIn mb-4">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                  <span>เกณฑ์บันทึกสู่หน่วยเก็บความจำสมบูรณ์</span>
                </div>
              )}

              {/* Active Criteria Setting Form */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 max-w-2xl">
                <form onSubmit={handleSaveAppSettings} className="space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        เกณฑ์คะแนนสอบผ่านครรภ์พยาบาล (%)
                      </label>
                      <input
                        type="number"
                        min="20"
                        max="100"
                        value={appSettings.passingCriteria}
                        onChange={(e) => setAppSettings({ ...appSettings, passingCriteria: parseInt(e.target.value) || 60 })}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        เกณฑ์ช่วงจำแนกสตรีกลุ่มเสี่ยง (%)
                      </label>
                      <input
                        type="number"
                        min="20"
                        max="100"
                        value={appSettings.riskCriteria}
                        onChange={(e) => setAppSettings({ ...appSettings, riskCriteria: parseInt(e.target.value) || 60 })}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        จำนวนข้อสอบต่อชุดแบบมาตรฐาน
                      </label>
                      <input
                        type="number"
                        value={appSettings.questionsPerSet}
                        onChange={(e) => setAppSettings({ ...appSettings, questionsPerSet: parseInt(e.target.value) || 40 })}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-500 font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        สิทธิ์นักศึกษาทำลงทะเบียนเข้าสอบด้วยตนเอง
                      </label>
                      <select
                        value={appSettings.isOpenRegistration ? "open" : "close"}
                        onChange={(e) => setAppSettings({ ...appSettings, isOpenRegistration: e.target.value === "open" })}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-500 font-bold"
                      >
                        <option value="open">เปิดลงทะเบียนสิทธิ์อิสระ (Open)</option>
                        <option value="close">จำกัดคู่ขนานสิทธิ์ (Restricted)</option>
                      </select>
                    </div>

                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-5 py-3 bg-slate-800 hover:bg-slate-900 border border-slate-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer inline-flex items-center space-x-1"
                    >
                      <Settings className="h-4.5 w-4.5" />
                      <span>บันทึกเกณฑ์ทดสอบวิชิตผดุงครรภ์</span>
                    </button>
                  </div>

                </form>
              </div>

            </div>
          )}

        </main>
      </div>


      {/* =========================================================================
          MODALS & DETAILS INTERFACES 
          ========================================================================= */}

      {/* MODAL 1: INDIVIDUAL Student Detailed Drilldown Analyzer */}
      {selectedStudentRow && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="student-modal">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center font-bold font-mono text-xs text-slate-700 border">
                  นศ.
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedStudentRow.name}</h3>
                  <span className="text-2xs font-bold text-slate-400 font-mono">ID: {selectedStudentRow.studentId} | {selectedStudentRow.email}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudentRow(null)} 
                className="p-1.5 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-450" />
              </button>
            </div>

            {/* Modal Content Structure */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Profile statistics panel */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">สรุปการสอบและคุณภาพงาน</span>
                
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">ห้องจดทะเบียน:</span>
                    <span className="font-bold text-slate-800">{selectedStudentRow.section}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">ครั้งที่ลงมือสอบเฉลี่ย:</span>
                    <span className="font-bold text-slate-800 font-mono">{selectedStudentRow.totalAttempts} ครั้ง</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">ระดับคะแนน Pre-test ล่าสุด:</span>
                    <span className="font-bold text-slate-800 font-mono">{selectedStudentRow.preTestScore !== null ? `${selectedStudentRow.preTestScore}%` : "ไม่มีสอบ"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">ระดับคะแนน Post-test ล่าสุด:</span>
                    <span className="font-bold text-slate-800 font-mono">{selectedStudentRow.postTestScore !== null ? `${selectedStudentRow.postTestScore}%` : "ไม่มีสอบ"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">ความล้ำหน้าด้านการพัฒนา:</span>
                    {selectedStudentRow.progressScore !== null ? (
                      <span className={`font-mono font-black ${selectedStudentRow.progressScore >= 0 ? "text-teal-600" : "text-rose-500"}`}>
                        {selectedStudentRow.progressScore >= 0 ? `+${selectedStudentRow.progressScore}%` : `${selectedStudentRow.progressScore}%`}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-semibold">ไม่มีดัชนี</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 font-medium">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">หัวข้อที่สมควรแนะให้รีวิว</span>
                  {selectedStudentRow.weakTopics.length === 0 ? (
                    <span className="text-2xs bg-emerald-50 border border-emerald-250 text-emerald-800 font-bold px-2.5 py-1 rounded-xl block text-center">
                      ✓ ยอดเยี่ยม ผ่านระดับเกณฑ์ทุกหัวข้อ
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {selectedStudentRow.weakTopics.map((topic, index) => (
                        <span key={index} className="text-[10px] bg-rose-50 border border-rose-150 text-rose-800 font-bold px-2 py-0.5 rounded-full inline-block">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right lists: all attempts timeline tracker */}
              <div className="md:col-span-2 space-y-4">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">ไทม์ไลน์และประวัติการสอบโดยสังเขป</span>
                
                <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto border border-slate-150 rounded-2xl p-3 space-y-2">
                  {selectedStudentRow.allAttempts.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6 font-bold">ไม่พบประวัติการจดทำแบบทดสอบ</p>
                  ) : (
                    selectedStudentRow.allAttempts.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-800 block">
                            {item.quizSetTitle}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            ส่งกระดาษคำตอบเมื่อ: {formatDate(item.createdAt || item.submittedAt)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded font-extrabold font-mono inline-block ${
                            item.scorePercentage >= appSettings.passingCriteria 
                              ? "bg-teal-50 text-teal-800 border" 
                              : "bg-rose-50 text-rose-800 border"
                          }`}>
                            {item.scorePercentage}%
                          </span>
                          <span className="text-2xs text-slate-400 block mt-1">ถูก {item.correctAnswers} / {item.totalQuestions} ข้อ</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <div className="pt-2 flex justify-end border-t">
              <button 
                onClick={() => setSelectedStudentRow(null)} 
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                ปิดหน้าตรวจวิเคราะห์
              </button>
            </div>

          </div>
        </div>
      )}


      {/* MODAL 2: ITEM Drilling Analyzer Modal ( Tricky choices detailed) */}
      {selectedQuestionRow && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="question-modal">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-2xs font-black bg-rose-50 border border-rose-150 text-rose-800 px-2 py-0.5 rounded">
                  {selectedQuestionRow.questionId}
                </span>
                <span className="text-xs font-extrabold text-slate-500">หัวข้อ: {selectedQuestionRow.topicName}</span>
              </div>
              <button 
                onClick={() => setSelectedQuestionRow(null)} 
                className="p-1.5 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-450" />
              </button>
            </div>

            {/* Content description */}
            <div className="space-y-4 text-xs font-medium leading-relaxed">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">สถานการณ์คลินิกจำลอง:</span>
                <p className="font-bold text-slate-850 text-slate-900 leading-normal">{selectedQuestionRow.scenario}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">คำโจทย์วิจัยการพยาบาล:</span>
                <p className="text-slate-800 font-extrabold pl-2 border-l-2 border-rose-300">{selectedQuestionRow.questionText}</p>
              </div>

              {/* Live Answer selection distribution */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  สถิติตัวเลือกและการกระจายคำตอบ (Option Choice Distributions)
                </span>
                
                <div className="space-y-2.5">
                  {[
                    { key: "a", label: "ก.", text: selectedQuestionRow.options.a },
                    { key: "b", label: "ข.", text: selectedQuestionRow.options.b },
                    { key: "c", label: "ค.", text: selectedQuestionRow.options.c },
                    { key: "d", label: "ง.", text: selectedQuestionRow.options.d }
                  ].map((option, idx) => {
                    const isCorrect = selectedQuestionRow.correctOption.toLowerCase() === option.key;
                    const percent = selectedQuestionRow.optionDistribution[option.key as "a" | "b" | "c" | "d"] || 0;
                    return (
                      <div key={idx} className={`p-3 rounded-2xl border text-xs flex flex-col space-y-1.5 ${isCorrect ? "bg-emerald-50/70 border-emerald-250" : "bg-slate-50/50 border-slate-150"}`}>
                        <div className="flex items-center justify-between font-bold">
                          <span className={isCorrect ? "text-emerald-900" : "text-slate-705 text-slate-700"}>{option.label} {option.text}</span>
                          <span className={isCorrect ? "text-emerald-700 font-bold" : "text-slate-500"}>
                            {percent}% {isCorrect && " (เฉลยที่ถูกต้อง)"}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${isCorrect ? "bg-emerald-500" : "bg-slate-400"}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Text explanations */}
              <div className="bg-sky-50/55 p-3.5 rounded-2xl border border-sky-150 text-[11px] text-sky-900">
                <strong className="text-sky-850 block mb-1">เหตุผลและข้อแนะนำทางสัมบูรณ์ในการเฉลยหลักสูตร:</strong>
                <p className="leading-normal">{selectedQuestionRow.correctExplanation}</p>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setSelectedQuestionRow(null)} 
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                ปิดแผงคำถาม
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
