import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileSpreadsheet,
  FileDown,
  Printer,
  Sparkles,
  Filter,
  CheckCheck,
  Search,
  School,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AttendanceRecord, AttendanceStatus, Student, StudentClass, User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AttendanceViewProps {
  currentUser: User;
  students: Student[];
  allAttendance: AttendanceRecord[];
  onRefreshAttendance: () => Promise<void>;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  currentUser,
  students,
  allAttendance,
  onRefreshAttendance,
}) => {
  const isTeacher = currentUser.role === 'admin' || currentUser.role === 'teacher';

  const [activeSubTab, setActiveSubTab] = useState<'input' | 'recap'>('input');

  // Input Attendance Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedClass, setSelectedClass] = useState<StudentClass>('Kelompok B2');

  // Working state for each student on selectedDate & selectedClass
  const [attendanceMap, setAttendanceMap] = useState<{
    [studentId: string]: { status: AttendanceStatus; note: string };
  }>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Recap Filter State
  const [recapStartDate, setRecapStartDate] = useState<string>(
    new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  );
  const [recapEndDate, setRecapEndDate] = useState<string>(todayStr);
  const [recapClass, setRecapClass] = useState<string>('Semua');
  const [recapStudentSearch, setRecapStudentSearch] = useState<string>('');
  const [recapData, setRecapData] = useState<{
    summary: { total: number; hadir: number; izin: number; sakit: number; alpa: number };
    byStudent: Array<{ studentId: string; studentName: string; class: string; hadir: number; izin: number; sakit: number; alpa: number; total: number }>;
    records: AttendanceRecord[];
  } | null>(null);
  const [loadingRecap, setLoadingRecap] = useState(false);

  // Students in currently selected class sorted alphabetically
  const classStudents = students
    .filter(s => s.class === selectedClass && s.status === 'Aktif')
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id'));

  // Current parent's child if parent role
  const parentStudent = currentUser.studentId
    ? students.find(s => s.id === currentUser.studentId)
    : students[0];

  // Load existing records into attendanceMap when date or class changes
  useEffect(() => {
    const existingForDay = allAttendance.filter(r => r.date === selectedDate && r.class === selectedClass);
    const map: { [id: string]: { status: AttendanceStatus; note: string } } = {};

    classStudents.forEach(st => {
      const match = existingForDay.find(r => r.studentId === st.id);
      if (match) {
        map[st.id] = { status: match.status, note: match.note || '' };
      } else {
        // default to Hadir
        map[st.id] = { status: 'Hadir', note: '' };
      }
    });

    setAttendanceMap(map);
  }, [selectedDate, selectedClass, allAttendance, students]);

  // Fetch recap when recap tab or recap filters change
  const fetchRecap = async () => {
    setLoadingRecap(true);
    try {
      const studentIdParam = !isTeacher && parentStudent ? parentStudent.id : undefined;
      const res = await api.getAttendanceRecap({
        startDate: recapStartDate,
        endDate: recapEndDate,
        class: recapClass !== 'Semua' ? recapClass : undefined,
        studentId: studentIdParam,
      });
      setRecapData(res);
    } catch (e) {
      console.error('Failed to load attendance recap:', e);
    } finally {
      setLoadingRecap(false);
    }
  };

  useEffect(() => {
    fetchRecap();
  }, [recapStartDate, recapEndDate, recapClass, isTeacher]);

  // Action: [Semua Hadir]
  const handleMarkAllPresent = () => {
    const nextMap = { ...attendanceMap };
    classStudents.forEach(st => {
      nextMap[st.id] = { ...nextMap[st.id], status: 'Hadir' };
    });
    setAttendanceMap(nextMap);
  };

  // Action: Toggle individual student status
  const handleSetStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  // Action: Update note
  const handleSetStudentNote = (studentId: string, note: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], note },
    }));
  };

  // Action: Save Attendance
  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const payload: Partial<AttendanceRecord>[] = classStudents.map(st => ({
        studentId: st.id,
        studentName: st.name,
        class: selectedClass,
        date: selectedDate,
        status: attendanceMap[st.id]?.status || 'Hadir',
        note: attendanceMap[st.id]?.note || '',
      }));

      await api.saveAttendanceBulk(payload);
      await onRefreshAttendance();
      await fetchRecap();

      // Confetti celebration!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Action: Export CSV
  const handleExportCsv = () => {
    if (!recapData) return;

    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'TK DWP KEDANYANG - REKAP PRESENSI SISWA SAKIRA\n';
    csvContent += `Periode: ${recapStartDate} s/d ${recapEndDate}\n`;
    csvContent += `Kelas: ${recapClass}\n\n`;

    csvContent += 'No,Nama Siswa,Kelas,Hadir,Izin,Sakit,Alpa,Total Hari,Persentase Hadir\n';

    recapData.byStudent.forEach((s, idx) => {
      const rate = s.total > 0 ? ((s.hadir / s.total) * 100).toFixed(1) + '%' : '0%';
      csvContent += `${idx + 1},"${s.studentName}","${s.class}",${s.hadir},${s.izin},${s.sakit},${s.alpa},${s.total},${rate}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Presensi_TK_DWP_Kedanyang_${selectedClass}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Action: Export Excel XML
  const handleExportExcel = () => {
    if (!recapData) return;

    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Presensi Siswa</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
      <body>
        <h2>TK DWP KEDANYANG - LAPORAN PRESENSI SAKIRA</h2>
        <p>Periode: ${recapStartDate} s/d ${recapEndDate} | Dicetak: ${new Date().toLocaleDateString('id-ID')}</p>
        <table border="1">
          <tr style="background-color: #fef08a; font-weight: bold;">
            <th>No</th>
            <th>Nama Siswa</th>
            <th>Kelas</th>
            <th>Hadir</th>
            <th>Izin</th>
            <th>Sakit</th>
            <th>Alpa</th>
            <th>Total Kehadiran</th>
            <th>Persentase</th>
          </tr>
          ${recapData.byStudent.map((s, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${s.studentName}</td>
              <td>${s.class}</td>
              <td>${s.hadir}</td>
              <td>${s.izin}</td>
              <td>${s.sakit}</td>
              <td>${s.alpa}</td>
              <td>${s.total}</td>
              <td>${s.total > 0 ? Math.round((s.hadir / s.total) * 100) : 0}%</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Presensi_TK_DWP_Kedanyang_${todayStr}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="cartoon-card p-6 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white border-emerald-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-2">
              <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>PRESENSI & KEDISIPLINAN SISWA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              Presensi Siswa TK DWP Kedanyang
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Catatan kehadiran harian ceria, pemantauan kesehatan siswa (izin/sakit), rekapitulasi statistik kehadiran, dan ekspor data resmi.
            </p>
          </div>

          {/* Sub tabs: Input vs Rekap */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto no-print">
            {isTeacher && (
              <button
                onClick={() => setActiveSubTab('input')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activeSubTab === 'input'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✏️ Input Presensi
              </button>
            )}

            <button
              onClick={() => setActiveSubTab('recap')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeSubTab === 'recap' || !isTeacher
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 Rekap & Laporan
            </button>
          </div>
        </div>
      </div>

      {/* INPUT PRESENSI TAB (GURU ONLY) */}
      {activeSubTab === 'input' && isTeacher && (
        <div className="space-y-6">
          
          {/* Controls: Date, Class, Quick Action */}
          <div className="cartoon-card p-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 border-emerald-200">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              
              {/* Date selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Pilih Tanggal:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="p-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50"
                />
              </div>

              {/* Class selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Pilih Kelompok Kelas:
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value as StudentClass)}
                  className="p-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50"
                >
                  <option value="Kelompok A">Kelompok A (4-5 Tahun)</option>
                  <option value="Kelompok B1">Kelompok B1 (5-6 Tahun)</option>
                  <option value="Kelompok B2">Kelompok B2 (5-6 Tahun)</option>
                  <option value="Kelompok B3">Kelompok B3 (5-6 Tahun)</option>
                </select>
              </div>

              {/* Total students in class */}
              <div className="self-end pb-1 text-xs text-slate-500 font-medium hidden md:block">
                <span>Total: </span>
                <span className="font-extrabold text-slate-800">{classStudents.length} Siswa</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="cartoon-button-secondary py-2 px-3.5 text-xs flex items-center gap-1.5"
                title="Tandai semua siswa dalam kelompok ini Hadir"
              >
                <CheckCheck className="w-4 h-4 text-amber-900" />
                <span>Semua Hadir 🟢</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={saving}
                className="cartoon-button-green py-2 px-4 text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Presensi'}</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
              <span>Presensi {selectedClass} untuk tanggal {selectedDate} berhasil disimpan ke database!</span>
            </div>
          )}

          {/* Student Presence Table */}
          <div className="cartoon-card overflow-hidden border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-black uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 w-12 text-center">No</th>
                    <th className="p-3.5">Nama Siswa</th>
                    <th className="p-3.5">NIS</th>
                    <th className="p-3.5 text-center">Status Kehadiran</th>
                    <th className="p-3.5">Catatan / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Tidak ada siswa aktif di kelas {selectedClass}.
                      </td>
                    </tr>
                  ) : (
                    classStudents.map((st, idx) => {
                      const cur = attendanceMap[st.id] || { status: 'Hadir', note: '' };

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                          
                          <td className="p-3.5 font-extrabold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-xs">
                                {st.gender === 'P' ? '👧' : '👦'}
                              </span>
                              {st.name ? (
                                <span>{st.name}</span>
                              ) : (
                                <span className="text-amber-700 italic font-medium">
                                  Siswa {idx + 1} (Belum Diisi)
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                            {st.studentNumber}
                          </td>

                          {/* 4 Status Toggle Buttons */}
                          <td className="p-3.5 text-center">
                            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl gap-1">
                              
                              {/* Hadir */}
                              <button
                                type="button"
                                onClick={() => handleSetStudentStatus(st.id, 'Hadir')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                                  cur.status === 'Hadir'
                                    ? 'bg-emerald-500 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <span>🟢</span>
                                <span>Hadir</span>
                              </button>

                              {/* Izin */}
                              <button
                                type="button"
                                onClick={() => handleSetStudentStatus(st.id, 'Izin')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                                  cur.status === 'Izin'
                                    ? 'bg-amber-400 text-amber-950 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <span>🟡</span>
                                <span>Izin</span>
                              </button>

                              {/* Sakit */}
                              <button
                                type="button"
                                onClick={() => handleSetStudentStatus(st.id, 'Sakit')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                                  cur.status === 'Sakit'
                                    ? 'bg-sky-500 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <span>🔵</span>
                                <span>Sakit</span>
                              </button>

                              {/* Alpa */}
                              <button
                                type="button"
                                onClick={() => handleSetStudentStatus(st.id, 'Alpa')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                                  cur.status === 'Alpa'
                                    ? 'bg-rose-500 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <span>🔴</span>
                                <span>Alpa</span>
                              </button>
                            </div>
                          </td>

                          {/* Note input */}
                          <td className="p-3.5">
                            <input
                              type="text"
                              value={cur.note}
                              onChange={(e) => handleSetStudentNote(st.id, e.target.value)}
                              placeholder="Keterangan sakit / alasan izin..."
                              className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
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

      {/* REKAP & LAPORAN PRESENSI (STATISTIK, GRAFIK, EXPORT) */}
      {(activeSubTab === 'recap' || !isTeacher) && (
        <div className="space-y-6">
          
          {/* Printable Official Letterhead */}
          <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-4">
            <h2 className="text-xl font-bold uppercase">TK DWP KEDANYANG</h2>
            <p className="text-xs">Saku Kreatif Interaktif Ramah Anak (SAKIRA DIGITAL)</p>
            <p className="text-xs italic">Kedanyang, Kebomas, Gresik, Jawa Timur - "Growing with Knowledge"</p>
            <h3 className="text-sm font-bold mt-2 uppercase underline">REKAPITULASI LAPORAN KEHADIRAN SISWA</h3>
            <p className="text-xs">Periode: {recapStartDate} s/d {recapEndDate}</p>
          </div>

          {/* Filters Bar (No Print) */}
          <div className="cartoon-card p-4 bg-white flex flex-wrap items-center justify-between gap-4 text-xs no-print">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-extrabold text-slate-700 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Filter Laporan:</span>
              </span>

              {/* Start Date */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold mr-1">Dari:</span>
                <input
                  type="date"
                  value={recapStartDate}
                  onChange={(e) => setRecapStartDate(e.target.value)}
                  className="p-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50"
                />
              </div>

              {/* End Date */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold mr-1">Sampai:</span>
                <input
                  type="date"
                  value={recapEndDate}
                  onChange={(e) => setRecapEndDate(e.target.value)}
                  className="p-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50"
                />
              </div>

              {/* Class Filter */}
              {isTeacher && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold mr-1">Kelas:</span>
                  <select
                    value={recapClass}
                    onChange={(e) => setRecapClass(e.target.value)}
                    className="p-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50"
                  >
                    <option value="Semua">Semua Kelas</option>
                    <option value="Kelompok A">Kelompok A</option>
                    <option value="Kelompok B1">Kelompok B1</option>
                    <option value="Kelompok B2">Kelompok B2</option>
                    <option value="Kelompok B3">Kelompok B3</option>
                  </select>
                </div>
              )}
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 text-xs font-bold text-sky-800 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <FileDown className="w-4 h-4 text-sky-700" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak</span>
              </button>
            </div>
          </div>

          {/* Summary Stat Cards */}
          {recapData && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              
              <div className="cartoon-card p-4 border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-400 block">Total Presensi</span>
                <span className="text-2xl font-black text-slate-900 font-display">
                  {recapData.summary.total}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Entri Catatan</span>
              </div>

              <div className="cartoon-card p-4 border-emerald-200 bg-emerald-50/50 text-center">
                <span className="text-[11px] font-bold text-emerald-700 block">🟢 Hadir</span>
                <span className="text-2xl font-black text-emerald-900 font-display">
                  {recapData.summary.hadir}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  {recapData.summary.total > 0
                    ? `${Math.round((recapData.summary.hadir / recapData.summary.total) * 100)}% Kehadiran`
                    : '0%'}
                </span>
              </div>

              <div className="cartoon-card p-4 border-amber-200 bg-amber-50/50 text-center">
                <span className="text-[11px] font-bold text-amber-700 block">🟡 Izin</span>
                <span className="text-2xl font-black text-amber-900 font-display">
                  {recapData.summary.izin}
                </span>
                <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">Anak Izin</span>
              </div>

              <div className="cartoon-card p-4 border-sky-200 bg-sky-50/50 text-center">
                <span className="text-[11px] font-bold text-sky-700 block">🔵 Sakit</span>
                <span className="text-2xl font-black text-sky-900 font-display">
                  {recapData.summary.sakit}
                </span>
                <span className="text-[10px] text-sky-600 font-semibold block mt-0.5">Perlu Istirahat</span>
              </div>

              <div className="cartoon-card p-4 border-rose-200 bg-rose-50/50 text-center col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-rose-700 block">🔴 Alpa</span>
                <span className="text-2xl font-black text-rose-900 font-display">
                  {recapData.summary.alpa}
                </span>
                <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">Tanpa Keterangan</span>
              </div>

            </div>
          )}

          {/* Student Breakdown Table */}
          <div className="cartoon-card overflow-hidden border-slate-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <span>📋</span>
                <span>Rekapitulasi Kehadiran Per Siswa</span>
              </h3>
              <div className="text-xs text-slate-500 font-medium">
                {recapData?.byStudent.length || 0} Siswa Terdaftar
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-white text-slate-500 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-10 text-center">No</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3 text-center text-emerald-700">🟢 Hadir</th>
                    <th className="p-3 text-center text-amber-700">🟡 Izin</th>
                    <th className="p-3 text-center text-sky-700">🔵 Sakit</th>
                    <th className="p-3 text-center text-rose-700">🔴 Alpa</th>
                    <th className="p-3 text-center">Tingkat Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!recapData || recapData.byStudent.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Belum ada data presensi pada rentang tanggal ini.
                      </td>
                    </tr>
                  ) : (
                    recapData.byStudent.map((s, idx) => {
                      const rate = s.total > 0 ? Math.round((s.hadir / s.total) * 100) : 0;

                      return (
                        <tr key={s.studentId} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                          
                          <td className="p-3 font-extrabold text-slate-800">
                            {s.studentName || `Siswa ${idx + 1} (Belum Diisi)`}
                          </td>

                          <td className="p-3 text-slate-500 font-semibold">{s.class}</td>

                          <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">
                            {s.hadir}
                          </td>
                          <td className="p-3 text-center font-bold text-amber-700 bg-amber-50/30">
                            {s.izin}
                          </td>
                          <td className="p-3 text-center font-bold text-sky-700 bg-sky-50/30">
                            {s.sakit}
                          </td>
                          <td className="p-3 text-center font-bold text-rose-700 bg-rose-50/30">
                            {s.alpa}
                          </td>

                          {/* Progress bar of attendance rate */}
                          <td className="p-3">
                            <div className="flex items-center gap-2 max-w-[140px] mx-auto">
                              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    rate >= 80 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${rate}%` }}
                                ></div>
                              </div>
                              <span className="font-extrabold text-[11px] text-slate-800 w-9 text-right">
                                {rate}%
                              </span>
                            </div>
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

    </div>
  );
};
