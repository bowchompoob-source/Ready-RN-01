/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowLeft, User, ShieldCheck, Database, Key, CheckCircle, AlertCircle, HelpCircle, Sparkles } from "lucide-react";
import { UserRole } from "../types";
import { auth, isFirebaseConfigured } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";

interface LoginPageProps {
  role: UserRole;
  onBack: () => void;
  onLoginSuccess: (role: UserRole, username: string) => void;
}

export default function LoginPage({ role, onBack, onLoginSuccess }: LoginPageProps) {
  const isStudent = role === "student";
  
  // State for forms
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Translate Firebase Authentication Errors to Thai
  const translateAuthError = (code: string): string => {
    switch (code) {
      case "auth/user-not-found":
        return "ไม่พบชื่อบัญชีผู้ใช้งานนี้ในระบบการผดุงครรภ์";
      case "auth/wrong-password":
        return "รหัสผ่านไม่ถูกต้อง กรุณาป้อนข้อมูลใหม่อีกครั้ง";
      case "auth/invalid-email":
        return "รูปแบบของที่อยู่อีเมลไม่ถูกต้อง";
      case "auth/email-already-in-use":
        return "อีเมลนี้ถูกสมัครใช้งานแล้วในฐานระบบหลัก";
      case "auth/weak-password":
        return "รหัสผ่านสั้นเกินไป กรุณาตั้งรหัสผ่านยาวกว่า 6 อักขระเพื่อความปลอดภัย";
      case "auth/invalid-credential":
        return "บัญชีผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบข้อมูล";
      case "auth/network-request-failed":
        return "การเชื่อมต่อระบบขัดข้องกรุณาตรวจสอบเครือข่ายอินเทอร์เน็ตของท่าน";
      case "auth/popup-closed-by-user":
        return "หน้าต่างยืนยันสิทธิผ่าน Google ถูกปิดโดยผู้ใช้งาน";
      default:
        return "เกิดความผิดพลาดในการยืนยันสิทธิ์: " + code;
    }
  };

  // 1. Firebase Authentication: Email & Password
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("กรุณาป้อนข้อมูลอีเมลและรหัสผ่านให้ครบถ้วน");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isRegistering) {
        // Sign-up flow
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        // Successful signup will trigger onAuthStateChanged in App.tsx
      } else {
        // Log-in flow
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;
        onLoginSuccess(role, user.displayName || user.email || "ผู้ใช้งาน");
      }
    } catch (err: any) {
      console.error("Firebase auth error:", err);
      setErrorMsg(translateAuthError(err?.code || "unknown"));
    } finally {
      setLoading(false);
    }
  };

  // 2. Firebase Authentication: Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      onLoginSuccess(role, user.displayName || user.email || "ผู้ใช้งาน Google");
    } catch (err: any) {
      console.error("Google login failed:", err);
      setErrorMsg(translateAuthError(err?.code || "unknown"));
    } finally {
      setLoading(false);
    }
  };

  // 3. Standalone Mode: Demo Bypass Mock Action
  const handleMockLogin = () => {
    const mockName = isStudent ? "นางสาวกานดา วิชิตสกุล" : "อาจารย์ ดร. ปนัดดา";
    onLoginSuccess(role, mockName);
  };

  return (
    <div className="bg-transparent min-h-screen flex items-center justify-center p-4 sm:p-6" id="login-container">
      <div className="w-full max-w-md bg-white/75 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        
        {/* Color stripe based on mode */}
        <div className={`h-2.5 ${isStudent ? "bg-teal-600" : "bg-slate-800"}`}></div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Back button */}
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-850 transition-colors focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>กลับสู่หน้าหลัก</span>
          </button>

          {/* Heading */}
          <div className="space-y-1.5 text-center">
            <div className={`mx-auto w-14 h-14 ${isStudent ? "bg-teal-50 text-teal-600 shadow-teal-50" : "bg-slate-100 text-slate-800 shadow-slate-100"} rounded-2xl flex items-center justify-center border ${isStudent ? "border-teal-100" : "border-slate-200"} shadow-sm`}>
              {isStudent ? <User className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              เข้าสู่ระบบ {isStudent ? "“นักศึกษาพยาบาล”" : "“อาจารย์ผู้สอน”"}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              สิทธิเข้าใช้งานกลุ่มวิชา: <span className={`font-semibold ${isStudent ? "text-teal-600" : "text-slate-800"}`}>{role.toUpperCase()} ROLE</span>
            </p>
          </div>

          {/* DEMO MODE WARNING BANNER */}
          {!isFirebaseConfigured && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2" id="demo-banner">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-extrabold text-amber-800 block">💡 กำลังเข้าใช้งานด้วย Demo Mode</span>
                  <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">
                    ตรวจสัมบูรณ์: <span className="font-semibold underline">ยังไม่ได้ตั้งรหัสเชื่อม Firebase</span> ระบบจำลองข้อมูลแบบ Local Sandbox เพื่อให้ทดลองฟีเจอร์ได้ครบถ้วน โดยไม่เก็บประวัติจริงลง Cloud
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message Panel */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs flex items-start space-x-2.5">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* INTERFACE FOR FIREBASE CONFIGURATION MODE */}
          {isFirebaseConfigured ? (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  อีเมล (Email Address)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@stin.ac.th"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-205 border-slate-200 focus:border-teal-400 focus:bg-white text-slate-800 rounded-xl text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                    รหัสผ่าน (Password)
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Key className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-205 border-slate-200 focus:border-teal-400 focus:bg-white text-slate-800 rounded-xl text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2 ${
                    isStudent ? "bg-teal-600 hover:bg-teal-700" : "bg-slate-800 hover:bg-slate-900"
                  } disabled:opacity-50`}
                >
                  <span>{loading ? "กำลังบันทึกข้อมูล..." : isRegistering ? "สมัครบัญชีใหม่และเข้าใช้" : "ลงชื่อเข้าพอร์ตประเมิน"}</span>
                </button>

                {/* Google Authentication Option */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l2.85-2.22-.19-.6z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.08l3.66 2.84c.87-2.6 3.3-4.54 6.16-4.54z" />
                  </svg>
                  <span>ลงชื่อเข้าใช้งานด้วยสถาบัน Google</span>
                </button>

                {/* Form Toggle Link */}
                <div className="text-center pt-1.5">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                  >
                    {isRegistering ? "มีบัญชีผู้ใช้อยู่แล้ว? สลับไปหน้าเข้าสู่ระบบ" : "ไม่มีบัญชีผดุงครรภ์? กดคลิกเพื่อลงทะเบียนใหม่"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* INTERFACE FOR STANDALONE DEMO MODE */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-3">
                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  <span>ประสงค์ทดลองใช้ระบบ:</span>
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  คลิกที่ปุ่มด่านล่างเพื่อกระโดดเข้าราชการพยาบาลจำลองสิทธิ {isStudent ? "“นักศึกษาพยาบาล”" : "“อาจารย์แกนหลักควบคุมวิชา”"} เพื่อตรวจสอบ Dashboard และทดสอบทำข้อสอบได้ทันที
                </p>

                {/* Mock Action button for visual validation */}
                <button
                  id="btn-mock-login-trigger"
                  onClick={handleMockLogin}
                  className={`w-full py-3 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2 ${
                    isStudent ? "bg-teal-600 hover:bg-teal-700" : "bg-slate-800 hover:bg-slate-900"
                  }`}
                >
                  <span>ทดลองเข้าสู่ระบบเป็น{isStudent ? "นักศึกษา" : "อาจารย์"}</span>
                </button>
              </div>

              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-medium">💡 เวิร์กโฟลว์จำลองแบบ Single Spa รวดเร็วและไม่ต้องใช้รหัสผ่านจริง</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer info lock indicator */}
        <div className="bg-slate-50 border-t border-slate-100 py-3.5 px-6 text-center text-[10px] text-slate-400 bg-slate-50 flex items-center justify-center space-x-1.5">
          <Database className="h-3.5 w-3.5" />
          <span>Serverless React • Spark Sandbox Detection Ready</span>
        </div>

      </div>
    </div>
  );
}
