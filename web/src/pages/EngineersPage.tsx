import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { engineersApi } from '../api/engineers';
import { groupsApi } from '../api/organizations';
import { gradesApi } from '../api/grades';
import type { Engineer, Group, AssignmentSchedule, GradeMaster } from '../types';

const EngineersPage: React.FC = () => {
  const { role } = useAuth();
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [gradeMasters, setGradeMasters] = useState<GradeMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Engineer>>({
    name: '', employeeNumber: '', email: '', phone: '', skillSet: '', experienceYears: undefined, experienceMonths: undefined, employmentStatus: 'ACTIVE', groupId: undefined, grade: undefined, subGrade: undefined,
  });
  const [editFormData, setEditFormData] = useState<Partial<Engineer>>({
    name: '', employeeNumber: '', email: '', phone: '', skillSet: '', experienceYears: undefined, experienceMonths: undefined, employmentStatus: 'ACTIVE', groupId: undefined, grade: undefined, subGrade: undefined,
  });
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentSchedule[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [showAllAssignments, setShowAllAssignments] = useState(false);

  useEffect(() => { loadEngineers(); }, []);

  const loadEngineers = async () => {
    try {
      setLoading(true);
      const [engData, groupData, gradeData] = await Promise.all([
        engineersApi.getAll(),
        groupsApi.getAll(),
        gradesApi.getAll(),
      ]);
      setEngineers(engData);
      setGroups(groupData);
      setGradeMasters(gradeData);
    } catch (err) {
      setError('エンジニアの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 等級から利用可能なサブ等級を取得
  const getAvailableSubGrades = (grade: number | undefined): string[] => {
    if (!grade) return [];
    return gradeMasters
      .filter(gm => gm.grade === grade)
      .map(gm => gm.subGrade);
  };

  // 選択された等級とサブ等級から原価を取得
  const getCostRate = (grade: number | undefined, subGrade: string | undefined): number | undefined => {
    if (!grade || !subGrade) return undefined;
    const gm = gradeMasters.find(g => g.grade === grade && g.subGrade === subGrade);
    return gm?.costRate;
  };

  // 選択された等級とサブ等級から等級名を取得
  const getGradeName = (grade: number | undefined, subGrade: string | undefined): string | undefined => {
    if (!grade || !subGrade) return undefined;
    const gm = gradeMasters.find(g => g.grade === grade && g.subGrade === subGrade);
    return gm?.name;
  };

  // サブ等級の日本語表示
  const getSubGradeLabel = (subGrade: string): string => {
    switch (subGrade) {
      case 'ENTRY': return 'エントリー';
      case 'MIDDLE': return 'ミドル';
      case 'HIGH': return 'ハイ';
      default: return subGrade;
    }
  };

  // 利用可能な等級の一覧を取得
  const availableGrades = useMemo(() => {
    const grades = [...new Set(gradeMasters.map(gm => gm.grade))];
    return grades.sort((a, b) => b - a);
  }, [gradeMasters]);

  const handleOpenModal = () => {
    setFormData({ name: '', employeeNumber: '', email: '', phone: '', skillSet: '', experienceYears: undefined, experienceMonths: undefined, employmentStatus: 'ACTIVE', groupId: undefined, grade: undefined, subGrade: undefined });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: '', employeeNumber: '', email: '', phone: '', skillSet: '', experienceYears: undefined, experienceMonths: undefined, employmentStatus: 'ACTIVE', groupId: undefined, grade: undefined, subGrade: undefined });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeNumber || !formData.name || !formData.employmentStatus) { setError('社員番号、名前、雇用状況は必須項目です'); return; }
    try {
      setSaving(true); setError('');
      await engineersApi.create(formData as Omit<Engineer, 'id'>);
      await loadEngineers();
      handleCloseModal();
    } catch (err) {
      setError('エンジニアの作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleRowClick = async (engineer: Engineer) => {
    setSelectedEngineer(engineer);
    setIsEditMode(false);
    setShowDetailModal(true);
    setShowAllAssignments(false);
    setAssignmentHistory([]);

    if (engineer.id) {
      setLoadingAssignments(true);
      try {
        const assignments = await engineersApi.getAssignments(engineer.id);
        setAssignmentHistory(assignments);
      } catch (err) {
        console.error('Failed to load assignment history:', err);
      } finally {
        setLoadingAssignments(false);
      }
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false); setSelectedEngineer(null); setIsEditMode(false); setShowDeleteConfirm(false); setError('');
    setAssignmentHistory([]); setShowAllAssignments(false);
  };

  const handleEditClick = () => {
    if (selectedEngineer) {
      setEditFormData({
        name: selectedEngineer.name, employeeNumber: selectedEngineer.employeeNumber || '',
        email: selectedEngineer.email || '', phone: selectedEngineer.phone || '',
        skillSet: selectedEngineer.skillSet || '', experienceYears: selectedEngineer.experienceYears || undefined,
        experienceMonths: selectedEngineer.experienceMonths || undefined,
        employmentStatus: selectedEngineer.employmentStatus || 'ACTIVE',
        groupId: selectedEngineer.groupId,
        grade: selectedEngineer.grade,
        subGrade: selectedEngineer.subGrade,
      });
      setIsEditMode(true); setError('');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.employeeNumber || !editFormData.name || !editFormData.employmentStatus) { setError('社員番号、名前、雇用状況は必須項目です'); return; }
    if (!selectedEngineer?.id) return;
    try {
      setSaving(true); setError('');
      await engineersApi.update(selectedEngineer.id, editFormData as Omit<Engineer, 'id'>);
      await loadEngineers();
      const updated = await engineersApi.getById(selectedEngineer.id);
      setSelectedEngineer(updated);
      setIsEditMode(false);
    } catch (err) {
      setError('エンジニアの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => { setShowDeleteConfirm(true); };

  const handleConfirmDelete = async () => {
    if (!selectedEngineer?.id) return;
    try {
      setSaving(true); setError('');
      await engineersApi.delete(selectedEngineer.id);
      await loadEngineers();
      handleCloseDetailModal();
    } catch (err) {
      setError('エンジニアの削除に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const getEmploymentStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '在籍中';
      case 'INACTIVE': return '退職';
      case 'ON_LEAVE': return '休職中';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'ON_LEAVE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // 参画履歴用ヘルパー関数
  const getRecentAssignments = (assignments: AssignmentSchedule[]) => {
    if (showAllAssignments) return assignments;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return assignments.filter(a => new Date(a.endDate) >= oneYearAgo || a.status === 'ACTIVE');
  };

  const formatPeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = `${start.getFullYear()}/${start.getMonth() + 1}`;
    const endStr = `${end.getFullYear()}/${end.getMonth() + 1}`;
    return `${startStr} - ${endStr}`;
  };

  const formatBillingRate = (rate?: number) => {
    if (!rate) return '-';
    return `¥${rate.toLocaleString()}`;
  };

  const getAssignmentStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return { label: '稼働中', class: 'bg-green-100 text-green-800' };
      case 'PLANNED': return { label: '予定', class: 'bg-blue-100 text-blue-800' };
      case 'COMPLETED': return { label: '終了', class: 'bg-gray-100 text-gray-800' };
      default: return { label: status, class: 'bg-gray-100 text-gray-800' };
    }
  };

  const getBillingRateSummary = (assignments: AssignmentSchedule[]) => {
    const rates = assignments.filter(a => a.billingRate).map(a => a.billingRate!);
    if (rates.length === 0) return null;
    const latest = assignments.find(a => a.billingRate)?.billingRate;
    const max = Math.max(...rates);
    return { latest, max };
  };

  // 雇用状況別カウント
  const statusCounts = {
    ALL: engineers.length,
    ACTIVE: engineers.filter((e) => e.employmentStatus === 'ACTIVE').length,
    INACTIVE: engineers.filter((e) => e.employmentStatus === 'INACTIVE').length,
    ON_LEAVE: engineers.filter((e) => e.employmentStatus === 'ON_LEAVE').length,
  };

  // フィルタされたエンジニアリスト
  const filteredEngineers = statusFilter === 'ALL'
    ? engineers
    : engineers.filter((e) => e.employmentStatus === statusFilter);

  // ソート関数（経験年数の特殊処理対応）
  const sortEngineers = (
    data: Engineer[],
    key: string,
    direction: 'asc' | 'desc'
  ): Engineer[] => {
    if (!key) return data;
    return [...data].sort((a, b) => {
      let cmp = 0;
      if (key === 'experienceYears') {
        // 経験年数は年+月を月数に変換して比較
        const aMonths = ((a.experienceYears || 0) * 12) + (a.experienceMonths || 0);
        const bMonths = ((b.experienceYears || 0) * 12) + (b.experienceMonths || 0);
        if (aMonths === 0 && bMonths === 0) return 0;
        if (aMonths === 0) return 1;
        if (bMonths === 0) return -1;
        cmp = aMonths - bMonths;
      } else {
        const aVal = a[key as keyof Engineer], bVal = b[key as keyof Engineer];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          cmp = aVal - bVal;
        } else {
          cmp = String(aVal).localeCompare(String(bVal), 'ja');
        }
      }
      return direction === 'asc' ? cmp : -cmp;
    });
  };

  // ソートハンドラ
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // ソート済みデータ
  const sortedEngineers = sortEngineers(filteredEngineers, sortKey, sortDirection);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="skeleton h-8 w-40 rounded-lg mb-2" />
            <div className="skeleton h-4 w-48 rounded" />
          </div>
          <div className="skeleton h-10 w-28 rounded-lg" />
        </div>
        <div className="card overflow-hidden">
          <div className="skeleton h-12 w-full" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-16 w-full" style={{ marginTop: 1 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error && !showModal && !showDetailModal) {
    return (
      <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'var(--color-danger-light)', border: '1px solid #fecaca' }}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-danger)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm" style={{ color: '#991b1b' }}>{error}</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-navy-900)', fontFamily: 'Outfit, sans-serif' }}>エンジニア一覧</h1>
          <p style={{ color: 'var(--color-slate-500)' }}>
            全{statusCounts.ALL}名（在籍中: {statusCounts.ACTIVE}名、退職: {statusCounts.INACTIVE}名、休職中: {statusCounts.ON_LEAVE}名）
          </p>
        </div>
        {role === 'ROLE_ADMIN' && (
          <button
            onClick={handleOpenModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            新規作成
          </button>
        )}
      </div>

      {/* 雇用状況フィルタ */}
      <div className="flex gap-2 mb-4">
        {(['ALL', 'ACTIVE', 'INACTIVE', 'ON_LEAVE'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'ALL' ? 'すべて' : getEmploymentStatusLabel(status)} ({statusCounts[status]})
          </button>
        ))}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('employeeNumber')}
              >
                社員番号
                <span className="ml-1 text-gray-400">
                  {sortKey === 'employeeNumber' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('name')}
              >
                名前
                <span className="ml-1 text-gray-400">
                  {sortKey === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('groupName')}
              >
                所属
                <span className="ml-1 text-gray-400">
                  {sortKey === 'groupName' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('skillSet')}
              >
                スキルセット
                <span className="ml-1 text-gray-400">
                  {sortKey === 'skillSet' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('experienceYears')}
              >
                経験年数
                <span className="ml-1 text-gray-400">
                  {sortKey === 'experienceYears' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('employmentStatus')}
              >
                雇用状況
                <span className="ml-1 text-gray-400">
                  {sortKey === 'employmentStatus' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedEngineers.map((engineer) => (
              <tr key={engineer.id} onClick={() => handleRowClick(engineer)} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{engineer.employeeNumber || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{engineer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {engineer.departmentName && engineer.groupName
                    ? `${engineer.departmentName} / ${engineer.groupName}`
                    : engineer.groupName || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">{engineer.skillSet || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {engineer.experienceYears || engineer.experienceMonths
                    ? `${engineer.experienceYears || 0}年${engineer.experienceMonths || 0}ヶ月`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(engineer.employmentStatus || '')}`}>
                    {engineer.employmentStatus ? getEmploymentStatusLabel(engineer.employmentStatus) : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedEngineers.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--color-slate-500)' }}>
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p>{statusFilter === 'ALL' ? 'エンジニアがいません' : `${getEmploymentStatusLabel(statusFilter)}のエンジニアはいません`}</p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEngineer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCloseDetailModal}>
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-navy-900)', fontFamily: 'Outfit, sans-serif' }}>
                {isEditMode ? 'エンジニア編集' : 'エンジニア詳細'}
              </h2>
              {!isEditMode && role === 'ROLE_ADMIN' && (
                <div className="flex gap-3">
                  <button onClick={handleDeleteClick} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">削除</button>
                  <button onClick={handleEditClick} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">編集</button>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'var(--color-danger-light)', border: '1px solid #fecaca' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-danger)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm" style={{ color: '#991b1b' }}>{error}</span>
              </div>
            )}

            {!isEditMode ? (
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-slate-50)' }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-slate-600)' }}>基本情報</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>名前</p>
                      <p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>{selectedEngineer.name}</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>社員番号</p>
                      <p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>{selectedEngineer.employeeNumber || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>所属</p>
                      <p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>
                        {selectedEngineer.departmentName && selectedEngineer.groupName
                          ? `${selectedEngineer.departmentName} / ${selectedEngineer.groupName}`
                          : selectedEngineer.groupName || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>経験年数</p>
                      <p className="font-medium font-number" style={{ color: 'var(--color-slate-900)', fontFamily: 'Outfit, sans-serif' }}>
                        {selectedEngineer.experienceYears || selectedEngineer.experienceMonths
                          ? `${selectedEngineer.experienceYears || 0}年${selectedEngineer.experienceMonths || 0}ヶ月`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>雇用状況</p>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedEngineer.employmentStatus || '')}`}>
                        {selectedEngineer.employmentStatus ? getEmploymentStatusLabel(selectedEngineer.employmentStatus) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-slate-50)' }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-slate-600)' }}>連絡先情報</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>メールアドレス</p>
                      <p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>{selectedEngineer.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>電話番号</p>
                      <p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>{selectedEngineer.phone || '-'}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-slate-50)' }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-slate-600)' }}>スキル情報</h3>
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>スキルセット</p>
                    <p className="whitespace-pre-wrap" style={{ color: 'var(--color-slate-700)' }}>{selectedEngineer.skillSet || '-'}</p>
                  </div>
                </div>

                {/* 等級情報 */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-slate-50)' }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-slate-600)' }}>等級情報</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>等級</p>
                      <p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>
                        {selectedEngineer.grade
                          ? `${selectedEngineer.grade}等級${selectedEngineer.subGrade ? ` (${getSubGradeLabel(selectedEngineer.subGrade)})` : ''}`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>等級名</p>
                      <p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>
                        {selectedEngineer.gradeName || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>原価</p>
                      <p className="font-medium font-number" style={{ color: 'var(--color-slate-900)', fontFamily: 'Outfit, sans-serif' }}>
                        {selectedEngineer.costRate ? `¥${selectedEngineer.costRate.toLocaleString()}` : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 参画履歴セクション */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-slate-50)' }}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-slate-600)' }}>
                      参画履歴 ({assignmentHistory.length}件)
                    </h3>
                    {assignmentHistory.length > getRecentAssignments(assignmentHistory).length && !showAllAssignments && (
                      <button
                        onClick={() => setShowAllAssignments(true)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        すべて表示
                      </button>
                    )}
                    {showAllAssignments && (
                      <button
                        onClick={() => setShowAllAssignments(false)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        直近1年のみ表示
                      </button>
                    )}
                  </div>

                  {loadingAssignments ? (
                    <div className="text-center py-4">
                      <p className="text-sm" style={{ color: 'var(--color-slate-500)' }}>読み込み中...</p>
                    </div>
                  ) : assignmentHistory.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm" style={{ color: 'var(--color-slate-500)' }}>参画履歴がありません</p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-64 overflow-y-auto space-y-3">
                        {getRecentAssignments(assignmentHistory).map((assignment) => {
                          const statusBadge = getAssignmentStatusBadge(assignment.status);
                          return (
                            <div
                              key={assignment.assignmentId}
                              className="p-3 bg-white rounded-lg border"
                              style={{ borderColor: 'var(--color-slate-200)' }}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium" style={{ color: 'var(--color-slate-900)' }}>
                                    {assignment.projectName}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${statusBadge.class}`}>
                                    {statusBadge.label}
                                  </span>
                                </div>
                                <span className="font-medium font-number" style={{ color: 'var(--color-slate-900)', fontFamily: 'Outfit, sans-serif' }}>
                                  {formatBillingRate(assignment.billingRate)}
                                </span>
                              </div>
                              <div className="text-sm" style={{ color: 'var(--color-slate-500)' }}>
                                {assignment.customerName && <span>{assignment.customerName}</span>}
                                {assignment.customerName && assignment.role && <span> / </span>}
                                {assignment.role && <span>{assignment.role}</span>}
                              </div>
                              <div className="text-xs mt-1 font-number" style={{ color: 'var(--color-slate-400)', fontFamily: 'Outfit, sans-serif' }}>
                                {formatPeriod(assignment.startDate, assignment.endDate)}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 単価推移サマリー */}
                      {getBillingRateSummary(assignmentHistory) && (
                        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-slate-200)' }}>
                          <p className="text-xs mb-2" style={{ color: 'var(--color-slate-500)' }}>単価推移</p>
                          <div className="flex gap-6">
                            <div>
                              <span className="text-xs" style={{ color: 'var(--color-slate-500)' }}>最新単価: </span>
                              <span className="font-medium font-number" style={{ color: 'var(--color-slate-900)', fontFamily: 'Outfit, sans-serif' }}>
                                {formatBillingRate(getBillingRateSummary(assignmentHistory)?.latest)}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs" style={{ color: 'var(--color-slate-500)' }}>最高単価: </span>
                              <span className="font-medium font-number" style={{ color: 'var(--color-slate-900)', fontFamily: 'Outfit, sans-serif' }}>
                                {formatBillingRate(getBillingRateSummary(assignmentHistory)?.max)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button onClick={handleCloseDetailModal} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">閉じる</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>名前 <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>社員番号 <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input type="text" value={editFormData.employeeNumber} onChange={(e) => setEditFormData({ ...editFormData, employeeNumber: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>所属グループ</label>
                  <select value={editFormData.groupId || ''} onChange={(e) => setEditFormData({ ...editFormData, groupId: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">未所属</option>
                    {groups.map(g => (<option key={g.id} value={g.id}>{g.departmentName ? `${g.departmentName} / ${g.name}` : g.name}</option>))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>メールアドレス</label>
                    <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>電話番号</label>
                    <input type="tel" value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>スキルセット</label>
                  <textarea value={editFormData.skillSet} onChange={(e) => setEditFormData({ ...editFormData, skillSet: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>経験年数</label>
                  <div className="flex gap-2 items-center">
                    <input type="number" value={editFormData.experienceYears || ''} onChange={(e) => setEditFormData({ ...editFormData, experienceYears: e.target.value ? parseInt(e.target.value) : undefined })} min="0" className="w-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <span style={{ color: 'var(--color-slate-700)' }}>年</span>
                    <input type="number" value={editFormData.experienceMonths || ''} onChange={(e) => setEditFormData({ ...editFormData, experienceMonths: e.target.value ? parseInt(e.target.value) : undefined })} min="0" max="11" className="w-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <span style={{ color: 'var(--color-slate-700)' }}>ヶ月</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>雇用状況 <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <select value={editFormData.employmentStatus} onChange={(e) => setEditFormData({ ...editFormData, employmentStatus: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="ACTIVE">在籍中</option>
                    <option value="INACTIVE">退職</option>
                    <option value="ON_LEAVE">休職中</option>
                  </select>
                </div>
                <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-slate-200)', backgroundColor: 'var(--color-slate-50)' }}>
                  <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-slate-700)' }}>等級情報</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>等級</label>
                      <select
                        value={editFormData.grade || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value ? parseInt(e.target.value) : undefined, subGrade: undefined })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">未設定</option>
                        {availableGrades.map(g => (
                          <option key={g} value={g}>{g}等級</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>サブ等級</label>
                      <select
                        value={editFormData.subGrade || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, subGrade: e.target.value || undefined })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!editFormData.grade}
                      >
                        <option value="">選択してください</option>
                        {getAvailableSubGrades(editFormData.grade).map(sg => (
                          <option key={sg} value={sg}>{getSubGradeLabel(sg)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {editFormData.grade && editFormData.subGrade && (
                    <div className="mt-3 p-3 bg-white rounded-lg border" style={{ borderColor: 'var(--color-slate-200)' }}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm" style={{ color: 'var(--color-slate-500)' }}>等級名: </span>
                          <span className="font-medium" style={{ color: 'var(--color-slate-900)' }}>
                            {getGradeName(editFormData.grade, editFormData.subGrade) || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm" style={{ color: 'var(--color-slate-500)' }}>原価: </span>
                          <span className="font-medium font-number" style={{ color: 'var(--color-slate-900)', fontFamily: 'Outfit, sans-serif' }}>
                            {getCostRate(editFormData.grade, editFormData.subGrade)
                              ? `¥${getCostRate(editFormData.grade, editFormData.subGrade)!.toLocaleString()}`
                              : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsEditMode(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50" disabled={saving}>キャンセル</button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" disabled={saving}>{saving ? '更新中...' : '更新'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && selectedEngineer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-navy-900)', fontFamily: 'Outfit, sans-serif' }}>エンジニアの削除</h3>
            <p className="mb-1" style={{ color: 'var(--color-slate-600)' }}>本当にこのエンジニアを削除しますか？</p>
            <p className="font-semibold mb-6" style={{ color: 'var(--color-slate-900)' }}>{selectedEngineer.name}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50" disabled={saving}>キャンセル</button>
              <button onClick={handleConfirmDelete} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700" disabled={saving}>{saving ? '削除中...' : '削除'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCloseModal}>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-navy-900)', fontFamily: 'Outfit, sans-serif' }}>エンジニア新規作成</h2>
              <button onClick={handleCloseModal} className="p-2 rounded-lg transition-colors hover:bg-slate-100" style={{ color: 'var(--color-slate-500)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'var(--color-danger-light)', border: '1px solid #fecaca' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-danger)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm" style={{ color: '#991b1b' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>名前 <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>社員番号 <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input type="text" value={formData.employeeNumber} onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>所属グループ</label>
                <select value={formData.groupId || ''} onChange={(e) => setFormData({ ...formData, groupId: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">未所属</option>
                  {groups.map(g => (<option key={g.id} value={g.id}>{g.departmentName ? `${g.departmentName} / ${g.name}` : g.name}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>メールアドレス</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>電話番号</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>スキルセット</label>
                <textarea value={formData.skillSet} onChange={(e) => setFormData({ ...formData, skillSet: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>経験年数</label>
                <div className="flex gap-2 items-center">
                  <input type="number" value={formData.experienceYears || ''} onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value ? parseInt(e.target.value) : undefined })} min="0" className="w-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span style={{ color: 'var(--color-slate-700)' }}>年</span>
                  <input type="number" value={formData.experienceMonths || ''} onChange={(e) => setFormData({ ...formData, experienceMonths: e.target.value ? parseInt(e.target.value) : undefined })} min="0" max="11" className="w-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span style={{ color: 'var(--color-slate-700)' }}>ヶ月</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>雇用状況 <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <select value={formData.employmentStatus} onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="ACTIVE">在籍中</option>
                  <option value="INACTIVE">退職</option>
                  <option value="ON_LEAVE">休職中</option>
                </select>
              </div>
              <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-slate-200)', backgroundColor: 'var(--color-slate-50)' }}>
                <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-slate-700)' }}>等級情報</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>等級</label>
                    <select
                      value={formData.grade || ''}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value ? parseInt(e.target.value) : undefined, subGrade: undefined })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">未設定</option>
                      {availableGrades.map(g => (
                        <option key={g} value={g}>{g}等級</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>サブ等級</label>
                    <select
                      value={formData.subGrade || ''}
                      onChange={(e) => setFormData({ ...formData, subGrade: e.target.value || undefined })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!formData.grade}
                    >
                      <option value="">選択してください</option>
                      {getAvailableSubGrades(formData.grade).map(sg => (
                        <option key={sg} value={sg}>{getSubGradeLabel(sg)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {formData.grade && formData.subGrade && (
                  <div className="mt-3 p-3 bg-white rounded-lg border" style={{ borderColor: 'var(--color-slate-200)' }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm" style={{ color: 'var(--color-slate-500)' }}>等級名: </span>
                        <span className="font-medium" style={{ color: 'var(--color-slate-900)' }}>
                          {getGradeName(formData.grade, formData.subGrade) || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm" style={{ color: 'var(--color-slate-500)' }}>原価: </span>
                        <span className="font-medium font-number" style={{ color: 'var(--color-slate-900)', fontFamily: 'Outfit, sans-serif' }}>
                          {getCostRate(formData.grade, formData.subGrade)
                            ? `¥${getCostRate(formData.grade, formData.subGrade)!.toLocaleString()}`
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50" disabled={saving}>キャンセル</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" disabled={saving}>{saving ? '作成中...' : '作成'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineersPage;
