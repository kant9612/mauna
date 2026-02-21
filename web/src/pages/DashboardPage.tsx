import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import { customersApi } from '../api/customers';
import { engineersApi } from '../api/engineers';
import { assignmentsApi } from '../api/assignments';
import { useAuth } from '../contexts/AuthContext';
import GroupAssignmentChart from '../components/GroupAssignmentChart';
import type { ResourceShortageAlert, AssignmentSchedule, Engineer } from '../types';

interface DashboardStats {
  projectCount: number;
  activeEngineers: number;
  customerCount: number;
}

interface RecentActivity {
  type: 'project' | 'customer' | 'engineer';
  message: string;
  date?: string;
  id?: number;
}

interface SectionErrors {
  stats: boolean;
  resourceShortages: boolean;
  entries: boolean;
  exits: boolean;
  standby: boolean;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { groupId, groupName } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    projectCount: 0,
    activeEngineers: 0,
    customerCount: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [resourceShortages, setResourceShortages] = useState<ResourceShortageAlert[]>([]);
  const [upcomingEntries, setUpcomingEntries] = useState<AssignmentSchedule[]>([]);
  const [upcomingExits, setUpcomingExits] = useState<AssignmentSchedule[]>([]);
  const [standbyEngineers, setStandbyEngineers] = useState<Engineer[]>([]);
  const [sectionErrors, setSectionErrors] = useState<SectionErrors>({
    stats: false,
    resourceShortages: false,
    entries: false,
    exits: false,
    standby: false,
  });

  useEffect(() => {
    loadDashboardData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const sixMonthsLater = new Date(now.getFullYear(), now.getMonth() + 7, 0);
      const to = `${sixMonthsLater.getFullYear()}-${String(sixMonthsLater.getMonth() + 1).padStart(2, '0')}-${String(sixMonthsLater.getDate()).padStart(2, '0')}`;

      const results = await Promise.allSettled([
        projectsApi.getAll(),
        customersApi.getAll(),
        engineersApi.getAll(),
        projectsApi.getResourceShortages(),
        assignmentsApi.getUpcomingEntries({ from, to }),
        assignmentsApi.getUpcomingExits({ from, to }),
        assignmentsApi.getStandbyEngineers(today),
      ]);

      const errors: SectionErrors = {
        stats: false,
        resourceShortages: false,
        entries: false,
        exits: false,
        standby: false,
      };

      const projectsResult = results[0];
      const customersResult = results[1];
      const engineersResult = results[2];

      if (
        projectsResult.status === 'fulfilled' &&
        customersResult.status === 'fulfilled' &&
        engineersResult.status === 'fulfilled'
      ) {
        const projects = projectsResult.value;
        const customers = customersResult.value;
        const engineers = engineersResult.value;

        const projectCount = projects.filter((p) => p.status === 'ACTIVE').length;
        const activeEngineers = engineers.filter((e) => e.employmentStatus === 'ACTIVE').length;
        const customerCount = customers.length;

        setStats({ projectCount, activeEngineers, customerCount });

        const activities: RecentActivity[] = [];

        const recentProjects = [...projects]
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 3);
        recentProjects.forEach((project) => {
          activities.push({
            type: 'project',
            message: `案件「${project.name}」のステータス: ${getStatusLabel(project.status)}`,
            date: project.startDate,
            id: project.id,
          });
        });

        const recentCustomers = [...customers]
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 2);
        recentCustomers.forEach((customer) => {
          activities.push({
            type: 'customer',
            message: `顧客「${customer.name}」が登録されています`,
            id: customer.id,
          });
        });

        const recentEngineers = [...engineers]
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 2);
        recentEngineers.forEach((engineer) => {
          activities.push({
            type: 'engineer',
            message: `エンジニア「${engineer.name}」: ${getEmploymentStatusLabel(engineer.employmentStatus)}`,
            id: engineer.id,
          });
        });

