
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { Project, Client, Activity, Page, TeamMember, Case, EnrichedTask, RecentItem } from '../types';
import { ProjectStatus, ActivityType, ActivityStatus, TaskStatus } from '../types';
import { getDeadlineStatus } from '../utils/dateHelpers';
import { generateDailyBriefing } from '../services/geminiService';
// FIX: Import icons from the central icons file instead of defining them locally.
import { BuildingIcon, UsersIcon, DollarSignIcon, TrendingUpIcon, PhoneIcon, MailIcon, DocumentTextIcon, FolderIcon, CaseIcon } from './icons';

// FIX: Update DashboardProps to match props passed from App.tsx. Added `recentlyViewed` and replaced `setCurrentPage`/`onScheduleEvent` with `onNavigate`.
interface DashboardProps {
  projects: Project[];
  clients: Client[];
  cases: Case[];
  activities: Activity[];
  teamMembers: TeamMember[];
  recentlyViewed: RecentItem[];
  currentUserId: string;
  onSelectProject: (id: string) => void;
  onNavigate: (page: Page, id?: string) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; subtitle: string; icon: React.ReactNode; color: string }> = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-5 rounded-lg border border-white/20 shadow-lg text-shadow-strong">
    <div className="flex justify-between items-start">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
      <div className={`${color}`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-3xl font-bold text-slate-900 mt-2 dark:text-slate-100">{value}</p>
      <p className="text-xs text-green-800 dark:text-green-400 font-semibold">{subtitle}</p>
    </div>
  </div>
);

