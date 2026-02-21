import React, { useEffect, useState } from 'react';
import { projectsApi } from '../api/projects';
import { customersApi } from '../api/customers';
import { assignmentsApi } from '../api/assignments';
import { useAuth } from '../contexts/AuthContext';
import type { Project, Customer, AssignmentSchedule, Engineer } from '../types';

const ProjectsPage: React.FC = () => {
  const { role } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectMembers, setProjectMembers] = useState<AssignmentSchedule[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [standbyEngineers, setStandbyEngineers] = useState<Engineer[]>([]);
  const [loadingStandby, setLoadingStandby] = useState(false);
  const [addMemberForm, setAddMemberForm] = useState({ engineerId: 0, startDate: '', endDate: '', role: '', status: 'PLANNED', billingRate: 0 });
  const [formData, setFormData] = useState<Partial<Project>>({
    customerId: 0,
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'PLANNING',
    billingType: '',
    unitPrice: 0,
  });
  const [editFormData, setEditFormData] = useState<Partial<Project>>({
    customerId: 0,
    projectCode: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'PLANNING',
    billingType: '',
    unitPrice: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (err) {
      setError('案件の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (err) {
      setError('顧客の読み込みに失敗しました');
    }
  };

  const handleOpenModal = async () => {
    await loadCustomers();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      customerId: 0,
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'PLANNING',
      billingType: '',
      unitPrice: 0,
    });
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'customerId' || name === 'unitPrice' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!formData.customerId || formData.customerId === 0) {
      setError('顧客を選択してください');
      return;
    }
    if (!formData.name || formData.name.trim() === '') {
      setError('案件名を入力してください');
      return;
    }
    if (!formData.status) {
      setError('ステータスを選択してください');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await projectsApi.create(formData as Project);
      await loadProjects();
      handleCloseModal();
    } catch (err) {
      setError('案件の作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleRowClick = async (projectId: number) => {
    try {
      setLoadingDetail(true);
      setShowDetailModal(true);
      setError('');
      setProjectMembers([]);

      // 顧客データがまだロードされていない場合はロード
      if (customers.length === 0) {
        await loadCustomers();
      }

      const [project, members] = await Promise.all([
        projectsApi.getById(projectId),
        projectsApi.getMembers(projectId),
      ]);
      setSelectedProject(project);
      setProjectMembers(members);
    } catch (err) {
      setError('案件の詳細取得に失敗しました');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProject(null);
    setIsEditMode(false);
    setShowDeleteConfirm(false);
    setProjectMembers([]);
    setError('');
  };

  const handleOpenAddMemberModal = async () => {
    if (!selectedProject) return;
    try {
      setLoadingStandby(true);
      setShowAddMemberModal(true);
      const today = new Date().toISOString().split('T')[0];
      const engineers = await assignmentsApi.getStandbyEngineers(today);
      setStandbyEngineers(engineers);
      setAddMemberForm({
        engineerId: 0,
        startDate: selectedProject.startDate || today,
        endDate: selectedProject.endDate || '',
        role: '',
        status: 'PLANNED',
        billingRate: 0,
      });
    } catch (err) {
      setError('待機エンジニアの取得に失敗しました');
    } finally {
      setLoadingStandby(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject?.id || !addMemberForm.engineerId || !addMemberForm.startDate || !addMemberForm.endDate) {
      setError('エンジニア、開始日、終了日は必須です');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await assignmentsApi.create({
        projectId: selectedProject.id,
        engineerId: addMemberForm.engineerId,
        startDate: addMemberForm.startDate,
        endDate: addMemberForm.endDate,
        role: addMemberForm.role || undefined,
        status: addMemberForm.status,
        billingRate: addMemberForm.billingRate || undefined,
      });
      const members = await projectsApi.getMembers(selectedProject.id);
      setProjectMembers(members);
      setShowAddMemberModal(false);
    } catch (err) {
      setError('メンバーの追加に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (assignmentId: number) => {
    if (!selectedProject?.id) return;
    if (!window.confirm('このメンバーを案件から削除しますか？')) return;
    try {
      setSaving(true);
      setError('');
      await assignmentsApi.delete(assignmentId);
      const members = await projectsApi.getMembers(selectedProject.id);
      setProjectMembers(members);
    } catch (err) {
      setError('メンバーの削除に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = () => {
    if (selectedProject) {
      setEditFormData({
        customerId: selectedProject.customerId,
        projectCode: selectedProject.projectCode || '',
        name: selectedProject.name,
        description: selectedProject.description || '',
        startDate: selectedProject.startDate || '',
        endDate: selectedProject.endDate || '',
        status: selectedProject.status,
        billingType: selectedProject.billingType || '',
        unitPrice: selectedProject.unitPrice || 0,
      });
      setIsEditMode(true);
      setError('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setError('');
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'customerId' || name === 'unitPrice' ? Number(value) : value,
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) return;

    // バリデーション
    if (!editFormData.customerId || editFormData.customerId === 0) {
      setError('顧客を選択してください');
      return;
    }
    if (!editFormData.name || editFormData.name.trim() === '') {
      setError('案件名を入力してください');
      return;
    }
    if (!editFormData.status) {
      setError('ステータスを選択してください');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await projectsApi.update(selectedProject.id!, editFormData as Project);
      await loadProjects();
      const updatedProject = await projectsApi.getById(selectedProject.id!);
      setSelectedProject(updatedProject);
      setIsEditMode(false);
    } catch (err) {
      setError('案件の更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProject) return;

    try {
      setSaving(true);
      setError('');
      await projectsApi.delete(selectedProject.id!);
      await loadProjects();
      handleCloseDetailModal();
    } catch (err) {
      setError('案件の削除に失敗しました');
      setShowDeleteConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  const getCustomerName = (customerId: number): string => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || '不明';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PLANNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '稼働中';
      case 'PLANNING':
        return '計画中';
      case 'COMPLETED':
        return '完了';
      default:
        return status;
    }
  };

  // ステータス別カウント
  const statusCounts = {
    ALL: projects.length,
    ACTIVE: projects.filter((p) => p.status === 'ACTIVE').length,
    PLANNING: projects.filter((p) => p.status === 'PLANNING').length,
    COMPLETED: projects.filter((p) => p.status === 'COMPLETED').length,
  };

  // フィルタされた案件リスト
  const filteredProjects = statusFilter === 'ALL'
    ? projects
    : projects.filter((p) => p.status === statusFilter);

  // ソート関数
  const sortProjects = (
    data: Project[],
    key: string,
    direction: 'asc' | 'desc'
  ): Project[] => {
    if (!key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[key as keyof Project], bVal = b[key as keyof Project];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      let cmp = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), 'ja');
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
  const sortedProjects = sortProjects(filteredProjects, sortKey, sortDirection);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">案件一覧</h1>
          <p className="text-sm text-gray-500 mt-1">
            全{statusCounts.ALL}件（稼働中: {statusCounts.ACTIVE}件、計画中: {statusCounts.PLANNING}件、完了: {statusCounts.COMPLETED}件）
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          新規作成
        </button>
      </div>

      {/* ステータスフィルタ */}
      <div className="flex gap-2 mb-4">
        {(['ALL', 'ACTIVE', 'PLANNING', 'COMPLETED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'ALL' ? 'すべて' : getStatusLabel(status)} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {error && !showModal && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('projectCode')}
              >
                案件コード
                <span className="ml-1 text-gray-400">
                  {sortKey === 'projectCode' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('name')}
              >
                案件名
                <span className="ml-1 text-gray-400">
                  {sortKey === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('status')}
              >
                ステータス
                <span className="ml-1 text-gray-400">
                  {sortKey === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('startDate')}
              >
                開始日
                <span className="ml-1 text-gray-400">
                  {sortKey === 'startDate' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('endDate')}
              >
                終了日
                <span className="ml-1 text-gray-400">
                  {sortKey === 'endDate' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('totalBillingRate')}
              >
                単価合計
                <span className="ml-1 text-gray-400">
                  {sortKey === 'totalBillingRate' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProjects.map((project) => (
              <tr
                key={project.id}
                onClick={() => handleRowClick(project.id!)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {project.projectCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.startDate || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.endDate || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.totalBillingRate ? `¥${project.totalBillingRate.toLocaleString()}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedProjects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {statusFilter === 'ALL' ? '案件がありません' : `${getStatusLabel(statusFilter)}の案件はありません`}
        </div>
      )}

      {/* 詳細表示モーダル */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{isEditMode ? '案件編集' : '案件詳細'}</h2>
              <button
                onClick={handleCloseDetailModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loadingDetail ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-600">読み込み中...</div>
              </div>
            ) : selectedProject ? (
              isEditMode ? (
                // 編集モード
                <form onSubmit={handleUpdate}>
                  <div className="space-y-4">
                    {/* 顧客選択 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        顧客 <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="customerId"
                        value={editFormData.customerId}
                        onChange={handleEditInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value={0}>顧客を選択してください</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 案件コード */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        案件コード
                      </label>
                      <input
                        type="text"
                        name="projectCode"
                        value={editFormData.projectCode}
                        readOnly
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    {/* 案件名 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        案件名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* 説明 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        説明
                      </label>
                      <textarea
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditInputChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* 開始日・終了日 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          開始日
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={editFormData.startDate}
                          onChange={handleEditInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          終了日
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={editFormData.endDate}
                          onChange={handleEditInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* ステータス */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ステータス <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="PLANNING">PLANNING</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </div>

                    {/* 請求タイプ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        請求タイプ
                      </label>
                      <input
                        type="text"
                        name="billingType"
                        value={editFormData.billingType}
                        onChange={handleEditInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* 単価 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        単価（円）
                      </label>
                      <input
                        type="number"
                        name="unitPrice"
                        value={editFormData.unitPrice}
                        onChange={handleEditInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* ボタン */}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      disabled={saving}
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                      disabled={saving}
                    >
                      {saving ? '保存中...' : '保存'}
                    </button>
                  </div>
                </form>
              ) : (
                // 表示モード
                <div className="space-y-6">
                  {/* 基本情報 */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">基本情報</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">案件コード</label>
                        <p className="text-gray-900">{selectedProject.projectCode || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">案件名</label>
                        <p className="text-gray-900 font-medium">{selectedProject.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">顧客</label>
                        <p className="text-gray-900">{getCustomerName(selectedProject.customerId)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">ステータス</label>
                        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadgeClass(selectedProject.status)}`}>
                          {selectedProject.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* プロジェクト情報 */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">プロジェクト情報</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">開始日</label>
                        <p className="text-gray-900">{selectedProject.startDate || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">終了日</label>
                        <p className="text-gray-900">{selectedProject.endDate || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* 契約情報 */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">契約情報</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">請求タイプ</label>
                        <p className="text-gray-900">{selectedProject.billingType || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">単価合計</label>
                        <p className="text-gray-900 font-semibold">
                          {selectedProject.totalBillingRate ? `¥${selectedProject.totalBillingRate.toLocaleString()}` : '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 参画メンバー */}
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-700">参画メンバー ({projectMembers.length}名)</h3>
                      {role === 'ROLE_ADMIN' && (
                        <button
                          onClick={handleOpenAddMemberModal}
                          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          メンバー追加
                        </button>
                      )}
                    </div>
                    {projectMembers.length > 0 ? (
                      <div className="space-y-2">
                        {projectMembers.map((member) => (
                          <div key={member.assignmentId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <p className="font-medium text-gray-900">{member.engineerName}</p>
                                {member.billingRate && (
                                  <span className="text-sm font-semibold text-blue-600">
                                    ¥{member.billingRate.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {member.departmentName && member.groupName
                                  ? `${member.departmentName} / ${member.groupName}`
                                  : member.groupName || '-'}
                                {member.role && ` • ${member.role}`}
                              </p>
                              <p className="text-xs text-gray-400">{member.startDate} ~ {member.endDate}</p>
                            </div>
                            {role === 'ROLE_ADMIN' && (
                              <button
                                onClick={() => handleRemoveMember(member.assignmentId)}
                                className="text-red-600 hover:text-red-800 text-sm"
                                disabled={saving}
                              >
                                削除
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">メンバーがいません</p>
                    )}
                  </div>

                  {/* 月別単価合計 */}
                  {projectMembers.length > 0 && projectMembers.some(m => m.billingRate) && (
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold mb-3 text-gray-700">月別単価合計</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {(() => {
                          // 月別単価合計を計算
                          const monthlyTotals: { [key: string]: number } = {};
                          projectMembers.forEach((member) => {
                            if (!member.billingRate) return;
                            const start = new Date(member.startDate);
                            const end = new Date(member.endDate);
                            const current = new Date(start.getFullYear(), start.getMonth(), 1);
                            while (current <= end) {
                              const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
                              monthlyTotals[key] = (monthlyTotals[key] || 0) + member.billingRate;
                              current.setMonth(current.getMonth() + 1);
                            }
                          });
                          const sortedMonths = Object.keys(monthlyTotals).sort();
                          return sortedMonths.map((month) => (
                            <div key={month} className="p-2 bg-blue-50 rounded text-center">
                              <p className="text-xs text-gray-500">{month}</p>
                              <p className="font-semibold text-blue-700">¥{monthlyTotals[month].toLocaleString()}</p>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {/* 詳細情報 */}
                  {selectedProject.description && (
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold mb-3 text-gray-700">説明</h3>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedProject.description}</p>
                    </div>
                  )}

                  {/* ボタン */}
                  <div className="flex justify-between">
                    <button
                      onClick={handleCloseDetailModal}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      閉じる
                    </button>
                    {role === 'ROLE_ADMIN' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={handleDeleteClick}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          削除
                        </button>
                        <button
                          onClick={handleEditClick}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          編集
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : null}
          </div>
        </div>
      )}

      {/* メンバー追加モーダル */}
      {showAddMemberModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">メンバーを追加</h3>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleAddMember}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    エンジニア <span className="text-red-500">*</span>
                  </label>
                  {loadingStandby ? (
                    <p className="text-gray-500">読み込み中...</p>
                  ) : (
                    <select
                      value={addMemberForm.engineerId}
                      onChange={(e) => setAddMemberForm({ ...addMemberForm, engineerId: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value={0}>選択してください</option>
                      {standbyEngineers.map((eng) => (
                        <option key={eng.id} value={eng.id}>
                          {eng.name} ({eng.groupName || '未所属'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      開始日 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={addMemberForm.startDate}
                      onChange={(e) => setAddMemberForm({ ...addMemberForm, startDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      終了日 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={addMemberForm.endDate}
                      onChange={(e) => setAddMemberForm({ ...addMemberForm, endDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">役割</label>
                  <input
                    type="text"
                    value={addMemberForm.role}
                    onChange={(e) => setAddMemberForm({ ...addMemberForm, role: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: リーダー、メンバー"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">単価（円）</label>
                  <input
                    type="number"
                    value={addMemberForm.billingRate}
                    onChange={(e) => setAddMemberForm({ ...addMemberForm, billingRate: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 800000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                  <select
                    value={addMemberForm.status}
                    onChange={(e) => setAddMemberForm({ ...addMemberForm, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PLANNED">予定</option>
                    <option value="ACTIVE">稼働中</option>
                    <option value="COMPLETED">完了</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={saving}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={saving || loadingStandby}
                >
                  {saving ? '追加中...' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">案件の削除</h3>
            <p className="text-gray-700 mb-2">本当にこの案件を削除しますか？</p>
            <p className="text-gray-900 font-semibold mb-6">{selectedProject.name}</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={saving}
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
                disabled={saving}
              >
                {saving ? '削除中...' : '削除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新規作成モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">案件を新規作成</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* 顧客選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    顧客 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>顧客を選択してください</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 案件名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    案件名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* 説明 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 開始日・終了日 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      開始日
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      終了日
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* ステータス */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ステータス <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="PLANNING">PLANNING</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                {/* 請求タイプ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    請求タイプ
                  </label>
                  <input
                    type="text"
                    name="billingType"
                    value={formData.billingType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 単価 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    単価（円）
                  </label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* ボタン */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={saving}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={saving}
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
