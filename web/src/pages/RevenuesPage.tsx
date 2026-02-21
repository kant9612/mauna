import React, { useEffect, useState } from 'react';
import { revenuesApi } from '../api/revenues';
import type { RevenueSummary, MonthlyRevenue, RevenueForecast, GrossProfitTrend } from '../types';

type TabMode = 'actual' | 'forecast' | 'grossProfit';
type ViewMode = 'department' | 'group' | 'engineer' | 'monthly';
type ForecastGroupBy = 'department' | 'group' | 'engineer';
type GrossProfitGroupBy = 'total' | 'department' | 'group';
type PeriodType = 'month' | 'range';

const RevenuesPage: React.FC = () => {
  const [tabMode, setTabMode] = useState<TabMode>('actual');
  const [viewMode, setViewMode] = useState<ViewMode>('department');
  const [forecastGroupBy, setForecastGroupBy] = useState<ForecastGroupBy>('department');
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [yearMonth, setYearMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [forecastYearMonth, setForecastYearMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [fromMonth, setFromMonth] = useState(() => {
    const now = new Date();
    now.setMonth(now.getMonth() - 5);
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [toMonth, setToMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [summaryData, setSummaryData] = useState<RevenueSummary[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
  const [forecastData, setForecastData] = useState<RevenueForecast[]>([]);
  const [grossProfitData, setGrossProfitData] = useState<GrossProfitTrend[]>([]);
  const [grossProfitGroupBy, setGrossProfitGroupBy] = useState<GrossProfitGroupBy>('total');
  const [grossProfitFrom, setGrossProfitFrom] = useState(() => {
    const now = new Date();
    now.setMonth(now.getMonth() - 5);
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [grossProfitTo, setGrossProfitTo] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tabMode === 'actual') {
      loadActualData();
    } else if (tabMode === 'forecast') {
      loadForecastData();
    } else {
      loadGrossProfitData();
    }
  }, [tabMode, viewMode, periodType, yearMonth, fromMonth, toMonth, forecastGroupBy, forecastYearMonth, grossProfitGroupBy, grossProfitFrom, grossProfitTo]);

  const loadActualData = async () => {
    try {
      setLoading(true);
      setError('');

      if (viewMode === 'monthly') {
        const data = await revenuesApi.getMonthlyTrend({ from: fromMonth, to: toMonth });
        setMonthlyData(data);
        setSummaryData([]);
      } else {
        const params = periodType === 'month'
          ? { yearMonth }
          : { from: fromMonth, to: toMonth };

        let data: RevenueSummary[];
        switch (viewMode) {
          case 'department':
            data = await revenuesApi.summarizeByDepartment(params);
            break;
          case 'group':
            data = await revenuesApi.summarizeByGroup(params);
            break;
          case 'engineer':
            data = await revenuesApi.summarizeByEngineer(params);
            break;
          default:
            data = [];
        }
        setSummaryData(data);
        setMonthlyData([]);
      }
    } catch (err) {
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadForecastData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await revenuesApi.getForecast(forecastYearMonth, forecastGroupBy);
      setForecastData(data);
    } catch (err) {
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadGrossProfitData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await revenuesApi.getGrossProfitTrend({
        from: grossProfitFrom,
        to: grossProfitTo,
        groupBy: grossProfitGroupBy,
      });
      setGrossProfitData(data);
    } catch (err) {
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTotalRow = () => {
    if (summaryData.length === 0) return null;
    const total = summaryData.reduce(
      (acc, row) => ({
        totalRevenue: acc.totalRevenue + row.totalRevenue,
        totalCost: acc.totalCost + row.totalCost,
        totalProfit: acc.totalProfit + row.totalProfit,
      }),
      { totalRevenue: 0, totalCost: 0, totalProfit: 0 }
    );
    const profitRate = total.totalRevenue > 0
      ? (total.totalProfit / total.totalRevenue) * 100
      : 0;
    return { ...total, profitRate };
  };

  const getViewModeLabel = () => {
    switch (viewMode) {
      case 'department': return '部別';
      case 'group': return 'グループ別';
      case 'engineer': return 'エンジニア別';
      case 'monthly': return '月次推移';
    }
  };

  const getProfitRateColor = (rate: number) => {
    if (rate >= 30) return 'var(--color-success)';
    if (rate >= 20) return 'var(--color-primary)';
    if (rate >= 10) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

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

  const getForecastGroupByLabel = () => {
    switch (forecastGroupBy) {
      case 'department': return '部別';
      case 'group': return 'グループ別';
      case 'engineer': return 'エンジニア別';
    }
  };

  const getGrossProfitGroupByLabel = () => {
    switch (grossProfitGroupBy) {
      case 'total': return '全社';
      case 'department': return '部別';
      case 'group': return 'グループ別';
    }
  };

  const getForecastTotalRow = () => {
    if (forecastData.length === 0) return null;
    const total = forecastData.reduce(
      (acc, row) => ({
        confirmedRevenue: acc.confirmedRevenue + row.confirmedRevenue,
        estimatedRevenue: acc.estimatedRevenue + row.estimatedRevenue,
        totalRevenue: acc.totalRevenue + row.totalRevenue,
        confirmedCost: acc.confirmedCost + row.confirmedCost,
        estimatedCost: acc.estimatedCost + row.estimatedCost,
        totalCost: acc.totalCost + row.totalCost,
        confirmedProfit: acc.confirmedProfit + row.confirmedProfit,
        estimatedProfit: acc.estimatedProfit + row.estimatedProfit,
        totalProfit: acc.totalProfit + row.totalProfit,
      }),
      {
        confirmedRevenue: 0, estimatedRevenue: 0, totalRevenue: 0,
        confirmedCost: 0, estimatedCost: 0, totalCost: 0,
        confirmedProfit: 0, estimatedProfit: 0, totalProfit: 0,
      }
    );
    return total;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-navy-900)', fontFamily: 'Outfit, sans-serif' }}>
            売上レポート
          </h1>
          <p style={{ color: 'var(--color-slate-500)' }}>
            {tabMode === 'actual' ? getViewModeLabel() + 'の売上集計' : tabMode === 'forecast' ? getForecastGroupByLabel() + 'の売上予測' : getGrossProfitGroupByLabel() + 'の粗利推移'}
          </p>
        </div>
      </div>

      {/* Main Tab Selector */}
      <div className="mb-6">
        <div className="flex rounded-lg overflow-hidden border w-fit" style={{ borderColor: 'var(--color-slate-200)' }}>
          <button
            onClick={() => setTabMode('actual')}
            className="px-6 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: tabMode === 'actual' ? 'var(--color-primary)' : 'transparent',
              color: tabMode === 'actual' ? 'white' : 'var(--color-slate-600)',
            }}
          >
            売上実績
          </button>
          <button
            onClick={() => setTabMode('forecast')}
            className="px-6 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: tabMode === 'forecast' ? 'var(--color-primary)' : 'transparent',
              color: tabMode === 'forecast' ? 'white' : 'var(--color-slate-600)',
            }}
          >
            売上予測
          </button>
          <button
            onClick={() => setTabMode('grossProfit')}
            className="px-6 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: tabMode === 'grossProfit' ? 'var(--color-primary)' : 'transparent',
              color: tabMode === 'grossProfit' ? 'white' : 'var(--color-slate-600)',
            }}
          >
            粗利推移
          </button>
        </div>
      </div>

      {/* Filters for Actual */}
      {tabMode === 'actual' && (
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            {/* View Mode Tabs */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>
                集計単位
              </label>
              <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-slate-200)' }}>
                {(['department', 'group', 'engineer', 'monthly'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === mode
                        ? 'text-white'
                        : 'hover:bg-slate-50'
                    }`}
                    style={{
                      backgroundColor: viewMode === mode ? 'var(--color-primary)' : 'transparent',
                      color: viewMode === mode ? 'white' : 'var(--color-slate-600)',
                    }}
                  >
                    {mode === 'department' && '部別'}
                    {mode === 'group' && 'グループ別'}
                    {mode === 'engineer' && 'エンジニア別'}
                    {mode === 'monthly' && '月次推移'}
                  </button>
                ))}
              </div>
            </div>

            {/* Period Type (not shown for monthly view) */}
            {viewMode !== 'monthly' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>
                  期間タイプ
                </label>
                <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-slate-200)' }}>
                  <button
                    onClick={() => setPeriodType('month')}
                    className={`px-4 py-2 text-sm font-medium transition-colors`}
                    style={{
                      backgroundColor: periodType === 'month' ? 'var(--color-primary)' : 'transparent',
                      color: periodType === 'month' ? 'white' : 'var(--color-slate-600)',
                    }}
                  >
                    単月
                  </button>
                  <button
                    onClick={() => setPeriodType('range')}
                    className={`px-4 py-2 text-sm font-medium transition-colors`}
                    style={{
                      backgroundColor: periodType === 'range' ? 'var(--color-primary)' : 'transparent',
                      color: periodType === 'range' ? 'white' : 'var(--color-slate-600)',
                    }}
                  >
                    期間
                  </button>
                </div>
              </div>
            )}

            {/* Month Selector */}
            {viewMode !== 'monthly' && periodType === 'month' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>
                  対象月
                </label>
                <input
                  type="month"
                  value={yearMonth}
                  onChange={(e) => setYearMonth(e.target.value)}
                  className="input"
                  style={{ width: '160px' }}
                />
              </div>
            )}

            {/* Range Selector */}
            {(viewMode === 'monthly' || periodType === 'range') && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>
                    開始月
                  </label>
                  <input
                    type="month"
                    value={fromMonth}
                    onChange={(e) => setFromMonth(e.target.value)}
                    className="input"
                    style={{ width: '160px' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>
                    終了月
                  </label>
                  <input
                    type="month"
                    value={toMonth}
                    onChange={(e) => setToMonth(e.target.value)}
                    className="input"
                    style={{ width: '160px' }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Filters for Forecast */}
      {tabMode === 'forecast' && (
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>
                集計単位
              </label>
              <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-slate-200)' }}>
                {(['department', 'group', 'engineer'] as ForecastGroupBy[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setForecastGroupBy(mode)}
                    className="px-4 py-2 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: forecastGroupBy === mode ? 'var(--color-primary)' : 'transparent',
                      color: forecastGroupBy === mode ? 'white' : 'var(--color-slate-600)',
                    }}
                  >
                    {mode === 'department' && '部別'}
                    {mode === 'group' && 'グループ別'}
                    {mode === 'engineer' && 'エンジニア別'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>
                対象月
              </label>
              <input
                type="month"
                value={forecastYearMonth}
                onChange={(e) => setForecastYearMonth(e.target.value)}
                className="input"
                style={{ width: '160px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters for Gross Profit Trend */}
      {tabMode === 'grossProfit' && (
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>
                集計単位
              </label>
              <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-slate-200)' }}>
                {(['total', 'department', 'group'] as GrossProfitGroupBy[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setGrossProfitGroupBy(mode)}
                    className="px-4 py-2 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: grossProfitGroupBy === mode ? 'var(--color-primary)' : 'transparent',
                      color: grossProfitGroupBy === mode ? 'white' : 'var(--color-slate-600)',
                    }}
                  >
                    {mode === 'total' && '全社'}
                    {mode === 'department' && '部別'}
                    {mode === 'group' && 'グループ別'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>
                開始月
              </label>
              <input
                type="month"
                value={grossProfitFrom}
                onChange={(e) => setGrossProfitFrom(e.target.value)}
                className="input"
                style={{ width: '160px' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-slate-700)' }}>
                終了月
              </label>
              <input
                type="month"
                value={grossProfitTo}
                onChange={(e) => setGrossProfitTo(e.target.value)}
                className="input"
                style={{ width: '160px' }}
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'var(--color-danger-light)', border: '1px solid #fecaca' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-danger)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm" style={{ color: '#991b1b' }}>{error}</span>
        </div>
      )}

      {/* Summary Table (Actual) */}
      {tabMode === 'actual' && viewMode !== 'monthly' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{viewMode === 'department' ? '部' : viewMode === 'group' ? 'グループ' : 'エンジニア'}</th>
                {viewMode !== 'department' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{viewMode === 'group' ? '部' : 'グループ'}</th>}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">売上</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">原価</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">利益</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">利益率</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summaryData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                  {viewMode !== 'department' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.parentName || '-'}</td>}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatCurrency(row.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatCurrency(row.totalCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatCurrency(row.totalProfit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: getProfitRateColor(row.profitRate) }}>
                    {formatPercent(row.profitRate)}
                  </td>
                </tr>
              ))}
              {getTotalRow() && (
                <tr className="bg-gray-50 font-bold">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">合計</td>
                  {viewMode !== 'department' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatCurrency(getTotalRow()!.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatCurrency(getTotalRow()!.totalCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatCurrency(getTotalRow()!.totalProfit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: getProfitRateColor(getTotalRow()!.profitRate) }}>
                    {formatPercent(getTotalRow()!.profitRate)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Monthly Trend Table (Actual) */}
      {tabMode === 'actual' && viewMode === 'monthly' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年月</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">売上</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">原価</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">利益</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">利益率</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyData.map((row) => {
                const profitRate = row.totalRevenue > 0
                  ? (row.totalProfit / row.totalRevenue) * 100
                  : 0;
                return (
                  <tr key={row.yearMonth} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.yearMonth}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {formatCurrency(row.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {formatCurrency(row.totalCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {formatCurrency(row.totalProfit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: getProfitRateColor(profitRate) }}>
                      {formatPercent(profitRate)}
                    </td>
                  </tr>
                );
              })}
              {monthlyData.length > 0 && (() => {
                const total = monthlyData.reduce(
                  (acc, row) => ({
                    totalRevenue: acc.totalRevenue + row.totalRevenue,
                    totalCost: acc.totalCost + row.totalCost,
                    totalProfit: acc.totalProfit + row.totalProfit,
                  }),
                  { totalRevenue: 0, totalCost: 0, totalProfit: 0 }
                );
                const profitRate = total.totalRevenue > 0
                  ? (total.totalProfit / total.totalRevenue) * 100
                  : 0;
                return (
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">合計</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {formatCurrency(total.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {formatCurrency(total.totalCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {formatCurrency(total.totalProfit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: getProfitRateColor(profitRate) }}>
                      {formatPercent(profitRate)}
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      )}

      {/* Forecast Table */}
      {tabMode === 'forecast' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{forecastGroupBy === 'department' ? '部' : forecastGroupBy === 'group' ? 'グループ' : 'エンジニア'}</th>
                {forecastGroupBy !== 'department' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{forecastGroupBy === 'group' ? '部' : 'グループ'}</th>}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span style={{ color: 'var(--color-success)' }}>確定</span>売上
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span style={{ color: 'var(--color-warning)' }}>見込</span>売上
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">合計売上</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span style={{ color: 'var(--color-success)' }}>確定</span>利益
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span style={{ color: 'var(--color-warning)' }}>見込</span>利益
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">合計利益</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {forecastData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                  {forecastGroupBy !== 'department' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.parentName || '-'}</td>}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-success)' }}>
                    {formatCurrency(row.confirmedRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-warning)' }}>
                    {formatCurrency(row.estimatedRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatCurrency(row.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-success)' }}>
                    {formatCurrency(row.confirmedProfit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-warning)' }}>
                    {formatCurrency(row.estimatedProfit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatCurrency(row.totalProfit)}
                  </td>
                </tr>
              ))}
              {getForecastTotalRow() && (
                <tr className="bg-gray-50 font-bold">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">合計</td>
                  {forecastGroupBy !== 'department' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-success)' }}>
                    {formatCurrency(getForecastTotalRow()!.confirmedRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-warning)' }}>
                    {formatCurrency(getForecastTotalRow()!.estimatedRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatCurrency(getForecastTotalRow()!.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-success)' }}>
                    {formatCurrency(getForecastTotalRow()!.confirmedProfit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-warning)' }}>
                    {formatCurrency(getForecastTotalRow()!.estimatedProfit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatCurrency(getForecastTotalRow()!.totalProfit)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Gross Profit Trend Table */}
      {tabMode === 'grossProfit' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年月</th>
                {grossProfitGroupBy !== 'total' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{grossProfitGroupBy === 'department' ? '部' : 'グループ'}</th>
                )}
                {grossProfitGroupBy === 'group' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部</th>}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span style={{ color: 'var(--color-success)' }}>確定</span>粗利
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span style={{ color: 'var(--color-warning)' }}>見込</span>粗利
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">合計粗利</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span style={{ color: 'var(--color-success)' }}>確定</span>売上
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span style={{ color: 'var(--color-warning)' }}>見込</span>売上
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">合計売上</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">粗利率</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grossProfitData.map((row, index) => (
                <tr key={`${row.yearMonth}-${row.id ?? index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.yearMonth}</td>
                  {grossProfitGroupBy !== 'total' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.name || '-'}</td>
                  )}
                  {grossProfitGroupBy === 'group' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{row.parentName || '-'}</td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-success)' }}>
                    {formatCurrency(row.confirmedProfit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-warning)' }}>
                    {formatCurrency(row.estimatedProfit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatCurrency(row.totalProfit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-success)' }}>
                    {formatCurrency(row.confirmedRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-warning)' }}>
                    {formatCurrency(row.estimatedRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatCurrency(row.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: getProfitRateColor(row.totalRevenue > 0 ? (row.totalProfit / row.totalRevenue) * 100 : 0) }}>
                    {formatPercent(row.totalRevenue > 0 ? (row.totalProfit / row.totalRevenue) * 100 : 0)}
                  </td>
                </tr>
              ))}
              {grossProfitData.length > 0 && grossProfitGroupBy === 'total' && (() => {
                const total = grossProfitData.reduce(
                  (acc, row) => ({
                    confirmedProfit: acc.confirmedProfit + row.confirmedProfit,
                    estimatedProfit: acc.estimatedProfit + row.estimatedProfit,
                    totalProfit: acc.totalProfit + row.totalProfit,
                    confirmedRevenue: acc.confirmedRevenue + row.confirmedRevenue,
                    estimatedRevenue: acc.estimatedRevenue + row.estimatedRevenue,
                    totalRevenue: acc.totalRevenue + row.totalRevenue,
                  }),
                  {
                    confirmedProfit: 0, estimatedProfit: 0, totalProfit: 0,
                    confirmedRevenue: 0, estimatedRevenue: 0, totalRevenue: 0,
                  }
                );
                return (
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">合計</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-success)' }}>
                      {formatCurrency(total.confirmedProfit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-warning)' }}>
                      {formatCurrency(total.estimatedProfit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {formatCurrency(total.totalProfit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-success)' }}>
                      {formatCurrency(total.confirmedRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-warning)' }}>
                      {formatCurrency(total.estimatedRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {formatCurrency(total.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ fontFamily: 'Outfit, sans-serif', color: getProfitRateColor(total.totalRevenue > 0 ? (total.totalProfit / total.totalRevenue) * 100 : 0) }}>
                      {formatPercent(total.totalRevenue > 0 ? (total.totalProfit / total.totalRevenue) * 100 : 0)}
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {((tabMode === 'actual' && summaryData.length === 0 && monthlyData.length === 0) ||
        (tabMode === 'forecast' && forecastData.length === 0) ||
        (tabMode === 'grossProfit' && grossProfitData.length === 0)) && !loading && (
        <div className="text-center py-16" style={{ color: 'var(--color-slate-500)' }}>
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>該当するデータがありません</p>
        </div>
      )}
    </div>
  );
};

export default RevenuesPage;
