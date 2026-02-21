import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { departmentsApi, groupsApi } from '../api/organizations';
import { engineersApi } from '../api/engineers';
import type { Department, Group, Engineer } from '../types';

const OrganizationsPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'ROLE_ADMIN';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<'departments' | 'groups'>('departments');

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showDeptDetailModal, setShowDeptDetailModal] = useState(false);
  const [showGroupDetailModal, setShowGroupDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'department' | 'group'; id: number; name: string } | null>(null);

  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedMember, setSelectedMember] = useState<Engineer | null>(null);
  const [showMemberDetailModal, setShowMemberDetailModal] = useState(false);
  const [groupMembers, setGroupMembers] = useState<Engineer[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [deptForm, setDeptForm] = useState<Partial<Department>>({ code: '', name: '', description: '', displayOrder: 0, isActive: true, directorId: undefined });
  const [groupForm, setGroupForm] = useState<Partial<Group>>({ departmentId: 0, code: '', name: '', description: '', leaderId: undefined, displayOrder: 0, isActive: true });

  // 部テーブル用のソート状態
  const [deptSortKey, setDeptSortKey] = useState<string>('');
  const [deptSortDirection, setDeptSortDirection] = useState<'asc' | 'desc'>('asc');
  // グループテーブル用のソート状態
  const [groupSortKey, setGroupSortKey] = useState<string>('');
  const [groupSortDirection, setGroupSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptData, groupData, engData] = await Promise.all([
        departmentsApi.getAll(true),
        groupsApi.getAll(),
        engineersApi.getAll(),
      ]);
      setDepartments(deptData);
      setGroups(groupData);
      setEngineers(engData);
    } catch (err) {
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.code || !deptForm.name) { setError('コードと名前は必須です'); return; }
    try {
      setSaving(true); setError('');
      await departmentsApi.create(deptForm as Omit<Department, 'id' | 'groups'>);
      await loadData();
      setShowDeptModal(false);
      setDeptForm({ code: '', name: '', description: '', displayOrder: 0, isActive: true });
    } catch (err) {
      setError('部の作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept?.id || !deptForm.code || !deptForm.name) return;
    try {
      setSaving(true); setError('');
      await departmentsApi.update(selectedDept.id, deptForm as Omit<Department, 'id' | 'groups'>);
      await loadData();
      setIsEditMode(false);
      const updated = departments.find(d => d.id === selectedDept.id);
      if (updated) setSelectedDept(updated);
    } catch (err) {
      setError('部の更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.departmentId || !groupForm.code || !groupForm.name) { setError('所属部、コード、名前は必須です'); return; }
    try {
      setSaving(true); setError('');
      await groupsApi.create(groupForm as Omit<Group, 'id' | 'departmentName' | 'leaderName'>);
      await loadData();
      setShowGroupModal(false);
      setGroupForm({ departmentId: 0, code: '', name: '', description: '', leaderId: undefined, displayOrder: 0, isActive: true });
    } catch (err) {
      setError('グループの作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup?.id || !groupForm.departmentId || !groupForm.code || !groupForm.name) return;
    try {
      setSaving(true); setError('');
      await groupsApi.update(selectedGroup.id, groupForm as Omit<Group, 'id' | 'departmentName' | 'leaderName'>);
      await loadData();
      setIsEditMode(false);
      const updated = groups.find(g => g.id === selectedGroup.id);
      if (updated) setSelectedGroup(updated);
    } catch (err) {
      setError('グループの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true); setError('');
      if (deleteTarget.type === 'department') {
        await departmentsApi.delete(deleteTarget.id);
        setShowDeptDetailModal(false);
      } else {
        await groupsApi.delete(deleteTarget.id);
        setShowGroupDetailModal(false);
      }
      await loadData();
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (err) {
      setError(`${deleteTarget.type === 'department' ? '部' : 'グループ'}の削除に失敗しました`);
    } finally {
      setSaving(false);
    }
  };

  const openDeptDetail = (dept: Department) => {
    setSelectedDept(dept);
    setIsEditMode(false);
    setShowDeptDetailModal(true);
  };

  const openGroupDetail = async (group: Group) => {
    setSelectedGroup(group);
    setIsEditMode(false);
    setShowGroupDetailModal(true);
    setGroupMembers([]);
    if (group.id) {
      try {
        setLoadingMembers(true);
        const members = await groupsApi.getMembers(group.id);
        setGroupMembers(members);
      } catch (err) {
        console.error('メンバーの読み込みに失敗しました', err);
      } finally {
        setLoadingMembers(false);
      }
    }
  };

  const startEditDept = () => {
    if (selectedDept) {
      setDeptForm({ code: selectedDept.code, name: selectedDept.name, description: selectedDept.description || '', displayOrder: selectedDept.displayOrder || 0, isActive: selectedDept.isActive ?? true, directorId: selectedDept.directorId });
      setIsEditMode(true);
    }
  };

  const startEditGroup = () => {
    if (selectedGroup) {
      setGroupForm({ departmentId: selectedGroup.departmentId, code: selectedGroup.code, name: selectedGroup.name, description: selectedGroup.description || '', leaderId: selectedGroup.leaderId, displayOrder: selectedGroup.displayOrder || 0, isActive: selectedGroup.isActive ?? true });
      setIsEditMode(true);
    }
  };

  // グループソート関数
  const sortGroups = (
    data: Group[],
    key: string,
    direction: 'asc' | 'desc'
  ): Group[] => {
    if (!key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[key as keyof Group], bVal = b[key as keyof Group];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      let cmp = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        cmp = (aVal === bVal) ? 0 : aVal ? -1 : 1;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), 'ja');
      }
      return direction === 'asc' ? cmp : -cmp;
    });
  };

  // 部テーブル用ソート（groupCount計算値対応）
  const sortDepartments = (
    data: Department[],
    key: string,
    direction: 'asc' | 'desc'
  ): Department[] => {
    if (!key) return data;
    return [...data].sort((a, b) => {
      let cmp = 0;
      if (key === 'groupCount') {
        const aCount = a.groups?.length || 0;
        const bCount = b.groups?.length || 0;
        cmp = aCount - bCount;
      } else {
        const aVal = a[key as keyof Department], bVal = b[key as keyof Department];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          cmp = aVal - bVal;
        } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
          cmp = (aVal === bVal) ? 0 : aVal ? -1 : 1;
        } else {
          cmp = String(aVal).localeCompare(String(bVal), 'ja');
        }
      }
      return direction === 'asc' ? cmp : -cmp;
    });
  };

  // 部のソートハンドラ
  const handleDeptSort = (key: string) => {
    if (deptSortKey === key) {
      setDeptSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setDeptSortKey(key);
      setDeptSortDirection('asc');
    }
  };

  // グループのソートハンドラ
  const handleGroupSort = (key: string) => {
    if (groupSortKey === key) {
      setGroupSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setGroupSortKey(key);
      setGroupSortDirection('asc');
    }
  };

  // ソート済みデータ
  const sortedDepartments = sortDepartments(departments, deptSortKey, deptSortDirection);
  const sortedGroups = sortGroups(groups, groupSortKey, groupSortDirection);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div><div className="skeleton h-8 w-40 rounded-lg mb-2" /><div className="skeleton h-4 w-48 rounded" /></div>
        </div>
        <div className="card overflow-hidden">
          <div className="skeleton h-12 w-full" />
          {[1, 2, 3].map((i) => (<div key={i} className="skeleton h-16 w-full" style={{ marginTop: 1 }} />))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-navy-900)', fontFamily: 'Outfit, sans-serif' }}>組織管理</h1>
          <p style={{ color: 'var(--color-slate-500)' }}>{departments.length}部、{groups.length}グループ</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'var(--color-danger-light)', border: '1px solid #fecaca' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-danger)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm" style={{ color: '#991b1b' }}>{error}</span>
          <button onClick={() => setError('')} className="ml-auto p-1 hover:bg-red-200 rounded">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab('departments')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'departments' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>部</button>
        <button onClick={() => setActiveTab('groups')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'groups' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>グループ</button>
      </div>

      {activeTab === 'departments' && (
        <>
          {isAdmin && (
            <div className="mb-4">
              <button onClick={() => { setDeptForm({ code: '', name: '', description: '', displayOrder: 0, isActive: true }); setShowDeptModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                部を追加
              </button>
            </div>
          )}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleDeptSort('code')}
                  >
                    コード
                    <span className="ml-1 text-gray-400">
                      {deptSortKey === 'code' ? (deptSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleDeptSort('name')}
                  >
                    名前
                    <span className="ml-1 text-gray-400">
                      {deptSortKey === 'name' ? (deptSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleDeptSort('description')}
                  >
                    説明
                    <span className="ml-1 text-gray-400">
                      {deptSortKey === 'description' ? (deptSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleDeptSort('directorName')}
                  >
                    担当部長
                    <span className="ml-1 text-gray-400">
                      {deptSortKey === 'directorName' ? (deptSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleDeptSort('groupCount')}
                  >
                    グループ数
                    <span className="ml-1 text-gray-400">
                      {deptSortKey === 'groupCount' ? (deptSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleDeptSort('isActive')}
                  >
                    状態
                    <span className="ml-1 text-gray-400">
                      {deptSortKey === 'isActive' ? (deptSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedDepartments.map((dept) => (
                  <tr key={dept.id} onClick={() => openDeptDetail(dept)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">{dept.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.directorName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ fontFamily: 'Outfit, sans-serif' }}>{dept.groups?.length || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${dept.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{dept.isActive ? '有効' : '無効'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {departments.length === 0 && (
            <div className="text-center py-16" style={{ color: 'var(--color-slate-500)' }}>
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p>部がありません</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'groups' && (
        <>
          {isAdmin && (
            <div className="mb-4">
              <button onClick={() => { setGroupForm({ departmentId: departments[0]?.id || 0, code: '', name: '', description: '', leaderId: undefined, displayOrder: 0, isActive: true }); setShowGroupModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={departments.length === 0}>
                グループを追加
              </button>
            </div>
          )}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleGroupSort('code')}
                  >
                    コード
                    <span className="ml-1 text-gray-400">
                      {groupSortKey === 'code' ? (groupSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleGroupSort('name')}
                  >
                    名前
                    <span className="ml-1 text-gray-400">
                      {groupSortKey === 'name' ? (groupSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleGroupSort('departmentName')}
                  >
                    所属部
                    <span className="ml-1 text-gray-400">
                      {groupSortKey === 'departmentName' ? (groupSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleGroupSort('leaderName')}
                  >
                    G長
                    <span className="ml-1 text-gray-400">
                      {groupSortKey === 'leaderName' ? (groupSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleGroupSort('isActive')}
                  >
                    状態
                    <span className="ml-1 text-gray-400">
                      {groupSortKey === 'isActive' ? (groupSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedGroups.map((group) => (
                  <tr key={group.id} onClick={() => openGroupDetail(group)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{group.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.departmentName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.leaderName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${group.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{group.isActive ? '有効' : '無効'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {groups.length === 0 && (
            <div className="text-center py-16" style={{ color: 'var(--color-slate-500)' }}>
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>グループがありません</p>
            </div>
          )}
        </>
      )}

      {/* Create Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeptModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-navy-900)', fontFamily: 'Outfit, sans-serif' }}>部を追加</h2>
              <button onClick={() => setShowDeptModal(false)} className="p-2 rounded-lg transition-colors hover:bg-slate-100" style={{ color: 'var(--color-slate-500)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateDept} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>コード <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input type="text" value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>名前 <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input type="text" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>説明</label>
                <textarea value={deptForm.description || ''} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>担当部長</label>
                <select value={deptForm.directorId || ''} onChange={(e) => setDeptForm({ ...deptForm, directorId: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">未設定</option>
                  {engineers.map(e => (<option key={e.id} value={e.id}>{e.name}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>表示順</label>
                  <input type="number" value={deptForm.displayOrder || 0} onChange={(e) => setDeptForm({ ...deptForm, displayOrder: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>状態</label>
                  <select value={deptForm.isActive ? 'true' : 'false'} onChange={(e) => setDeptForm({ ...deptForm, isActive: e.target.value === 'true' })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="true">有効</option>
                    <option value="false">無効</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowDeptModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50" disabled={saving}>キャンセル</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" disabled={saving}>{saving ? '作成中...' : '作成'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowGroupModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-navy-900)', fontFamily: 'Outfit, sans-serif' }}>グループを追加</h2>
              <button onClick={() => setShowGroupModal(false)} className="p-2 rounded-lg transition-colors hover:bg-slate-100" style={{ color: 'var(--color-slate-500)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>所属部 <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <select value={groupForm.departmentId} onChange={(e) => setGroupForm({ ...groupForm, departmentId: parseInt(e.target.value) })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value={0}>選択してください</option>
                  {departments.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>コード <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input type="text" value={groupForm.code} onChange={(e) => setGroupForm({ ...groupForm, code: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>名前 <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input type="text" value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>説明</label>
                <textarea value={groupForm.description || ''} onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>G長</label>
                <select value={groupForm.leaderId || ''} onChange={(e) => setGroupForm({ ...groupForm, leaderId: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">未設定</option>
                  {engineers.map(e => (<option key={e.id} value={e.id}>{e.name}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>表示順</label>
                  <input type="number" value={groupForm.displayOrder || 0} onChange={(e) => setGroupForm({ ...groupForm, displayOrder: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>状態</label>
                  <select value={groupForm.isActive ? 'true' : 'false'} onChange={(e) => setGroupForm({ ...groupForm, isActive: e.target.value === 'true' })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="true">有効</option>
                    <option value="false">無効</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowGroupModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50" disabled={saving}>キャンセル</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" disabled={saving}>{saving ? '作成中...' : '作成'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Detail Modal */}
      {showDeptDetailModal && selectedDept && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => { setShowDeptDetailModal(false); setIsEditMode(false); }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-navy-900)', fontFamily: 'Outfit, sans-serif' }}>
                {isEditMode ? '部を編集' : '部の詳細'}
              </h2>
              {!isEditMode && isAdmin && (
                <div className="flex gap-3">
                  <button onClick={() => { setDeleteTarget({ type: 'department', id: selectedDept.id!, name: selectedDept.name }); setShowDeleteConfirm(true); }} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">削除</button>
                  <button onClick={startEditDept} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">編集</button>
                </div>
              )}
            </div>

            {!isEditMode ? (
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-slate-50)' }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-slate-600)' }}>基本情報</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>コード</p><p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>{selectedDept.code}</p></div>
                    <div><p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>名前</p><p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>{selectedDept.name}</p></div>
                    <div><p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>担当部長</p><p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>{selectedDept.directorName || '-'}</p></div>
                    <div><p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>状態</p><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedDept.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{selectedDept.isActive ? '有効' : '無効'}</span></div>
                    <div><p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>表示順</p><p className="font-medium font-number" style={{ color: 'var(--color-slate-900)', fontFamily: 'Outfit, sans-serif' }}>{selectedDept.displayOrder || 0}</p></div>
                  </div>
                  {selectedDept.description && (
                    <div className="mt-4"><p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>説明</p><p style={{ color: 'var(--color-slate-700)' }}>{selectedDept.description}</p></div>
                  )}
                </div>
                {selectedDept.groups && selectedDept.groups.length > 0 && (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-slate-50)' }}>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-slate-600)' }}>所属グループ ({selectedDept.groups.length})</h3>
                    <ul className="space-y-2">
                      {selectedDept.groups.map(g => (
                        <li
                          key={g.id}
                          onClick={() => {
                            setShowDeptDetailModal(false);
                            openGroupDetail(g);
                          }}
                          className="flex justify-between items-center p-2 bg-white rounded cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <span style={{ color: 'var(--color-slate-800)' }}>{g.name}</span>
                          <span className="text-sm" style={{ color: 'var(--color-slate-500)' }}>{g.code}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex justify-end pt-4">
                  <button onClick={() => { setShowDeptDetailModal(false); setIsEditMode(false); }} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">閉じる</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateDept} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>コード <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input type="text" value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>名前 <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input type="text" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>説明</label>
                  <textarea value={deptForm.description || ''} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>担当部長</label>
                  <select value={deptForm.directorId || ''} onChange={(e) => setDeptForm({ ...deptForm, directorId: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">未設定</option>
                    {engineers.map(e => (<option key={e.id} value={e.id}>{e.name}</option>))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>表示順</label>
                    <input type="number" value={deptForm.displayOrder || 0} onChange={(e) => setDeptForm({ ...deptForm, displayOrder: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>状態</label>
                    <select value={deptForm.isActive ? 'true' : 'false'} onChange={(e) => setDeptForm({ ...deptForm, isActive: e.target.value === 'true' })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="true">有効</option>
                      <option value="false">無効</option>
                    </select>
                  </div>
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

      {/* Group Detail Modal */}
      {showGroupDetailModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowGroupDetailModal(false); setIsEditMode(false); }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-navy-900)', fontFamily: 'Outfit, sans-serif' }}>
                {isEditMode ? 'グループを編集' : 'グループの詳細'}
              </h2>
              {!isEditMode && isAdmin && (
                <div className="flex gap-3">
                  <button onClick={() => { setDeleteTarget({ type: 'group', id: selectedGroup.id!, name: selectedGroup.name }); setShowDeleteConfirm(true); }} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">削除</button>
                  <button onClick={startEditGroup} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">編集</button>
                </div>
              )}
            </div>

            {!isEditMode ? (
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-slate-50)' }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-slate-600)' }}>基本情報</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>コード</p><p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>{selectedGroup.code}</p></div>
                    <div><p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>名前</p><p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>{selectedGroup.name}</p></div>
                    <div><p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>所属部</p><p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>{selectedGroup.departmentName || '-'}</p></div>
                    <div><p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>G長</p><p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>{selectedGroup.leaderName || '-'}</p></div>
                    <div><p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>状態</p><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedGroup.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{selectedGroup.isActive ? '有効' : '無効'}</span></div>
                    <div><p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>表示順</p><p className="font-medium font-number" style={{ color: 'var(--color-slate-900)', fontFamily: 'Outfit, sans-serif' }}>{selectedGroup.displayOrder || 0}</p></div>
                  </div>
                  {selectedGroup.description && (
                    <div className="mt-4"><p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>説明</p><p style={{ color: 'var(--color-slate-700)' }}>{selectedGroup.description}</p></div>
                  )}
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-slate-50)' }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-slate-600)' }}>メンバー一覧 ({groupMembers.length}名)</h3>
                  {loadingMembers ? (
                    <p className="text-sm" style={{ color: 'var(--color-slate-500)' }}>読み込み中...</p>
                  ) : groupMembers.length > 0 ? (
                    <ul className="space-y-2">
                      {groupMembers.map(member => (
                        <li
                          key={member.id}
                          onClick={() => {
                            setSelectedMember(member);
                            setShowMemberDetailModal(true);
                          }}
                          className="flex justify-between items-center p-2 bg-white rounded cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <span style={{ color: 'var(--color-slate-800)' }}>{member.name}</span>
                            <span className="ml-2 text-sm" style={{ color: 'var(--color-slate-500)' }}>{member.employeeNumber}</span>
                          </div>
                          <span className="text-sm" style={{ color: 'var(--color-slate-500)' }}>
                            {member.experienceYears || member.experienceMonths
                              ? `${member.experienceYears || 0}年${member.experienceMonths || 0}ヶ月`
                              : '-'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--color-slate-500)' }}>メンバーがいません</p>
                  )}
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={() => { setShowGroupDetailModal(false); setIsEditMode(false); }} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">閉じる</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>所属部 <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <select value={groupForm.departmentId} onChange={(e) => setGroupForm({ ...groupForm, departmentId: parseInt(e.target.value) })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    {departments.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>コード <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input type="text" value={groupForm.code} onChange={(e) => setGroupForm({ ...groupForm, code: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>名前 <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input type="text" value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>説明</label>
                  <textarea value={groupForm.description || ''} onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>G長</label>
                  <select value={groupForm.leaderId || ''} onChange={(e) => setGroupForm({ ...groupForm, leaderId: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">未設定</option>
                    {engineers.map(e => (<option key={e.id} value={e.id}>{e.name}</option>))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>表示順</label>
                    <input type="number" value={groupForm.displayOrder || 0} onChange={(e) => setGroupForm({ ...groupForm, displayOrder: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>状態</label>
                    <select value={groupForm.isActive ? 'true' : 'false'} onChange={(e) => setGroupForm({ ...groupForm, isActive: e.target.value === 'true' })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="true">有効</option>
                      <option value="false">無効</option>
                    </select>
                  </div>
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

      {/* Member Detail Modal */}
      {showMemberDetailModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setShowMemberDetailModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-navy-900)', fontFamily: 'Outfit, sans-serif' }}>
                メンバー詳細
              </h2>
            </div>
            <div className="space-y-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-slate-50)' }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-slate-600)' }}>基本情報</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>名前</p>
                    <p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>{selectedMember.name}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>社員番号</p>
                    <p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>{selectedMember.employeeNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>所属</p>
                    <p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>
                      {selectedMember.departmentName && selectedMember.groupName
                        ? `${selectedMember.departmentName} / ${selectedMember.groupName}`
                        : selectedMember.groupName || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>経験年数</p>
                    <p className="font-medium font-number" style={{ color: 'var(--color-slate-900)', fontFamily: 'Outfit, sans-serif' }}>
                      {selectedMember.experienceYears || selectedMember.experienceMonths
                        ? `${selectedMember.experienceYears || 0}年${selectedMember.experienceMonths || 0}ヶ月`
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-slate-50)' }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-slate-600)' }}>連絡先情報</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>メールアドレス</p>
                    <p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>{selectedMember.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--color-slate-500)' }}>電話番号</p>
                    <p className="font-medium" style={{ color: 'var(--color-slate-900)' }}>{selectedMember.phone || '-'}</p>
                  </div>
                </div>
              </div>
              {selectedMember.skillSet && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-slate-50)' }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-slate-600)' }}>スキル情報</h3>
                  <p className="whitespace-pre-wrap" style={{ color: 'var(--color-slate-700)' }}>{selectedMember.skillSet}</p>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <button onClick={() => setShowMemberDetailModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">閉じる</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-navy-900)', fontFamily: 'Outfit, sans-serif' }}>
              {deleteTarget.type === 'department' ? '部' : 'グループ'}の削除
            </h3>
            <p className="mb-1" style={{ color: 'var(--color-slate-600)' }}>本当にこの{deleteTarget.type === 'department' ? '部' : 'グループ'}を削除しますか？</p>
            <p className="font-semibold mb-6" style={{ color: 'var(--color-slate-900)' }}>{deleteTarget.name}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50" disabled={saving}>キャンセル</button>
              <button onClick={handleConfirmDelete} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700" disabled={saving}>{saving ? '削除中...' : '削除'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationsPage;
