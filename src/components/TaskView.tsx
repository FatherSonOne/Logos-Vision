import React, { useState, useMemo } from 'react';
import type { Project, TeamMember, EnrichedTask } from '../types';
import { TaskStatus } from '../types';
import { getDeadlineStatus } from '../utils/dateHelpers';
import { EmptyState } from './ui/EmptyState';
import { CheckSquareIcon, TrashIcon, ClipboardListIcon } from './icons';
import { SelectableRow } from './editing/SelectableRow';
import { BulkActionsToolbar, type BulkAction } from './editing/BulkActionsToolbar';

interface TaskViewProps {
  projects: Project[];
  teamMembers: TeamMember[];
  onSelectTask: (projectId: string) => void;
  onBulkDelete: (taskIds: string[]) => void;
  onBulkUpdateStatus: (taskIds: string[], status: TaskStatus) => void;
}

const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const colorClasses = {
    [TaskStatus.ToDo]: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    [TaskStatus.InProgress]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [TaskStatus.Done]: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses[status]}`}>
      {status}
    </span>
  );
};

const ChevronIcon: React.FC<{ isExpanded: boolean; hasNotes: boolean }> = ({ isExpanded, hasNotes }) => {
    if (!hasNotes) return <div className="w-4 h-4 flex-shrink-0" />;
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    );
};


export const TaskView: React.FC<TaskViewProps> = ({ projects, teamMembers, onSelectTask, onBulkDelete, onBulkUpdateStatus }) => {
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
    const [assigneeFilter, setAssigneeFilter] = useState<string | 'all'>('all');
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const enrichedTasks: EnrichedTask[] = useMemo(() => {
        return projects.flatMap(project => 
            project.tasks.map(task => ({
                ...task,
                projectName: project.name,
                projectId: project.id,
            }))
        ).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [projects]);

    const filteredTasks = useMemo(() => {
        return enrichedTasks.filter(task => {
            const statusMatch = statusFilter === 'all' || task.status === statusFilter;
            const assigneeMatch = assigneeFilter === 'all' || task.teamMemberId === assigneeFilter;
            return statusMatch && assigneeMatch;
        });
    }, [enrichedTasks, statusFilter, assigneeFilter]);

    const getAssigneeName = (id: string) => teamMembers.find(tm => tm.id === id)?.name || 'Unassigned';

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredTasks.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredTasks.map(t => t.id));
        }
    };
    
    const bulkActions: BulkAction[] = [
        {
            id: 'status-todo',
            label: 'To Do',
            icon: <ClipboardListIcon className="w-4 h-4" />,
            onClick: (ids) => { onBulkUpdateStatus(ids, TaskStatus.ToDo); setSelectedIds([]); },
        },
        {
            id: 'status-done',
            label: 'Done',
            icon: <CheckSquareIcon className="w-4 h-4" />,
            onClick: (ids) => { onBulkUpdateStatus(ids, TaskStatus.Done); setSelectedIds([]); },
        },
        {
            id: 'delete',
            label: 'Delete',
            icon: <TrashIcon className="w-4 h-4" />,
            onClick: (ids) => { onBulkDelete(ids); setSelectedIds([]); },
            variant: 'danger',
        },
    ];

    const selectStyles = "bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/10 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-teal-500 focus:border-teal-500 shadow-sm";


    return (
        <div className="text-shadow-strong">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">All Tasks</h2>
                <div className="flex items-center gap-4">
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                        className={selectStyles}
                        aria-label="Filter by status"
                    >
                        <option value="all">All Statuses</option>
                        {Object.values(TaskStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                     <select
                        id="assignee-filter"
                        value={assigneeFilter}
                        onChange={(e) => setAssigneeFilter(e.target.value)}
                        className={selectStyles}
                        aria-label="Filter by assignee"
                    >
                        <option value="all">All Assignees</option>
                        {teamMembers.map(tm => (
                            <option key={tm.id} value={tm.id}>{tm.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl rounded-lg border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/20 dark:divide-white/10">
                        <thead className="bg-white/20 dark:bg-black/10">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredTasks.length && filteredTasks.length > 0}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                        aria-label="Select all tasks"
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-2/5">Task</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Project</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Assignee</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Due Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/20 dark:divide-white/10">
                            {filteredTasks.map(task => {
                                const deadline = getDeadlineStatus(task.dueDate, task.status === TaskStatus.Done);
                                const isExpanded = expandedTaskId === task.id;
                                return (
                                    <React.Fragment key={task.id}>
                                        <SelectableRow
                                            id={task.id}
                                            isSelected={selectedIds.includes(task.id)}
                                            onToggle={toggleSelection}
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-100" onClick={(e) => { if(task.notes) { e.stopPropagation(); setExpandedTaskId(isExpanded ? null : task.id) } }}>
                                                <div className="flex items-center gap-2">
                                                    <ChevronIcon isExpanded={isExpanded} hasNotes={!!task.notes} />
                                                    <span>{task.description}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                                <button onClick={(e) => { e.stopPropagation(); onSelectTask(task.projectId); }} className="hover:text-teal-600 hover:underline dark:hover:text-teal-400">
                                                    {task.projectName}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{getAssigneeName(task.teamMemberId)}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${deadline.color}`}>
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={task.status} /></td>
                                        </SelectableRow>
                                        {isExpanded && task.notes && (
                                            <tr className="bg-white/20 dark:bg-black/10">
                                                <td colSpan={6} className="px-6 py-4">
                                                    <div className="pl-12">
                                                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Notes</h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{task.notes}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </tbody>
                    </table>
                    {filteredTasks.length === 0 && (
                        <EmptyState 
                            icon={<CheckSquareIcon />}
                            title="No Tasks Found"
                            message="Try adjusting your filters or create a new task inside a project."
                        />
                    )}
                </div>
            </div>
             <BulkActionsToolbar
                selectedCount={selectedIds.length}
                totalCount={filteredTasks.length}
                onSelectAll={handleSelectAll}
                onClearSelection={() => setSelectedIds([])}
                selectedIds={selectedIds}
                actions={bulkActions}
            />
        </div>
    );
};
