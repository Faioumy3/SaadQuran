// Firebase Configuration
// ⚠️ استبدل هذه القيم ببيانات مشروعك من Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ========== بيانات المعلمين الأساسية (تجريبية محلياً) ==========
// ملاحظة: هذا للاختبار فقط، سيتم نقل هذه البيانات إلى Firestore لاحقاً
const teachersDB = {
  'eman': { 
    name: 'إيمان الصباغ', 
    code: 'eman', 
    password: 'eman2025', 
    email: 'ahmed@example.com',
    students: [
      { id: '31201261802388', name: 'أروى نصر الحسيني المزين' },
      { id: '31112141802322', name: 'بسملة رضا جابر ساري' },
      { id: '31203151804361', name: 'بسملة سعيد إسماعيل نوار' },
      { id: '31210201800741', name: 'جنى إبراهيم أحمد الفاضلي' },
      { id: '31110171800976', name: 'سعد محمود سعد عبد الرحيم' },
      { id: '30905231802441', name: 'سمر سعد حسني الشاعر' },
      { id: '31205031802805', name: 'ليلى سمارة محمود الحلو' },
      { id: '31205101802344', name: 'بسملة محمد محمد الهنداوي' },
      { id: '31008141800301', name: 'جنات رضا عبد النبي حيدر' },
      { id: '31303161802728', name: 'خلود وائل نصر الفيومي' }
    ]
  },
  'samar': { 
    name: 'سمر الشاعر', 
    code: 'samar', 
    password: 'samar2025', 
    email: 'samar@example.com',
    students: [
      { id: '31309271801245', name: 'روان قطب إبراهيم أبوبكر' },
      { id: '31206201801651', name: 'محمد رمضان محمد محمد ساري' },
      { id: '31206211801161', name: 'مريم علي السيد نصر' },
      { id: '30901011806327', name: 'إيمان محمد عبد الحميد الصباغ' },
      { id: '31407171806209', name: 'آية محمود سعد عبد الرحيم' },
      { id: '31111111800884', name: 'تميمة مدحت أحمد الدهمة' },
      { id: '31408031801629', name: 'ريناد رزق سالم أبونوارج' },
      { id: '31001311801966', name: 'سمية عمر محمد القريشي' },
      { id: '31601261802378', name: 'محمد محمود إبراهيم الرويني' }
    ]
  }
};

// ========== بيانات الطلاب الافتراضية ==========
const studentsDB = [
  { id: '1', name: 'محمود أحمد', class: 'المستوى الأول' },
  { id: '2', name: 'فاطمة محمد', class: 'المستوى الأول' },
  { id: '3', name: 'علي عمر', class: 'المستوى الثاني' },
  { id: '4', name: 'سارة إبراهيم', class: 'المستوى الثاني' },
  { id: '5', name: 'حسن خالد', class: 'المستوى الثالث' },
  { id: '6', name: 'مريم سالم', class: 'المستوى الثالث' }
];

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase references
const db = firebase.firestore();
const auth = firebase.auth();

// ========== دوال مساعدة ==========

// دالة لإنشاء/تحديث معلم
async function addTeacher(code, name, email) {
  try {
    await db.collection('teachers').doc(code).set({
      code: code,
      name: name,
      email: email,
      createdAt: new Date()
    });
    console.log('تم إضافة المعلم:', name);
    return true;
  } catch (error) {
    console.error('خطأ في إضافة المعلم:', error);
    return false;
  }
}

// دالة لحفظ سجل حضور
async function saveAttendance(teacherCode, studentName, status, notes = '') {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    await db.collection('attendance').add({
      teacherCode: teacherCode,
      studentName: studentName,
      status: status, // 'present' أو 'absent'
      notes: notes,
      date: today,
      timestamp: new Date()
    });
    console.log('تم حفظ السجل:', studentName);
    return true;
  } catch (error) {
    console.error('خطأ في حفظ السجل:', error);
    return false;
  }
}

// دالة للحصول على سجلات يوم معين
async function getAttendanceByDate(date) {
  try {
    const snapshot = await db.collection('attendance')
      .where('date', '==', date)
      .get();
    
    let records = [];
    snapshot.forEach(doc => {
      records.push(doc.data());
    });
    return records;
  } catch (error) {
    console.error('خطأ في جلب السجلات:', error);
    return [];
  }
}

// دالة للحصول على سجلات معلم محدد
async function getTeacherAttendance(teacherCode, date) {
  try {
    const snapshot = await db.collection('attendance')
      .where('teacherCode', '==', teacherCode)
      .where('date', '==', date)
      .get();
    
    let records = [];
    snapshot.forEach(doc => {
      records.push(doc.data());
    });
    return records;
  } catch (error) {
    console.error('خطأ في جلب سجلات المعلم:', error);
    return [];
  }
}

