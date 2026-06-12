/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import CozySeasideBackground from "./components/CozySeasideBackground";
import { UserRole } from "./types";
import { auth, db, isFirebaseConfigured } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { GraduationCap, ShieldAlert, LogIn, ArrowLeft } from "lucide-react";

export default function App() {
  const [view, setView] = useState<"landing" | "login" | "student" | "teacher">("landing");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  // Real Identity state
  const [username, setUsername] = useState<string>("");
  const [studentIdState, setStudentIdState] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isFirebaseConfigured);
  const [accessDeniedEmail, setAccessDeniedEmail] = useState<string>("");

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthLoading(false);
      return;
    }

    // Subscribe to Firebase Authentication
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email || "");
        setAuthLoading(true);
        try {
          const normalizedEmail = (user.email || "").toLowerCase().trim();

          // 1. Check existing users document
          const userDocRef = doc(db, "users", user.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const userData = snap.data();
            setUsername(userData.displayName || user.displayName || "ผู้ใช้ระบบ");
            setCurrentRole(userData.role);
            if (userData.studentId) setStudentIdState(userData.studentId);
            
            // Route automatically
            setView(userData.role === "student" ? "student" : "teacher");
          } else {
            // 2. New sign-in: Validate email from Allowlist paths
            
            // 2A. Check Teacher Allowlist
            const teacherAllowRef = doc(db, "teachersByEmail", normalizedEmail);
            const teacherAllowSnap = await getDoc(teacherAllowRef);

            if (teacherAllowSnap.exists()) {
              const allowData = teacherAllowSnap.data();
              const dName = allowData.displayName || user.displayName || "อาจารย์ผู้ประสานงาน";
              
              // Register new Teacher profile
              await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: dName,
                role: "teacher" as UserRole,
                createdAt: new Date().toISOString()
              });

              await setDoc(doc(db, "teachers", user.uid), {
                uid: user.uid,
                displayName: dName,
                email: user.email
              });

              setUsername(dName);
              setCurrentRole("teacher");
              setView("teacher");
            } 
            // 2B. Check Student Allowlist
            else {
              const studentAllowRef = doc(db, "studentsByEmail", normalizedEmail);
              const studentAllowSnap = await getDoc(studentAllowRef);

              if (studentAllowSnap.exists()) {
                const allowData = studentAllowSnap.data();
                const dName = allowData.displayName || user.displayName || "นักศึกษาผดุงครรภ์";
                const sId = allowData.studentId || "unknown_id";
                const sect = allowData.section || "ห้องเรียนทั่วไป";

                // Register new Student profile
                await setDoc(doc(db, "users", user.uid), {
                  uid: user.uid,
                  email: user.email,
                  displayName: dName,
                  role: "student" as UserRole,
                  studentId: sId,
                  section: sect,
                  createdAt: new Date().toISOString()
                });

                // Create or verify student meta database sheet
                await setDoc(doc(db, "students", sId), {
                  studentId: sId,
                  uid: user.uid,
                  displayName: dName,
                  section: sect,
                  email: user.email,
                  status: "safe",
                  preTestScore: null,
                  postTestScore: null,
                  practiceCount: 0
                }, { merge: true });

                setUsername(dName);
                setStudentIdState(sId);
                setCurrentRole("student");
                setView("student");
              } 
              // 2C. Not on allowlist -> Access Denied
              else {
                setAccessDeniedEmail(user.email || "");
                await signOut(auth);
                setView("landing");
              }
            }
          }
        } catch (error) {
          console.error("Authentication post-sync failed:", error);
        } finally {
          setAuthLoading(false);
        }
      } else {
        // Clear all auth state
        setUsername("");
        setUserEmail("");
        setStudentIdState("");
        setCurrentRole(null);
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setView("login");
  };

  const handleBackToLanding = () => {
    setSelectedRole(null);
    setView("landing");
  };

  const handleLoginSuccess = (role: UserRole, loginName: string) => {
    setUsername(loginName);
    setCurrentRole(role);
    setView(role === "student" ? "student" : "teacher");
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured) {
      setAuthLoading(true);
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Signout error:", err);
      } finally {
        setAuthLoading(false);
      }
    }
    setView("landing");
    setSelectedRole(null);
    setCurrentRole(null);
    setUsername("");
    setAccessDeniedEmail("");
  };

  // --- RENDERING ACCESS DENIED SUB-VIEW ---
  if (accessDeniedEmail !== "") {
    return (
      <div className="text-slate-950 min-h-screen relative font-sans overflow-x-hidden selection:bg-teal-200 selection:text-teal-900 flex items-center justify-center p-4">
        <CozySeasideBackground />
        <div className="relative z-10 w-full max-w-md bg-white/75 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-6 sm:p-8 space-y-6 text-center">
          <div className="mx-auto w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">ปฏิเสธสิทธิเข้าใช้งาน (Access Denied)</h2>
            <div className="bg-red-50/70 border border-red-100 rounded-xl p-3.5 mt-2">
              <span className="text-xs text-red-700 block">บัญชีอีเมลที่ล็อกอิน:</span>
              <strong className="text-sm text-red-950 block font-mono break-all mt-0.5">{accessDeniedEmail}</strong>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pt-2">
              ความปลอดภัยระบบ: บัญชีผู้ใช้นี้ <span className="font-semibold text-red-600">“ยังไม่อยู่ในรายชื่อผู้มีสิทธิ์ใช้งานล่วงหน้า”</span> (Enrollment Allowlist) ของคณะวิชาผดุงครรภ์
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-left space-y-2">
            <span className="text-xs font-bold text-slate-700 block">คำแนะนำสำหรับผู้ใช้งาน:</span>
            <ul className="text-[11px] text-slate-500 list-disc list-inside space-y-1 leading-relaxed">
              <li>กรณีเป็นนักศึกษา: กรุณาแจ้งอาจารย์ผู้ประสานงานรายวิชาเพื่อทำการ Import ข้อมูลอีเมลของท่านเข้าสู่ระบบ</li>
              <li>กรณีเป็นผู้สอน: กรุณาแจ้ง Admin โครงการเพื่อเพิ่มสิทธิอีเมลผู้สอนลงในตารางหลัก</li>
            </ul>
          </div>

          <button
            onClick={() => setAccessDeniedEmail("")}
            className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>กลับหน้าหลักและลองใหม่อีกครั้ง</span>
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERING LOADING SECURE TRANSITIONS ---
  if (authLoading) {
    return (
      <div className="text-slate-950 min-h-screen relative font-sans overflow-x-hidden selection:bg-teal-200 selection:text-teal-900 flex items-center justify-center">
        <CozySeasideBackground />
        <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
          <div className="p-3.5 bg-teal-50 text-teal-600 rounded-2xl border border-teal-100 animate-pulse">
            <GraduationCap className="h-8 w-8 text-teal-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">กำลังยืนยันความปลอดภัยข้อมูล...</h3>
            <p className="text-xs text-slate-400 mt-1">Ready RN 01 • Secure Connection</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-slate-950 min-h-screen relative font-sans overflow-x-hidden selection:bg-teal-200 selection:text-teal-900">
      <CozySeasideBackground />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {view === "landing" && (
          <LandingPage onSelectRole={handleSelectRole} />
        )}

        {view === "login" && selectedRole && (
          <LoginPage 
            role={selectedRole} 
            onBack={handleBackToLanding} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {view === "student" && (
          <StudentDashboard username={username} role={currentRole || selectedRole} onLogout={handleLogout} />
        )}

        {view === "teacher" && (
          <TeacherDashboard username={username} role={currentRole || selectedRole} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
}
