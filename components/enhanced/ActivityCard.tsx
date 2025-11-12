import React from 'react';
import type { Activity } from '../../types';
import { ActivityType } from '../../types';
// FIX: Import getStatusVariant to determine the badge variant dynamically.
import { StatusBadge, getStatusVariant } from '../ui/StatusBadge';
import { PhoneIcon, MailIcon, UsersIcon, DocumentTextIcon, PencilIcon, TrashIcon } from '../icons';

interface ActivityCardProps {
    activity: Activity;
    clientName?: string;
    projectName?: string;
    teamMemberName?: string;
    onEdit: (activity: Activity) => void;
    onDelete: (activityId: string) => void;
}

const ActivityTypeIcon: React.FC<{ type: ActivityType }> = ({ type }) => {
    const icons: Record<ActivityType, React.ReactNode> = {
        [ActivityType.Call]: <PhoneIcon />,
        [ActivityType.Email]: <MailIcon />,
        [ActivityType.Meeting]: <UsersIcon />,
        [ActivityType.Note]: <DocumentTextIcon />
    }
    return <div className="h-10 w-10 rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center text-slate-500 flex-shrink-0 dark:text-slate-400 shadow-inner">{icons[type] || <DocumentTextIcon />}</div>
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, clientName, projectName, teamMemberName, onEdit, onDelete }) => {
  return (
    <div className="flex space-x-4">
        <ActivityTypeIcon type={activity.type} />
        <div 
            className="flex-1 bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-4 rounded-lg border border-white/20 group relative cursor-pointer hover:border-white/40 dark:hover:border-white/20 transition-colors"
            onClick={() => onEdit(activity)}
        >
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onEdit(activity); }} title="Edit Activity" className="p-1.5 text-slate-500 hover:bg-white/50 rounded-md dark:text-slate-400 dark:hover:bg-black/20">
                    <PencilIcon />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }} title="Delete Activity" className="p-1.5 text-slate-500 hover:bg-white/50 rounded-md dark:text-slate-400 dark:hover:bg-black/20">
                    <TrashIcon />
                </button>
            </div>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{activity.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Logged by {teamMemberName} on {new Date(activity.activityDate).toLocaleDateString()}
                    </p>
                </div>
                {/* FIX: Correctly pass `label` and `variant` props to StatusBadge. */}
                <StatusBadge label={activity.status} variant={getStatusVariant(activity.status)} />
            </div>

            {activity.notes && (
                <p className="text-sm text-slate-600 mt-3 border-l-2 border-slate-200 pl-3 whitespace-pre-wrap dark:text-slate-300 dark:border-slate-600">{activity.notes}</p>
            )}

            <div className="text-xs text-slate-500 mt-3 flex flex-wrap gap-x-4 gap-y-1 dark:text-slate-400">
                {clientName && <span>Client: <span className="font-medium text-teal-600 dark:text-teal-400">{clientName}</span></span>}
                {projectName && <span>Project: <span className="font-medium text-teal-600 dark:text-teal-400">{projectName}</span></span>}
            </div>
        </div>
    </div>
  );
};
