import React, { useEffect, useState } from 'react';
import { groupsApi } from '../api/organizations';
import type { GroupMemberAssignmentResponse, ProjectAssignment, MemberAssignment } from '../types';

interface GroupAssignmentChartProps {
  groupId: number;
  groupName: string;
}

const GroupAssignmentChart: React.FC<GroupAssignmentChartProps> = ({ groupId, groupName }) => {
  const [data, setData] = useState<GroupMemberAssignmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 6, 0);

  const months: { label: string; start: Date; end: Date }[] = [];
  for (let i = 0; i < 6; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + i + 1, 0);
    months.push({
      label: `${monthStart.getMonth() + 1}月`,
      start: monthStart,
      end: monthEnd,
    });
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const from = formatDate(startDate);
        const to = formatDate(endDate);
        const result = await groupsApi.getMemberAssignments(groupId, from, to);
        setData(result);
        setError(false);
      } catch (err) {
        console.error('Failed to load member assignments:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [groupId]);

  const formatDate = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const calculateBarPosition = (member: MemberAssignment): { left: number; width: number } | null => {
    const memberStart = new Date(member.startDate);
    const memberEnd = member.endDate ? new Date(member.endDate) : endDate;

    if (memberEnd < startDate || memberStart > endDate) {
      return null;
    }

    const displayStart = memberStart < startDate ? startDate : memberStart;
    const displayEnd = memberEnd > endDate ? endDate : memberEnd;

    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const startDays = (displayStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const durationDays = (displayEnd.getTime() - displayStart.getTime()) / (1000 * 60 * 60 * 24) + 1;

    const left = (startDays / totalDays) * 100;
    const width = (durationDays / totalDays) * 100;

    return { left, width };
  };

  const barColors = [
    'gantt-bar-cyan',
    'gantt-bar-emerald',
    'gantt-bar-violet',
    'gantt-bar-amber',
    'gantt-bar-rose',
    'gantt-bar-sky',
  ];

  if (loading) {
    return (
      <div>
        <SectionHeader title={`${groupName}のメンバー案件参画状況`} />
        <div className="card p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="skeleton h-4 w-48 rounded mb-2" />
                <div className="skeleton h-24 w-full rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <SectionHeader title={`${groupName}のメンバー案件参画状況`} />
        <div className="card p-12 text-center" style={{ color: 'var(--color-slate-500)' }}>
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p>データを取得できませんでした</p>
        </div>
      </div>
    );
  }

  if (!data || data.projects.length === 0) {
    return (
      <div>
        <SectionHeader title={`${groupName}のメンバー案件参画状況`} />
        <div className="card p-12 text-center" style={{ color: 'var(--color-slate-500)' }}>
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p>表示期間内にアサインがありません</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title={`${groupName}のメンバー案件参画状況`} />
      <div className="space-y-6">
        {data.projects.map((project: ProjectAssignment) => (
          <div key={project.projectId} className="card overflow-hidden">
            {/* Project Header */}
            <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--color-slate-200)', background: 'var(--color-slate-50)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </div>
              <div>
                <div className="font-medium" style={{ color: 'var(--color-slate-900)', fontFamily: 'var(--font-display)' }}>
                  {project.projectName}
                </div>
                {project.customerName && (
                  <div className="text-sm" style={{ color: 'var(--color-slate-500)' }}>
                    {project.customerName}
                  </div>
                )}
              </div>
            </div>

            {/* Gantt Chart */}
            <div className="gantt-container" style={{ border: 'none', borderRadius: 0 }}>
              {/* Month Headers */}
              <div className="gantt-header">
                <div className="gantt-name-cell" style={{ background: 'var(--color-slate-50)' }}>メンバー</div>
                {months.map((month, i) => (
                  <div key={i} className="gantt-header-cell">
                    {month.label}
                  </div>
                ))}
              </div>

              {/* Member Rows */}
              {project.members.map((member: MemberAssignment, memberIndex: number) => {
                const barPosition = calculateBarPosition(member);
                const colorClass = barColors[memberIndex % barColors.length];

                return (
                  <div key={member.engineerId} className="gantt-row">
                    <div className="gantt-name-cell">
                      {member.engineerName}
                    </div>
                    <div className="flex-1 relative" style={{ height: '2.5rem' }}>
                      {/* Month grid lines */}
                      <div className="absolute inset-0 flex">
                        {months.map((_, i) => (
                          <div
                            key={i}
                            className="flex-1"
                            style={{ borderRight: i < months.length - 1 ? '1px solid var(--color-slate-100)' : 'none' }}
                          />
                        ))}
                      </div>
                      {/* Gantt Bar */}
                      {barPosition && (
                        <div
                          className={`gantt-bar ${colorClass}`}
                          style={{
                            left: `${barPosition.left}%`,
                            width: `${barPosition.width}%`,
                            minWidth: '24px',
                          }}
                          title={`${member.engineerName}: ${member.startDate} - ${member.endDate || '継続中'}`}
                        >
                          {barPosition.width > 12 && (
                            <span className="truncate">{member.role || ''}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Section Header Component
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(8, 145, 178, 0.1)', color: 'var(--color-primary-600)' }}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    </div>
    <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-900)' }}>
      {title}
    </h2>
  </div>
);

export default GroupAssignmentChart;
