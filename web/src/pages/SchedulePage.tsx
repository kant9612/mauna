import React, { useEffect, useState } from 'react';
import { assignmentsApi } from '../api/assignments';
import type { AssignmentSchedule } from '../types';

type ViewMode = 'entries' | 'exits';

const SchedulePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('entries');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [data, setData] = useState<AssignmentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 選択月から期間（from/to）を計算
  const getDateRange = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { from, to };
  };

  useEffect(() => {
    loadData();
  }, [viewMode, selectedMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const { from, to } = getDateRange(selectedMonth);

      let result: AssignmentSchedule[];
      if (viewMode === 'entries') {
        result = await assignmentsApi.getUpcomingEntries({ from, to });
      } else {
        result = await assignmentsApi.getUpcomingExits({ from, to });
      }
      setData(result);
    } catch (err) {
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      PLANNED: { bg: 'var(--color-info-light)', text: 'var(--color-info)', label: '予定' },
      ACTIVE: { bg: 'var(--color-success-light)', text: 'var(--color-success)', label: '稼働中' },
      COMPLETED: { bg: 'var(--color-slate-100)', text: 'var(--color-slate-600)', label: '終了' },
    };
    const style = styles[status] || styles.PLANNED;
    return (
      <span
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </span>
    );
  };

  // 日付でグループ化
  const groupByDate = (items: AssignmentSchedule[]) => {
    const grouped: Record<string, AssignmentSchedule[]> = {};
    items.forEach((item) => {
      const dateKey = viewMode === 'entries' ? item.startDate : item.endDate;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    return grouped;
  };

  const groupedData = groupByDate(data);
  const sortedDates = Object.keys(groupedData).sort();

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="skeleton h-8 w-40 rounded-lg mb-2" />
            <div className="skeleton h-4 w-48 rounded" />
          </div>
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

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-navy-900)', fontFamily: 'Outfit, sans-serif' }}>
            入退場管理
          </h1>
          <p style={{ color: 'var(--color-slate-500)' }}>
            {viewMode === 'entries' ? '入場予定' : '退場予定'}の一覧
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* View Mode Tabs */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>
              表示切替
            </label>
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-slate-200)' }}>
              <button
                onClick={() => setViewMode('entries')}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: viewMode === 'entries' ? 'var(--color-primary)' : 'transparent',
                  color: viewMode === 'entries' ? 'white' : 'var(--color-slate-600)',
                }}
              >
                入場予定
              </button>
              <button
                onClick={() => setViewMode('exits')}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: viewMode === 'exits' ? 'var(--color-primary)' : 'transparent',
                  color: viewMode === 'exits' ? 'white' : 'var(--color-slate-600)',
                }}
              >
                退場予定
              </button>
            </div>
          </div>

          {/* Month Selector */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>
              対象月
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input"
              style={{ width: '160px' }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'var(--color-danger-light)', border: '1px solid #fecaca' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-danger)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm" style={{ color: '#991b1b' }}>{error}</span>
        </div>
      )}

      {/* Schedule List */}
      {sortedDates.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="card overflow-hidden">
              {/* Date Header */}
              <div className="px-4 py-3 border-b" style={{ backgroundColor: 'var(--color-slate-50)', borderColor: 'var(--color-slate-200)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                    style={{
                      backgroundColor: viewMode === 'entries' ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                      color: viewMode === 'entries' ? 'var(--color-success)' : 'var(--color-warning)',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {new Date(date).getDate()}
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--color-slate-900)' }}>
                      {formatFullDate(date)}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--color-slate-500)' }}>
                      {groupedData[date].length}名が{viewMode === 'entries' ? '入場' : '退場'}予定
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y" style={{ borderColor: 'var(--color-slate-100)' }}>
                {groupedData[date].map((item) => (
                  <div key={item.assignmentId} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium" style={{ color: 'var(--color-slate-900)' }}>
                            {item.engineerName}
                          </span>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--color-slate-500)' }}>
                          {item.departmentName && `${item.departmentName} / `}
                          {item.groupName || '-'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: 'var(--color-slate-800)' }}>
                          {item.projectName}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--color-slate-500)' }}>
                          {item.customerName || '-'}
                          {item.role && ` / ${item.role}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium" style={{ color: 'var(--color-slate-700)', fontFamily: 'Outfit, sans-serif' }}>
                          {formatDate(item.startDate)} - {formatDate(item.endDate)}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-slate-400)' }}>
                          アサイン期間
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16" style={{ color: 'var(--color-slate-500)' }}>
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>
            {selectedMonth} の{viewMode === 'entries' ? '入場' : '退場'}予定はありません
          </p>
        </div>
      )}

      {/* Summary */}
      {data.length > 0 && (
        <div className="mt-6 card p-4">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--color-slate-600)' }}>
              {selectedMonth} の{viewMode === 'entries' ? '入場' : '退場'}予定
            </span>
            <span className="font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Outfit, sans-serif' }}>
              {data.length} 名
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