const DailyBriefing: React.FC<{
    userName: string;
    projects: Project[];
    cases: Case[];
    activities: Activity[];
    currentUserId: string;
}> = ({ userName, projects, cases, activities, currentUserId }) => {
    const [briefing, setBriefing] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const getBriefing = useCallback(async () => {
        setIsLoading(true);

        const allTasks: EnrichedTask[] = projects.flatMap(p => 
            p.tasks.map(t => ({...t, projectName: p.name, projectId: p.id}))
        );
        const myTasks = allTasks.filter(t => t.teamMemberId === currentUserId);
        
        const summary = await generateDailyBriefing(userName, myTasks, cases, activities);
        setBriefing(summary);
        setIsLoading(false);
    }, [userName, projects, cases, activities, currentUserId]);

    useEffect(() => {
        getBriefing();
    }, [getBriefing]);

    return (
        <div id="daily-briefing" className="relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-6 rounded-lg shadow-lg text-white overflow-hidden text-shadow-strong">
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-cyan-500/10 rounded-full filter blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-violet-500/10 rounded-full filter blur-2xl"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold">Daily Briefing</h3>
                        <p className="text-sm text-slate-300">Your AI-powered morning summary.</p>
                    </div>
                    <button onClick={getBriefing} disabled={isLoading} className="p-1.5 rounded-full text-slate-300 hover:bg-white/10 disabled:opacity-50" aria-label="Refresh briefing">
                        <RefreshIcon isLoading={isLoading} />
                    </button>
                </div>
                <div className="mt-4 min-h-[72px]">
                    {isLoading ? (
                         <div className="space-y-2 animate-pulse">
                            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-700 rounded w-full"></div>
                            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                        </div>
                    ) : (
                        <p className="text-slate-200 whitespace-pre-wrap">{briefing}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

const RefreshIcon: React.FC<{ isLoading: boolean }> = ({ isLoading }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0121.5 13.5M20 20l-1.5-1.5A9 9 0 012.5 10.5" />
    </svg>
);


const ActivityIcon: React.FC<{type: ActivityType; minimal?: boolean}> = ({ type, minimal }) => {
    const icons = {
        [ActivityType.Call]: <PhoneIcon />,
        [ActivityType.Email]: <MailIcon />,
        [ActivityType.Meeting]: <UsersIcon />,
        [ActivityType.Note]: <DocumentTextIcon />,
    };
    const colors = {
        [ActivityType.Call]: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-400',
        [ActivityType.Email]: 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400',
        [ActivityType.Meeting]: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-400',
        [ActivityType.Note]: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    }
    if (minimal) {
        return <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white/50 text-slate-600 dark:bg-white/20 dark:text-slate-200 shadow-inner">{icons[type]}</div>;
    }
    return <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${colors[type]}`}>{icons[type]}</div>;
}

const TaskIcon = () => (
    <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white/50 text-slate-600 dark:bg-white/20 dark:text-slate-200 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    </div>
);


const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
};

const ProjectsNearingDeadline: React.FC<{ projects: Project[], onSelectProject: (id: string) => void }> = ({ projects, onSelectProject }) => {
    const nearingDeadline = useMemo(() => {
        return projects
            .filter(p => p.status !== ProjectStatus.Completed)
            .map(p => ({ ...p, deadline: getDeadlineStatus(p.endDate) }))
            .filter(p => p.deadline.status !== 'completed') // Should be redundant but good practice
            .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
            .slice(0, 5);
    }, [projects]);

    return (
        <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-lg border border-white/20 shadow-lg text-shadow-strong">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Projects Nearing Deadline</h3>
            <ul className="space-y-4">
                {nearingDeadline.length > 0 ? nearingDeadline.map(project => (
                    <li key={project.id}>
                        <button onClick={() => onSelectProject(project.id)} className="w-full text-left group">
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="font-semibold text-slate-800 group-hover:text-cyan-600 dark:text-slate-100 dark:group-hover:text-cyan-400 truncate pr-2">{project.name}</span>
                                <span className={`font-semibold ${project.deadline.color} flex-shrink-0`}>{project.deadline.text}</span>
                            </div>
                        </button>
                    </li>
                )) : (
                    <p className="text-sm text-slate-600 dark:text-slate-300 text-center py-8">No upcoming project deadlines.</p>
                )}
            </ul>
        </div>
    );
}


export const Dashboard: React.FC<DashboardProps> = ({ projects, clients, cases, activities, teamMembers, recentlyViewed, currentUserId, onSelectProject, onNavigate }) => {
  const activeProjects = projects.filter(p => p.status === ProjectStatus.InProgress).length;
  const recentActivities = activities.slice(0, 5);
  const currentUser = useMemo(() => teamMembers.find(tm => tm.id === currentUserId), [teamMembers, currentUserId]);


  const getClientName = (clientId: string | null | undefined) => {
      if (!clientId) return 'Internal';
      return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  }

  const upcomingItems = useMemo(() => {
    const myTasks = projects.flatMap(p => p.tasks.map(t => ({...t, projectName: p.name, projectId: p.id})))
      .filter(task => task.teamMemberId === currentUserId && task.status !== TaskStatus.Done);
      
    const scheduledActivities = activities.filter(act => act.status === ActivityStatus.Scheduled);

    const combined = [
      ...myTasks.map(task => ({
        id: task.id,
        date: new Date(task.dueDate),
        title: task.description,
        type: 'Task',
        context: `Project: ${task.projectName}`,
        icon: <TaskIcon />,
        onClick: () => onNavigate('tasks')
      })),
      ...scheduledActivities.map(act => ({
        id: act.id,
        date: new Date(`${act.activityDate}T${act.activityTime || '00:00:00'}`),
        title: act.title,
        type: act.type,
        context: act.clientId ? `Client: ${getClientName(act.clientId)}` : 'Internal',
        icon: <ActivityIcon type={act.type} minimal />,
        onClick: () => onNavigate('activities')
      }))
    ];

    return combined.sort((a,b) => a.date.getTime() - b.date.getTime()).slice(0, 5);
  }, [projects, activities, currentUserId, getClientName, onNavigate]);

  const recentItemIcon = (type: RecentItem['type']) => {
      const iconClass = "h-4 w-4";
      switch(type) {
          case 'project': return <FolderIcon className={iconClass} />;
          case 'organization': return <BuildingIcon className={iconClass} />;
          case 'case': return <CaseIcon className={iconClass} />;
      }
  }


  return (
    <div className="space-y-8">
      <DailyBriefing 
        userName={currentUser?.name || 'User'}
        projects={projects}
        cases={cases}
        activities={activities}
        currentUserId={currentUserId}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Organizations" value={clients.length} subtitle={`${clients.length} active`} icon={<BuildingIcon />} color="text-cyan-600 dark:text-cyan-400" />
        <StatCard title="Total Contacts" value={clients.length} subtitle="All contacts" icon={<UsersIcon />} color="text-cyan-600 dark:text-cyan-400"/>
        <StatCard title="Pipeline Value" value="$0K" subtitle="Total project value" icon={<DollarSignIcon />} color="text-cyan-600 dark:text-cyan-400"/>
        <StatCard title="Active Projects" value={activeProjects} subtitle={`${projects.length} total projects`} icon={<TrendingUpIcon />} color="text-cyan-600 dark:text-cyan-400"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProjectsNearingDeadline projects={projects} onSelectProject={onSelectProject} />
          <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-lg border border-white/20 shadow-lg text-shadow-strong">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Recent Activities</h3>
            <ul className="space-y-4">
              {recentActivities.map(activity => (
                  <li key={activity.id} className="flex items-center gap-4">
                      <ActivityIcon type={activity.type} />
                      <div className="flex-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{activity.title}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{getClientName(activity.clientId)}</p>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{formatTimeAgo(activity.activityDate)}</p>
                  </li>
              ))}
              {recentActivities.length === 0 && <p className="text-slate-600 dark:text-slate-400">No recent activities.</p>}
            </ul>
          </div>
        </div>
        <div className="space-y-6">
            <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-lg border border-white/20 shadow-lg text-shadow-strong flex flex-col">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Upcoming For You</h3>
                <ul className="space-y-4 flex-grow">
                    {upcomingItems.length > 0 ? upcomingItems.map(item => (
                        <li key={`${item.type}-${item.id}`} className="flex items-center gap-3 group cursor-pointer" onClick={item.onClick}>
                            <div className="flex-shrink-0">{item.icon}</div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{item.title}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">{item.date.toLocaleDateString()} - {item.context}</p>
                            </div>
                        </li>
                    )) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className="text-sm text-slate-600 dark:text-slate-400">Nothing upcoming on your schedule.</p>
                        </div>
                    )}
                </ul>
            </div>
             <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-lg border border-white/20 shadow-lg text-shadow-strong flex flex-col">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Recently Viewed</h3>
                <ul className="space-y-4 flex-grow">
                    {recentlyViewed.length > 0 ? recentlyViewed.map(item => (
                        <li key={`${item.type}-${item.id}`} className="flex items-center gap-3 group cursor-pointer" onClick={() => onNavigate(item.link, item.id)}>
                            <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white/50 text-slate-600 dark:bg-white/20 dark:text-slate-200 shadow-inner">
                                {recentItemIcon(item.type)}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 capitalize">{item.label}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">{item.type}</p>
                            </div>
                        </li>
                    )) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className="text-sm text-slate-600 dark:text-slate-400">No recently viewed items.</p>
                        </div>
                    )}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};
