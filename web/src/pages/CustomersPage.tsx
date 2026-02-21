import React, { useEffect, useState } from 'react';
import { customersApi } from '../api/customers';
import { useAuth } from '../contexts/AuthContext';
import type { Customer } from '../types';

const CustomersPage: React.FC = () => {
  const { role } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    address: '',
    phone: '',
    email: '',
    contactPerson: '',
    notes: '',
  });
  const [editFormData, setEditFormData] = useState<Partial<Customer>>({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    contactPerson: '',
    notes: '',
  });
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (err) {
      setError('顧客の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      contactPerson: '',
      notes: '',
    });
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.name.trim() === '') {
      setError('名前を入力してください');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await customersApi.create(formData as Omit<Customer, 'id'>);
      await loadCustomers();
      handleCloseModal();
    } catch (err) {
      setError('顧客の作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleRowClick = async (customerId: number) => {
    try {
      setLoadingDetail(true);
      setShowDetailModal(true);
      setError('');

      const customer = await customersApi.getById(customerId);
      setSelectedCustomer(customer);
    } catch (err) {
      setError('顧客の詳細取得に失敗しました');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCustomer(null);
    setIsEditMode(false);
    setShowDeleteConfirm(false);
    setError('');
  };

  const handleEditClick = () => {
    if (selectedCustomer) {
      setEditFormData({
        name: selectedCustomer.name,
        code: selectedCustomer.code || '',
        address: selectedCustomer.address || '',
        phone: selectedCustomer.phone || '',
        email: selectedCustomer.email || '',
        contactPerson: selectedCustomer.contactPerson || '',
        notes: selectedCustomer.notes || '',
      });
      setIsEditMode(true);
      setError('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setError('');
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) return;

    if (!editFormData.name || editFormData.name.trim() === '') {
      setError('名前を入力してください');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await customersApi.update(selectedCustomer.id!, editFormData as Omit<Customer, 'id'>);
      await loadCustomers();
      const updatedCustomer = await customersApi.getById(selectedCustomer.id!);
      setSelectedCustomer(updatedCustomer);
      setIsEditMode(false);
    } catch (err) {
      setError('顧客の更新に失敗しました');
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
    if (!selectedCustomer) return;

    try {
      setSaving(true);
      setError('');
      await customersApi.delete(selectedCustomer.id!);
      await loadCustomers();
      handleCloseDetailModal();
    } catch (err) {
      setError('顧客の削除に失敗しました');
      setShowDeleteConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  // ソート関数
  const sortCustomers = (
    data: Customer[],
    key: string,
    direction: 'asc' | 'desc'
  ): Customer[] => {
    if (!key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[key as keyof Customer], bVal = b[key as keyof Customer];
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
  const sortedCustomers = sortCustomers(customers, sortKey, sortDirection);

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
        <h1 className="text-2xl font-bold text-gray-800">顧客一覧</h1>
        {role === 'ROLE_ADMIN' && (
          <button
            onClick={handleOpenModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            新規作成
          </button>
        )}
      </div>

      {error && !showModal && !showDetailModal && (
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
                onClick={() => handleSort('code')}
              >
                コード
                <span className="ml-1 text-gray-400">
                  {sortKey === 'code' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
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
                onClick={() => handleSort('phone')}
              >
                電話
                <span className="ml-1 text-gray-400">
                  {sortKey === 'phone' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('email')}
              >
                メール
                <span className="ml-1 text-gray-400">
                  {sortKey === 'email' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('contactPerson')}
              >
                担当者
                <span className="ml-1 text-gray-400">
                  {sortKey === 'contactPerson' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('address')}
              >
                住所
                <span className="ml-1 text-gray-400">
                  {sortKey === 'address' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCustomers.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => handleRowClick(customer.id!)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {customer.code || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customer.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.phone || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.contactPerson || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {customer.address || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedCustomers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          顧客がありません
        </div>
      )}

      {/* 詳細表示モーダル */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{isEditMode ? '顧客編集' : '顧客詳細'}</h2>
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
            ) : selectedCustomer ? (
              isEditMode ? (
                // 編集モード
                <form onSubmit={handleUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        名前 <span className="text-red-500">*</span>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">コード</label>
                      <input
                        type="text"
                        name="code"
                        value={editFormData.code}
                        readOnly
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                        <input
                          type="text"
                          name="phone"
                          value={editFormData.phone}
                          onChange={handleEditInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">メール</label>
                        <input
                          type="email"
                          name="email"
                          value={editFormData.email}
                          onChange={handleEditInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">担当者</label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={editFormData.contactPerson}
                        onChange={handleEditInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                      <input
                        type="text"
                        name="address"
                        value={editFormData.address}
                        onChange={handleEditInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                      <textarea
                        name="notes"
                        value={editFormData.notes}
                        onChange={handleEditInputChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

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
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">基本情報</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">名前</label>
                        <p className="text-gray-900 font-medium">{selectedCustomer.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">コード</label>
                        <p className="text-gray-900">{selectedCustomer.code || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">連絡先情報</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">電話</label>
                        <p className="text-gray-900">{selectedCustomer.phone || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">メール</label>
                        <p className="text-gray-900">{selectedCustomer.email || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">担当者</label>
                        <p className="text-gray-900">{selectedCustomer.contactPerson || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">その他</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">住所</label>
                      <p className="text-gray-900">{selectedCustomer.address || '-'}</p>
                    </div>
                    {selectedCustomer.notes && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-500 mb-1">備考</label>
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedCustomer.notes}</p>
                      </div>
                    )}
                  </div>

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

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">顧客の削除</h3>
            <p className="text-gray-700 mb-2">本当にこの顧客を削除しますか？</p>
            <p className="text-gray-900 font-semibold mb-6">{selectedCustomer.name}</p>

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
            <h2 className="text-xl font-bold mb-4">顧客を新規作成</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    名前 <span className="text-red-500">*</span>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">メール</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">担当者</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

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

export default CustomersPage;
