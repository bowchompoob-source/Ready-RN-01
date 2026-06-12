/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { QuizAttempt } from "../../types";
import { 
  getLatestAttempt, 
  getLatestAttemptByType, 
  calculateStudentProgress,
  buildPersonalRecommendations,
  buildTopicReviewPlan,
  ALL_MIDWIFERY_TOPICS
} from "../../studentService";
import { 
  Award, 
  BookOpen, 
  Activity, 
  ArrowRight, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight,
  TrendingUp,
  Inbox,
  Sparkles,
  ShieldAlert,
  Flame,
  CheckCircle2,
  XCircle
} from "lucide-react";

interface PersonalLearningDashboardProps {
  attempts: QuizAttempt[];
  onRefresh: () => void;
  onNavigateToQuizzes: () => void;
  isDemoMode: boolean;
  username: string;
}

export default function PersonalLearningDashboard({
  attempts,
  onRefresh,
  onNavigateToQuizzes,
  isDemoMode,
  username
}: PersonalLearningDashboardProps) {

  const latestAttempt = getLatestAttempt(attempts);
  const totalCount = attempts.length;

  // Empty state handling
  if (totalCount === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 text-center border border-slate-100 shadow-sm max-w-2xl mx-auto space-y-6 mt-10">
        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center mx-auto border border-teal-100 shadow-inner animate-pulse">
          <BookOpen className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h3 className="font-extrabold text-xl text-slate-800 tracking-tight">ยังไม่มีข้อมูลการทำแบบทดสอบ</h3>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            เริ่มจากแบบทดสอบก่อนเรียน (Pre-test) เพื่อประเมินและทำความเข้าใจพื้นฐานความรู้ด้านการผดุงครรภ์รายบุคคลของคุณก่อนทำการทบทวนเชิงลึก
          </p>
        </div>

        {isDemoMode && (
          <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 font-medium inline-block border border-amber-200">
            💡 กำลังเริ่มระบบด้วยระบบจำลอง แนะนำให้กดปุ่ม 'รีเฟรชข้อมูลของฉัน' เพื่อซิงก์ประวัติล่าสุดออนไลน์
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRefresh}
            className="px-5 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center space-x-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>ซิงก์ข้อมูล</span>
          </button>
          <button
            onClick={onNavigateToQuizzes}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center justify-center space-x-1.5 cursor-pointer hover:scale-102"
          >
            <span>เริ่มทำ Pre-test เพื่อประเมินผล</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Calculate detailed progress stats
  const preTest = getLatestAttemptByType(attempts, "pre");
  const postTest = getLatestAttemptByType(attempts, "post");
  const progressData = calculateStudentProgress(attempts);

  // Topic diagnostics
  const topicPlans = buildTopicReviewPlan(attempts, ALL_MIDWIFERY_TOPICS);
  const weakTopics = topicPlans.filter((tp) => tp.latestScore !== null && tp.latestScore < 60);
  const urgentTopic = weakTopics.length > 0 
    ? [...weakTopics].sort((a, b) => (a.latestScore ?? 0) - (b.latestScore ?? 0))[0] 
    : null;

  // Personal suggestions
  const recommendations = buildPersonalRecommendations(attempts, ALL_MIDWIFERY_TOPICS);

  return (
    <div className="space-y-8" id="personal-dashboard">
      
      {/* Dynamic Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Award className="h-64 w-64" />
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="text-[10px] font-bold text-teal-300 bg-teal-500/15 px-3 py-1 rounded-full uppercase tracking-wider inline-block border border-teal-500/25">
            READY RN 01 • แดชบอร์ดทบทวนความรู้ส่วนบุคคล
          </span>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              สวัสดียินดีต้อนรับ, {username}
            </h2>
            <p className="text-xs text-slate-350 leading-relaxed font-light">
              ที่นี่คือศูนย์วิเคราะห์ความรู้ผดุงครรภ์เฉพาะบุคคลของคุณ ระบบคัดสรรคะแนนจากความพยายาม <span className="font-semibold text-teal-400">{attempts.length} ครั้งล่าสุด</span> เพื่อตรวจสอบความพร้อม แฉจุดอ่อน และปักหมุดข้อแนะนำเร่งด่วนก่อนก้าวสู่ห้องสอบสภาจริง
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl text-2xs font-extrabold transition-all flex items-center space-x-1.5"
              id="refresh-dashboard-btn"
            >
              <RefreshCw className="h-3 w-3 animate-pulse" />
              <span>รีเฟรชข้อมูลของฉัน</span>
            </button>
            
            {isDemoMode ? (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold">
                ⚙️ DEMO MODE (ข้อมูลสาธิตระดับสูง)
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold">
                🔒 CLOUD SYNCED (ข้อมูลจริง)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI GRID (8 Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-grid">
        
        {/* KPI 1: Latest score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">คะแนนทำโจทย์ล่าสุด</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-extrabold font-mono text-slate-900">
                {latestAttempt ? `${latestAttempt.scorePercentage}` : "0"}
              </span>
              <span className="text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-50">
            <span className="text-[10px] text-slate-500 block font-medium">
              {latestAttempt 
                ? `ชุด ${latestAttempt.quizSetId} (${latestAttempt.correctAnswers}/${latestAttempt.totalQuestions} คะแนน)`
                : "ยังไม่มีประวัติ"
              }
            </span>
          </div>
        </div>

        {/* KPI 2: Current Status Badge */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">สถานภาพประเมินครั้งล่าสุด</span>
            <div className="pt-1">
              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold leading-none ${
                latestAttempt && latestAttempt.scorePercentage >= 60
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {latestAttempt && latestAttempt.scorePercentage >= 60 ? (
                  <>
                    <CheckCircle2 className="h-3..5 w-3.5 text-emerald-600 shrink-0" />
                    <span>ผ่านเกณฑ์ประเมิน</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span>ควรทบทวนเพิ่มเติม</span>
                  </>
                )}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-50">
            <span className="text-[10px] text-slate-400 block font-light leading-none">เกณฑ์มาตรฐานสภาการพยาบาล 60%</span>
          </div>
        </div>

        {/* KPI 3: Latest Pre-test score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">คะแนน Pre-test ล่าสุด</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-extrabold font-mono text-slate-800">
                {preTest ? `${preTest.scorePercentage}` : "—"}
              </span>
              {preTest && <span className="text-xs text-slate-400 font-semibold">%</span>}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-50">
            <span className="text-[10px] text-slate-500 block font-medium">
              {preTest ? `ทำเมื่อ: ${new Date(preTest.submittedAt).toLocaleDateString("th-TH")}` : "ยังไม่มีข้อมูล Pre-test"}
            </span>
          </div>
        </div>

        {/* KPI 4: Latest Post-test score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">คะแนน Post-test ล่าสุด</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-extrabold font-mono text-slate-800">
                {postTest ? `${postTest.scorePercentage}` : "—"}
              </span>
              {postTest && <span className="text-xs text-slate-400 font-semibold">%</span>}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-50">
            <span className="text-[10px] text-slate-500 block font-medium">
              {postTest ? `ทำเมื่อ: ${new Date(postTest.submittedAt).toLocaleDateString("th-TH")}` : "ยังไม่มีข้อมูล Post-test"}
            </span>
          </div>
        </div>

        {/* KPI 5: Progress level */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ความก้าวหน้า (Progress Score)</span>
            <div className="flex items-center space-x-1.5 pt-0.5">
              {progressData.progressScore !== null ? (
                <>
                  <span className={`text-xl font-extrabold font-mono ${
                    progressData.progressScore >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {progressData.progressScore >= 0 ? `+${progressData.progressScore}` : progressData.progressScore}%
                  </span>
                  <span className="text-[10.5px] bg-teal-50 text-teal-700 border border-teal-100 px-1.5 rounded-full font-bold">
                    พัฒนาขึ้น
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate-400 italic">ต้องการตัววัด Pre + Post</span>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-50">
            <span className="text-[10px] text-slate-400 block font-light">ระดับเปรียบเทียบคะแนน Pre กับ Post </span>
          </div>
        </div>

        {/* KPI 6: Attempts completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">จานวนครั้งสอบสะสม</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-extrabold font-mono text-slate-800">{totalCount}</span>
              <span className="text-xs text-slate-400 font-bold">ครั้ง</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-50">
            <span className="text-[10px] text-slate-500 block font-medium">ครอบคลุมทั้ง Pre/Practice/Post</span>
          </div>
        </div>

        {/* KPI 7: Review Required Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">หัวข้อที่ควรทบทวนหลัก</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-extrabold font-mono text-amber-600">{weakTopics.length}</span>
              <span className="text-xs text-slate-400 font-bold">จาก 6 หัวข้อ</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-50">
            <span className="text-[10px] text-slate-500 block font-medium">กลุ่มหัวข้อที่คะแนนต่ำกว่า 60%</span>
          </div>
        </div>

        {/* KPI 8: Priority Alert Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">หัวข้อวิกฤตที่ต้องเน้นย้ำที่สุด</span>
            <span className="text-xs font-bold text-rose-600 line-clamp-1 block pt-1" title={urgentTopic ? urgentTopic.topicName : "ไม่มีหัวข้อบกพร่องวิกฤต"}>
              {urgentTopic ? urgentTopic.topicName : "ไม่มีหัวข้อตกเกณฑ์ ✨"}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-50">
            <span className="text-[10px] text-slate-400 block font-light">คะแนนล่าสุดต่ำที่สุดในกลุ่มสาระ</span>
          </div>
        </div>

      </div>

      {/* TWO COLUMN INTERACTION: RECOMMENDATIONS & VISUALS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Rule-Based Personal Advice (8 cols) */}
        <div className="lg:col-span-8 space-y-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center space-x-2">
              <Sparkles className="h-4.5 w-4.5 text-teal-600" />
              <span>แผนคำแนะนำและเป้าหมายส่วนบุคคล (Rule-Based Recommendations)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">วิจัยและประเมินระบบแบบกล่องทฤษฎีอ้างอิงจากหลักเกณฑ์วิเคราะห์คำตอบล่าช้า</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {recommendations.map((rec, i) => (
              <div 
                key={i} 
                className="p-3.5 bg-slate-50 border border-slate-150/60 rounded-2xl flex items-start space-x-3 text-slate-700 hover:bg-teal-50/20 hover:border-teal-100 transition-all font-light"
              >
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0"></div>
                <p className="text-xs leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Visual Pathway Highlights (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center space-x-1.5">
                <Activity className="h-4 w-4 text-emerald-600" />
                <span>ความก้าวหน้า Pre-test → Post-test</span>
              </h4>
            </div>

            {/* Visual Progress Bar Path */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <span className="text-[10px] text-slate-450 uppercase tracking-wider font-semibold block">Pre-test</span>
                  <span className="text-xl font-mono font-extrabold text-slate-750">
                    {preTest ? `${preTest.scorePercentage}%` : "—"}
                  </span>
                </div>
                <div className="flex items-center text-teal-600 shrink-0">
                  <ArrowRight className="h-5 w-5 animate-pulse" />
                </div>
                <div className="text-center flex-1">
                  <span className="text-[10px] text-slate-450 uppercase tracking-wider font-semibold block">Post-test</span>
                  <span className="text-xl font-mono font-extrabold text-slate-850">
                    {postTest ? `${postTest.scorePercentage}%` : "—"}
                  </span>
                </div>
              </div>

              {/* Graphical Path Line */}
              <div className="space-y-1.5 pt-1.5">
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-slate-400 h-full rounded-l-full transition-all" 
                    style={{ width: `${preTest ? preTest.scorePercentage : 0}%` }}
                  ></div>
                  <div 
                    className="bg-teal-500 h-full rounded-r-full transition-all" 
                    style={{ width: `${Math.max(0, (postTest ? postTest.scorePercentage : 0) - (preTest ? preTest.scorePercentage : 0))}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                  <span>ฐานคะแนนเริ่มต้น</span>
                  {progressData.progressScore !== null && (
                    <span className="text-teal-600 font-bold">
                      เติบโต {progressData.progressScore}%
                    </span>
                  )}
                  <span>ระดับความพร้อมสัมบูรณ์</span>
                </div>
              </div>
            </div>
            
            <p className="text-[10.5px] text-slate-500 leading-normal font-light">
              * คำแนะนำ: ทำแบบฝึกหัดหน่วยที่มีสถานภาพวิกฤต (T003/T004) สม่ำเสมอเพื่ออัดคะแนน Post-test ให้พ้นขอบความพร้อมสภา 60% เสมอ
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              onClick={onNavigateToQuizzes}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md  cursor-pointer"
            >
              ทำแบบทดสอบเพิ่มสติปัญญา
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
