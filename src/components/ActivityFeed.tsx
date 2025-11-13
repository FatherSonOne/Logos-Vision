
import React, { useState, useMemo } from 'react';
import type { Activity, Client, Project, TeamMember } from '../types';
import { ActivityType } from '../types';
import { EmptyState } from './ui/EmptyState';
import { ActivityCard } from './enhanced/ActivityCard';
import { PlusIcon, ClipboardListIcon } from './icons';

interface ActivityFeedProps {
    activities: Activity[];
    projects: Project[];
    clients: Client[];
    teamMembers: TeamMember[];
    onLogActivity: () => void;
    onEdit: (activity: Activity) => void;
    onDelete: (activityId: string) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, projects, clients, teamMembers, onLogActivity, onEdit, onDelete }) => {
    const [typeFilter, setTypeFilter] = useState('all');
    const [memberFilter, setMemberFilter] = useState('all');
    
    const findName = (id: string | undefined | null, type: 'client' | 'project' | 'teamMember') => {
        if (!id) return '';
        switch(type) {
            case 'client': return clients.find(c => c.id === id)?.name;
            case 'project': return projects.find(p => p.id === id)?.name;
            case 'teamMember': return teamMembers.find(m => m.id === id)?.name;
            default: return '';
        }
    }

    const filteredActivities = useMemo(() => {
        return activities.filter(activity => {
            const typeMatch = typeFilter === 'all' || activity.type === typeFilter;
            const memberMatch = memberFilter === 'all' || activity.createdById === memberFilter;
            return typeMatch && memberMatch;
        });
    }, [activities, typeFilter, memberFilter]);


    return (
        <div className="text-shadow-strong">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Activity Feed</h2>
                  <p className="text-slate-600 mt-1 dark:text-slate-300">A chronological log of all team and client interactions.</p>
                </div>
                <button 
                    onClick={onLogActivity}
                    className="flex items-center bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md"
                >
                    <PlusIcon />
                    Log Activity
                </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6 p-4 bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl rounded-lg border border-white/20 shadow-lg">
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-white/50 dark:bg-black/30 border-white/30 dark:border-white/10 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                >
                    <option value="all">All Types</option>
                    {Object.values(ActivityType).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <select
                    value={memberFilter}
                    onChange={(e) => setMemberFilter(e.target.value)}
                    className="bg-white/50 dark:bg-black/30 border-white/30 dark:border-white/10 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                >
                    <option value="all">All Team Members</option>
                    {teamMembers.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
                </select>
            </div>

            <div className="space-y-6">
                 {filteredActivities.length > 0 ? (
                    filteredActivities.map(activity => (
                        <ActivityCard
                            key={activity.id}
                            activity={activity}
                            clientName={findName(activity.clientId, 'client')}
                            projectName={findName(activity.projectId, 'project')}
                            teamMemberName={findName(activity.createdById, 'teamMember')}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))
                 ) : (
                    <EmptyState
                        icon={<ClipboardListIcon />}
                        title="No Activities Found"
                        message="Try adjusting your filters or logging a new call, meeting, or note."
                        actionText="Log Activity"
                        onAction={onLogActivity}
                    />
                )}
            </div>
        </div>
    );
};