        const sorted = activities.sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 7);
        setRecentActivities(sorted);
      } else {
        errors.stats = true;
      }

      const shortagesResult = results[3];
      if (shortagesResult.status === 'fulfilled') {
        setResourceShortages(shortagesResult.value);
      } else {
        errors.resourceShortages = true;
      }

      const entriesResult = results[4];
      if (entriesResult.status === 'fulfilled') {
        setUpcomingEntries(entriesResult.value);
      } else {
        errors.entries = true;
      }

      const exitsResult = results[5];
      if (exitsResult.status === 'fulfilled') {
        setUpcomingExits(exitsResult.value);
      } else {
        errors.exits = true;
      }

      const standbyResult = results[6];
      if (standbyResult.status === 'fulfilled') {
        setStandbyEngineers(standbyResult.value);
      } else {
        errors.standby = true;
      }

      setSectionErrors(errors);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PLANNING': return '計画中';
      case 'ACTIVE': return '稼働中';
      case 'IN_PROGRESS': return '進行中';
      case 'ON_HOLD': return '保留';
      case 'COMPLETED': return '完了';
      case 'CANCELLED': return 'キャンセル';
      default: return status;
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

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  const handleActivityClick = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'project': navigate('/projects'); break;
      case 'customer': navigate('/customers'); break;
      case 'engineer': navigate('/engineers'); break;
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white shadow rounded p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1">
                  <div className="h-8 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded p-6">
            <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full bg-gray-200 rounded mb-2 animate-pulse" />
            ))}
          </div>
          <div className="bg-white shadow rounded p-6">
            <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full bg-gray-200 rounded mb-2 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ダッシュボード</h1>
        <p className="text-gray-600">システムの概要と重要な情報をまとめて表示します</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {sectionErrors.stats ? (
          <div className="col-span-3 bg-white shadow rounded p-6 text-center text-gray-500">
            統計データを取得できませんでした
          </div>
        ) : (
          <>
            <div
              onClick={() => handleCardClick('/projects')}
              className="bg-white shadow rounded p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.projectCount}<span className="text-sm ml-1">件</span></div>
                  <div className="text-sm text-gray-500">稼働中の案件</div>
                </div>
              </div>
            </div>

            <div
              onClick={() => handleCardClick('/engineers')}
              className="bg-white shadow rounded p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.activeEngineers}<span className="text-sm ml-1">名</span></div>
                  <div className="text-sm text-gray-500">在籍エンジニア</div>
                </div>
              </div>
            </div>

            <div
              onClick={() => handleCardClick('/customers')}
              className="bg-white shadow rounded p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.customerCount}<span className="text-sm ml-1">社</span></div>
                  <div className="text-sm text-gray-500">取引先企業</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Resource Shortage Alerts */}
      {sectionErrors.resourceShortages ? (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">リソース不足アラート</h2>
          <div className="bg-white shadow rounded p-6 text-center text-gray-500">
            リソース不足データを取得できませんでした
          </div>
        </div>
      ) : resourceShortages.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">リソース不足アラート</h2>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">{resourceShortages.length}件</span>
          </div>
          <div className="bg-white shadow rounded overflow-hidden">
            <div className="divide-y divide-gray-200">
              {resourceShortages.map((alert) => (
                <div
                  key={alert.projectId}
                  onClick={() => navigate('/projects')}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded bg-red-100 flex items-center justify-center">
                    <span className="font-bold text-lg text-red-600">-{alert.shortage}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{alert.projectName}</span>
                      {alert.customerName && (
                        <span className="text-sm text-gray-500">({alert.customerName})</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      必要人数: {alert.requiredHeadcount}名 / アサイン済: {alert.assignedCount}名
                      {alert.projectStartDate && ` | 開始日: ${alert.projectStartDate}`}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Group Assignment Chart */}
      {groupId && groupName && (
        <div className="mb-8">
          <GroupAssignmentChart groupId={groupId} groupName={groupName} />
        </div>
      )}

      {/* Entry/Exit Schedule */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* Entries */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">入場予定</h2>
            {upcomingEntries.length > 0 && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{upcomingEntries.length}件</span>
            )}
          </div>
          {sectionErrors.entries ? (
            <div className="bg-white shadow rounded p-6 text-center text-gray-500">
              入場予定データを取得できませんでした
            </div>
          ) : (
            <div className="bg-white shadow rounded overflow-hidden">
              {upcomingEntries.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-200">
                    {upcomingEntries.slice(0, 5).map((entry) => (
                      <ScheduleItem
                        key={entry.assignmentId}
                        item={entry}
                        type="entry"
                        onClick={() => navigate('/schedule')}
                      />
                    ))}
                  </div>
                  {upcomingEntries.length > 5 && (
                    <div
                      onClick={() => navigate('/schedule')}
                      className="px-4 py-3 text-center text-sm text-blue-600 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    >
                      すべて表示 ({upcomingEntries.length}件)
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  入場予定はありません
                </div>
              )}
            </div>
          )}
        </div>

        {/* Exits */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">退場予定</h2>
            {upcomingExits.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">{upcomingExits.length}件</span>
            )}
          </div>
          {sectionErrors.exits ? (
            <div className="bg-white shadow rounded p-6 text-center text-gray-500">
              退場予定データを取得できませんでした
            </div>
          ) : (
            <div className="bg-white shadow rounded overflow-hidden">
              {upcomingExits.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-200">
                    {upcomingExits.slice(0, 5).map((exit) => (
                      <ScheduleItem
                        key={exit.assignmentId}
                        item={exit}
                        type="exit"
                        onClick={() => navigate('/schedule')}
                      />
                    ))}
                  </div>
                  {upcomingExits.length > 5 && (
                    <div
                      onClick={() => navigate('/schedule')}
                      className="px-4 py-3 text-center text-sm text-blue-600 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    >
                      すべて表示 ({upcomingExits.length}件)
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  退場予定はありません
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Standby Engineers */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">待機メンバー</h2>
          {standbyEngineers.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{standbyEngineers.length}名</span>
          )}
        </div>
        {sectionErrors.standby ? (
          <div className="bg-white shadow rounded p-6 text-center text-gray-500">
            待機メンバーデータを取得できませんでした
          </div>
        ) : (
          <div className="bg-white shadow rounded overflow-hidden">
            {standbyEngineers.length > 0 ? (
              <>
                <div className="divide-y divide-gray-200">
                  {standbyEngineers.slice(0, 10).map((engineer) => (
                    <div
                      key={engineer.id}
                      onClick={() => navigate('/engineers')}
                      className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-medium text-sm text-blue-600">
                        {engineer.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-gray-900">{engineer.name}</span>
                          {engineer.groupName && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{engineer.groupName}</span>
                          )}
                        </div>
                        {engineer.skillSet && (
                          <div className="text-sm text-gray-500 truncate">
                            {engineer.skillSet}
                          </div>
                        )}
                      </div>
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  ))}
                </div>
                {standbyEngineers.length > 10 && (
                  <div
                    onClick={() => navigate('/engineers')}
                    className="px-4 py-3 text-center text-sm text-blue-600 bg-gray-50 cursor-pointer hover:bg-gray-100"
                  >
                    すべて表示 ({standbyEngineers.length}名)
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-gray-500">
                待機メンバーはいません
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Activities */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最近の活動</h2>
        <div className="bg-white shadow rounded overflow-hidden">
          {recentActivities.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  onClick={() => handleActivityClick(activity)}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded flex items-center justify-center ${
                    activity.type === 'project' ? 'bg-blue-100' :
                    activity.type === 'customer' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {activity.type === 'project' && (
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                      </svg>
                    )}
                    {activity.type === 'customer' && (
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                      </svg>
                    )}
                    {activity.type === 'engineer' && (
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-700">{activity.message}</div>
                  </div>
                  {activity.date && (
                    <div className="text-sm text-gray-500">{activity.date}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              最近の活動はありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Schedule Item Component
const ScheduleItem: React.FC<{
  item: AssignmentSchedule;
  type: 'entry' | 'exit';
  onClick: () => void;
}> = ({ item, type, onClick }) => (
  <div
    onClick={onClick}
    className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4"
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="font-medium text-gray-900">{item.engineerName}</span>
        {item.groupName && (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{item.groupName}</span>
        )}
      </div>
      <div className="text-sm text-gray-500">
        {item.projectName}
        {item.customerName && ` (${item.customerName})`}
      </div>
    </div>
    <div className={`text-sm font-medium ${type === 'entry' ? 'text-green-600' : 'text-red-600'}`}>
      {type === 'entry' ? item.startDate : item.endDate}
    </div>
  </div>
);

export default DashboardPage;
