# 🔧 LIFF Troubleshooting Guide

## ปัญหา: "ไม่สามารถเชื่อมต่อกับ LINE LIFF ได้"

### ✅ Checklist ตรวจสอบ:

#### 1. ตรวจสอบ LIFF Settings ใน LINE Developers Console

ไปที่: https://developers.line.biz/console/

- [ ] **LIFF ID ถูกต้อง:** `2008347866-ENW1yewM`
- [ ] **Endpoint URL:** ต้องตรงกับ URL ที่คุณเปิด (ngrok/localhost)
  - ตัวอย่าง: `https://xxxx.ngrok-free.app`
  - ❌ ห้ามมี path ต่อท้าย เช่น `/line-activated`
  - ✅ ใช้แค่ domain เท่านั้น
- [ ] **Scope:** เลือก `profile`, `email`, `openid`
- [ ] **Module Mode:** ใช้ `On`
- [ ] **Available in App:** ตั้งค่าให้เปิดได้ใน LINE App

#### 2. ตรวจสอบ ngrok

```bash
# 1. ตรวจสอบว่า ngrok กำลังรันอยู่
ngrok http 4200

# 2. Copy ngrok URL (https://xxxx.ngrok-free.app)

# 3. ตรวจสอบว่า Angular กำลังรันที่ port 4200
npm run start
```

#### 3. อัปเดต LIFF Endpoint URL

**ขั้นตอน:**
1. เปิด ngrok → Copy URL
2. ไปที่ LINE Developers Console
3. เลือก LIFF App → คลิก Edit
4. วาง ngrok URL ใน **Endpoint URL**
5. คลิก **Update**

#### 4. ตรวจสอบ Console Log

เปิด Developer Tools (F12) และดู Console:

**Log ที่ควรเห็น:**
```
🚀 Starting LIFF initialization...
LIFF ID: 2008347866-ENW1yewM
Current URL: https://xxxx.ngrok-free.app
LIFF SDK loaded: true
⏳ Initializing LIFF...
✅ LIFF initialized successfully
Is in LINE client: true
```

**Error ที่พบบ่อย:**
- `LIFF SDK not loaded` → ปัญหา import package
- `Invalid LIFF ID` → LIFF ID ผิด
- `Endpoint URL mismatch` → URL ไม่ตรง
- `timeout` → เครือข่ายช้าหรือ LIFF Settings ผิด

#### 5. ทดสอบ LIFF URL

เปิด URL นี้ใน Browser:
```
https://liff.line.me/2008347866-ENW1yewM
```

**ผลลัพธ์:**
- ✅ ถ้าเปิดได้ → LIFF Settings ถูกต้อง
- ❌ ถ้า Error → ตรวจสอบ Endpoint URL

---

## 🚀 วิธีแก้ปัญหาแบบ Step-by-Step

### Step 1: Restart ทุกอย่าง

```bash
# 1. Stop Angular
Ctrl + C

# 2. Stop ngrok
Ctrl + C

# 3. Start ngrok ใหม่
ngrok http 4200

# 4. Copy ngrok URL

# 5. อัปเดต LIFF Endpoint URL

# 6. Start Angular ใหม่
npm run start

# 7. ทดสอบใน LINE
```

### Step 2: ใช้ Static Domain (แนะนำ)

**ถ้าใช้ ngrok Pro:**
```bash
ngrok http 4200 --domain=your-app.ngrok-free.app
```

**ข้อดี:**
- URL ไม่เปลี่ยน
- ไม่ต้องอัปเดต LIFF ทุกครั้ง

### Step 3: ตรวจสอบ Network

```bash
# Ping LINE API
curl -I https://api.line.me

# ตรวจสอบว่าติดต่อ LINE LIFF ได้
curl -I https://liff.line.me
```

---

## 📱 ทดสอบใน LINE

1. เปิด LINE App
2. Scan QR Code หรือเปิดลิงก์:
   ```
   https://liff.line.me/2008347866-ENW1yewM?user_id=123
   ```
3. ดู Console log ว่ามี error อะไร

---

## 🆘 ยังแก้ไม่ได้?

### Debug Steps:

1. **ตรวจสอบ LIFF ID ใน LINE Console:**
   - LIFF ID ต้องเป็น `2008347866-ENW1yewM`
   - ถ้าไม่ใช่ → แก้ใน `line-activated.component.ts`

2. **ตรวจสอบ Endpoint URL:**
   ```javascript
   // ใน Console (F12)
   console.log(window.location.origin)
   // ต้องตรงกับ Endpoint URL ใน LINE Console
   ```

3. **Clear Cache:**
   - ปิด LINE App
   - Clear Cache
   - เปิด LINE ใหม่

4. **ทดสอบใน Browser ก่อน:**
   - เปิด https://xxxx.ngrok-free.app
   - ดูว่าหน้าเว็บโหลดได้หรือไม่

---

## ✅ Checklist สุดท้าย

- [ ] ngrok กำลังรันอยู่
- [ ] Angular กำลังรันอยู่ (port 4200)
- [ ] LIFF Endpoint URL = ngrok URL
- [ ] LIFF ID ถูกต้อง
- [ ] Scope ครบถ้วน (profile, email, openid)
- [ ] ทดสอบใน LINE App (ไม่ใช่ Browser)
- [ ] Console ไม่มี error

---

## 📞 ติดต่อสอบถาม

ถ้ายังแก้ไม่ได้ ส่ง Console log มาให้ดูครับ:
1. เปิด Developer Tools (F12)
2. ไปที่ tab Console
3. Screenshot หรือ copy error message
4. ส่งมาให้ช่วยวิเคราะห์
