import React from 'react';
import type { Project } from '../../types';
import { ProjectStatus, TaskStatus } from '../../types';
import { getDeadlineStatus } from '../../utils/dateHelpers';
import { StatusBadge } from '../ui/StatusBadge';
import { ClockIcon } from '../icons';

interface ProjectCardProps {
  project: Project;
  clientName: string;
  onSelectProject: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, clientName, onSelectProject }) => {
    const completionPercentage = project.tasks.length > 0
        ? (project.tasks.filter(t => t.status === TaskStatus.Done).length / project.tasks.length) * 100
        : 0;
    
    const deadline = getDeadlineStatus(project.endDate, project.status === ProjectStatus.Completed);

    return (
        <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-lg border border-white/20 shadow-lg flex flex-col justify-between hover:border-white/40 transition-colors duration-300 text-shadow-strong h-full">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{project.name}</h3>
                    <StatusBadge status={project.status} />
                </div>
                <p className="text-sm text-cyan-800 font-medium mb-3 dark:text-cyan-300">{clientName}</p>
                <p className="text-sm text-slate-700 line-clamp-2 mb-4 dark:text-slate-200">{project.description}</p>
                
                <div className="flex justify-between items-center text-sm mb-4">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Deadline</span>
                    <span className={`flex items-center gap-1 font-semibold ${deadline.color}`}>
                        <ClockIcon />
                        {deadline.text}
                    </span>
                </div>

                <div className="mb-2">
                    <div className="flex justify-between text-xs text-slate-600 mb-1 dark:text-slate-300">
                        <span>Progress</span>
                        <span>{Math.round(completionPercentage)}%</span>
                    </div>
                    <div className="w-full bg-slate-200/50 rounded-full h-2 dark:bg-black/20">
                        <div className="bg-gradient-to-r from-cyan-500 to-sky-500 h-2 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                    </div>
                </div>
            </div>
            
            <button
                onClick={() => onSelectProject(project.id)}
                className="mt-4 w-full text-center bg-gradient-to-b from-cyan-500 to-sky-600 text-white px-4 py-2 rounded-md text-sm font-semibold border border-cyan-700/50 hover:from-cyan-600 hover:to-sky-700 transition-all shadow-md btn-hover-scale"
            >
                View Details
            </button>
        </div>
    );
};