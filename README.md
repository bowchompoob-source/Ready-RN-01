# Ready RN 01 - Clinical Readiness Prep (Midwifery วิชา 01 การผดุงครรภ์)

ระบบ Web Application บอร์ดทบทวนความรู้และประเมินความพร้อมแบบส่วนบุคคลเชิงเจาะลึก (Clinical Readiness Assessment Platform) สำหรับนักศึกษาพยาบาลและการผดุงครรภ์ ในการเตรียมสอบสภาการพยาบาล

---

## 🌟 ค่านิยมและทิศทางสถาปัตยกรรม (Design Concept & Architecture)

Ready RN 01 พัฒนาขึ้นโดยอ้างอิงสถาปัตยกรรม **Serverless Front-end Engine** ที่ทำงานร่วมกับ **Firebase Spark Plan** อย่างสมบูรณ์แบบ เพื่อช่วยรักษาขีดจำกัดโควต้าฟรีของแผนบริการ โดยไม่อาศัย Backend หรือ Cloud Functions (Serverless Edge) และเน้นแนวทาง **Offline-First & Dynamic Synchronization** ดังนี้:

### 1. การบริหารทรัพยากรภายใต้แผนบริการฟรี (Spark Plan Optimization)
*   **Cap & Limit System**: การดึงสถิติตลอดทั้งห้องเรียนมีการจำกัดเพดานข้อมูลไว้ที่สูงสุด 500 ระเบียนแรก และทำงานร่วมกับการจัดเรียงดัชนีฝั่งไคลเอนต์ (Client-side sorting fallback) เพื่อตัดความเสี่ยงระบบขัดข้องยามไม่มีดัชนี (Composite Index)
*   **Manual Trigger Mode**: ยกเลิกการใช้ Real-time active listeners (`onSnapshot`) ทั้งหมดบนกลุ่มข้อมูลขนาดใหญ่ เพื่อจำกัดการอ่าน (Request read billing) และหันมาพึ่งพาระดับการอัปเดตแบบสัมบูรณ์ผ่านปุ่มกดด้วยมือ (Manual Manual Refresh)
*   **Client-Side Analytics Processing**: การคำนวณทางสถิติ การจัดอันดับคำถามตอบผิดบ่อยสุด และคัลเลเตอร์สติปัญญาใช้สมรรถนะในเว็บเบราว์เซอร์ของอาจารย์ทั้งหมดแบบ 100%

### 2. การรักษาความปลอดภัยและความถูกต้อง (Robust Role-Based Control)
*   **Allowlist Registry Enforcements**: การเข้าถึงระบบของผู้ใช้ จะต้องยืนยันข้อมูลประสานกับตารางลงทะเบียนสิทธิ์อีเมลสถาบันล่วงหน้า (`studentsByEmail` หรือ `teachersByEmail`) มิฉะนั้นจะถูกปฏิเสธสิทธิเข้าสู่หน้าปกปิด (Access Denied) ในทันที
*   **Declarative Firestore Security**: ประยุกต์ใช้กฎประเมินความปลอดภัย `firestore.rules` ตรวจเช็คสิทธิเขียนเฉพาะผู้เป็นเจ้าของข้อมูลและอาจารย์ควบคุมรายวิชาเท่านั้น

### 3. ประสบการณ์ CSV และความเข้ากันได้กับ Excel (Excel-Friendly CSV)
*   **Thai Character Encoding Safeguard**: การแปลงและดาวน์โหลดไฟล์รายงาน CSV ใช้ตัวนำหัวแบบ **UTF-8 with BOM (`\uFEFF`)** ทำให้เปิดบนโปรแกรม Microsoft Excel ด้วยภาษาไทยได้อย่างถูกต้องไร้ปมสระกระจัดกระจาย
*   **Drag-and-Drop Parser API**: คอร์สอาจารย์รองรับการคัดกรองไฟล์รูปแบบลากและโยนวางลงบนพื้นที่ target-zone ที่มีขวาและขอบประตัก (Drag-and-Drop) และแยกแยะข้อมูลคอลัมน์สำคัญพร้อมแสดงดัชนีผิดบรรทัดในแบบเรียลไทม์

---

## 🛠️ ขีดจำกัดและแนวทางการทดสอบ (Known Limitations & Known Boundaries)

1.  **ไม่มีเซิร์ฟเวอร์แบบ Real-time API**: ระบบไม่ได้ใช้ Web Sockets เพื่อกระจายสถานะสด การอัปเดตจะต้องกดสัมผัสผ่านปุ่ม "รีเฟรชข้อมูล" (Manual Sync)
2.  **ปริมาณข้อมูลสะสม**: ระบบเหมาะสำหรับขนาดชั้นเรียนจำนวนนักศึกษา 100 - 300 คน โดยระเบียนการเฝ้าระวังและสถิติประมวลผลได้รับการบีบอัดลงและพึ่งพาประสิทธิภาพเบราว์เซอร์ของผู้สอน
3.  **ความพึ่งพาเบราว์เซอร์**: ข้อมูลตัวจำลองสำรอง (Demo Sandbox fallback) อาศัย `localStorage` ของอุปกรณ์ หากผู้ใช้สลับเครื่องหรือล้างคุ๊กกี้ ข้อมูลความพยายามที่ไม่ได้กดซิงก์ขึ้น Firebase จะหายไปจากประวัติเครื่องนั้นๆ

---

## 🚀 คู่มือการนำเข้าไฟล์ CSV (CSV Specification Sheets)

### 📌 แม่แบบรายชื่อนักเรียน (Student Allowlist CSV Template)
```csv
studentId,displayName,email,section
651101001,"นางสาวกานดา วิชิตสกุล",kanda.w@stin.ac.th,"ห้อง A1"
651101002,"นายเกียรติศักดิ์ ประเสริฐ",kiat.p@stin.ac.th,"ห้อง A1"
```

### 📌 แม่แบบคลังข้อสอบ (Questions Database CSV Template)
```csv
questionId,topic,scenario,questionText,optionA,optionB,optionC,optionD,correctAnswer,explanation,difficulty
Q011,"การพยาบาลในระยะตั้งครรภ์และภาวะแทรกซ้อน","หญิงตั้งครรภ์ G1P0 ตรวจครรภ์พบอาการบวมที่ข้อเท้า","คำแนะนำที่ถูกหลักที่สุดคือข้อใด","นอนราบไม่หนุนหมอน","นอนตะแคงซ้ายและหนุนส้นเท้า","จำกัดการดื่มน้ำเหลือ 500 มล.","จำกัดอาหารกลุ่มโปรตีน","b","การนอนตะแคงซ้ายจะช่วยลดการกดทับท่อน้ำเลือดใหญ่หัวใจ (Inferior Vena Cava) เพิ่มการเดินทางของเลือดสู่รกและไต ลดเท้าบวม","medium"
```

---

## 📡 รายงาน QA สรุปความพร้อมใช้งานสำหรับ Netlify และ GitHub

*   **Netlify Ready**: โค้ดมีสถาปัตยกรรมแบบ Static Production Bundle ได้ในคำสั่งเดียวผ่าน `npm run build` ซึ่งจะประมวลผลไฟล์จัดแจงระบบทั้งหมดไว้อยู่ในโฟลเดอร์ `/dist`
*   **GitHub Shared Active**: ปราศจากความเสี่ยงส่งข้อมูล Keys เข้าสู่คลังรหัสเนื่องจากมีการคัดแยก Config เป็นแบบ Dynamic Load ร่วมกับ `.env.example` สมบูรณ์แบบ