// دالة للتحقق من معلم (دخول بالكود وكلمة السر)
async function authenticateTeacher(code, password = null) {
  try {
    // أولاً جرب من قاعدة البيانات المحلية (للتطوير)
    if (teachersDB[code]) {
      const teacher = teachersDB[code];
      // إذا كانت كلمة السر مطلوبة
      if (password && teacher.password !== password) {
        console.log('كلمة السر غير صحيحة');
        return null;
      }
      return teacher;
    }

    // ثم جرب من Firestore (عندما يتم إعداد Firebase)
    const doc = await db.collection('teachers').doc(code).get();
    if (doc.exists) {
      const teacher = doc.data();
      if (password && teacher.password !== password) {
        console.log('كلمة السر غير صحيحة');
        return null;
      }
      return teacher;
    }

    console.log('الكود غير صحيح');
    return null;
  } catch (error) {
    console.error('خطأ في التحقق:', error);
    // في حالة الخطأ، جرب قاعدة البيانات المحلية على الأقل
    if (teachersDB[code]) {
      const teacher = teachersDB[code];
      if (password && teacher.password !== password) {
        return null;
      }
      return teacher;
    }
    return null;
  }
}

// دالة لتصدير البيانات إلى CSV
function exportToCSV(data, filename = 'attendance.csv') {
  let csv = 'التاريخ,اسم الطالب,المعلم,الحالة,الملاحظات\n';
  
  data.forEach(record => {
    csv += `${record.date},${record.studentName},${record.teacherCode},${record.status},${record.notes}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// ========== دوال إدارة الطلاب ==========

// دالة للحصول على جميع الطلاب
function getAllStudents() {
  // احصل على الطلاب من localStorage أو استخدم الافتراضية
  const storedStudents = localStorage.getItem('students');
  return storedStudents ? JSON.parse(storedStudents) : studentsDB;
}

// دالة لإضافة طالب جديد
function addStudent(name, classLevel) {
  const students = getAllStudents();
  const newStudent = {
    id: Date.now().toString(),
    name: name,
    class: classLevel
  };
  students.push(newStudent);
  localStorage.setItem('students', JSON.stringify(students));
  return newStudent;
}

// دالة لحذف طالب
function deleteStudent(studentId) {
  const students = getAllStudents();
  const filtered = students.filter(s => s.id !== studentId);
  localStorage.setItem('students', JSON.stringify(filtered));
  return true;
}

// دالة لتحديث بيانات الطالب
function updateStudent(studentId, name, classLevel) {
  const students = getAllStudents();
  const student = students.find(s => s.id === studentId);
  if (student) {
    student.name = name;
    student.class = classLevel;
    localStorage.setItem('students', JSON.stringify(students));
    return true;
  }
  return false;
}

// دالة لإرسال تقرير يومي بالبريد (محاكاة)
function sendDailyReport(email) {
  const today = new Date().toISOString().split('T')[0];
  const records = [];
  
  for (let key in localStorage) {
    if (key.startsWith('attendance_')) {
      const record = JSON.parse(localStorage[key]);
      if (record.date === today) {
        records.push(record);
      }
    }
  }

  // في بيئة الإنتاج، ستحتاج إلى خادم backend لإرسال البريد
  console.log(`تقرير يومي سيُرسل إلى: ${email}`);
  console.log(`عدد السجلات: ${records.length}`);
  
  // محاكاة إرسال البريد
  return {
    success: true,
    message: `تم إعداد التقرير. سيتم إرساله إلى ${email} عند ربط البريد الفعلي`,
    recordsCount: records.length
  };
}

// دالة لإنشاء نسخة احتياطية
function createBackup() {
  const backup = {
    timestamp: new Date().toISOString(),
    teachers: teachersDB,
    students: getAllStudents(),
    attendance: []
  };

  for (let key in localStorage) {
    if (key.startsWith('attendance_')) {
      backup.attendance.push(JSON.parse(localStorage[key]));
    }
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  return backup;
}

// دالة لاستعادة من نسخة احتياطية
function restoreBackup(backupData) {
  try {
    if (backupData.students) {
      localStorage.setItem('students', JSON.stringify(backupData.students));
    }
    if (backupData.attendance) {
      backupData.attendance.forEach((record, index) => {
        localStorage.setItem(`attendance_${index}_${Date.now()}`, JSON.stringify(record));
      });
    }
    return { success: true, message: 'تم استعادة النسخة الاحتياطية بنجاح' };
  } catch (error) {
    return { success: false, message: 'خطأ في استعادة النسخة الاحتياطية: ' + error.message };
  }
}

// دالة لإنشاء تقرير شهري/سنوي
function generateMonthlyReport(year, month) {
  const records = [];
  
  for (let key in localStorage) {
    if (key.startsWith('attendance_')) {
      const record = JSON.parse(localStorage[key]);
      const recordDate = new Date(record.date);
      if (recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month) {
        records.push(record);
      }
    }
  }

  // احسب الإحصائيات
  const stats = {
    totalRecords: records.length,
    presentCount: records.filter(r => r.status === 'present').length,
    absentCount: records.filter(r => r.status === 'absent').length,
    byTeacher: {},
    byStudent: {}
  };

  records.forEach(record => {
    // إحصائيات بالمعلم
    if (!stats.byTeacher[record.teacherCode]) {
      stats.byTeacher[record.teacherCode] = { present: 0, absent: 0 };
    }
    stats.byTeacher[record.teacherCode][record.status === 'present' ? 'present' : 'absent']++;

    // إحصائيات بالطالب
    if (!stats.byStudent[record.studentName]) {
      stats.byStudent[record.studentName] = { present: 0, absent: 0 };
    }
    stats.byStudent[record.studentName][record.status === 'present' ? 'present' : 'absent']++;
  });

  return {
    month: month,
    year: year,
    records: records,
    statistics: stats
  };
}
