
import React, { useState, useMemo } from 'react';
import type { Project, Client } from '../types';
import { ProjectStatus } from '../types';
import { ProjectTimeline } from './ProjectTimeline';
import { EmptyState } from './ui/EmptyState';
import { ProjectCard } from './enhanced/ProjectCard';
import { FolderIcon } from './icons';

interface ProjectListProps {
  projects: Project[];
  clients: Client[];
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, clients, onSelectProject, onCreateProject }) => {
  const [view, setView] = useState<'card' | 'timeline'>('card');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
        const statusMatch = statusFilter === 'all' || project.status === statusFilter;
        const clientMatch = clientFilter === 'all' || project.clientId === clientFilter;
        return statusMatch && clientMatch;
    });
  }, [projects, statusFilter, clientFilter]);

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  };

  const viewButtonClasses = (isActive: boolean) =>
    `px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none ${
        isActive
            ? 'bg-gradient-to-b from-white/80 to-white/50 dark:from-white/30 dark:to-white/10 text-slate-800 dark:text-white shadow-md'
            : 'text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-white/20'
    }`;

  const selectStyles = "bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/10 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm";

  return (
    <div className="text-shadow-strong">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Projects</h2>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
                className={selectStyles}
                aria-label="Filter by status"
            >
                <option value="all">All Statuses</option>
                {Object.values(ProjectStatus).map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className={selectStyles}
                aria-label="Filter by client"
            >
                <option value="all">All Clients</option>
                {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 bg-black/10 dark:bg-black/20 rounded-lg border border-white/20 dark:border-white/10 self-start sm:self-center">
            <button onClick={() => setView('card')} className={viewButtonClasses(view === 'card')}>
                Card View
            </button>
            <button onClick={() => setView('timeline')} className={viewButtonClasses(view === 'timeline')}>
                Timeline View
            </button>
        </div>
      </div>
      {view === 'card' ? (
        <>
            {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project, index) => (
                        <div key={project.id} className="fade-in h-full" style={{ animationDelay: `${index * 50}ms` }}>
                            <ProjectCard
                                project={project}
                                clientName={getClientName(project.clientId)}
                                onSelectProject={onSelectProject}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="col-span-full">
                    <EmptyState
                        icon={<FolderIcon />}
                        title="No Projects Found"
                        message="Try adjusting the status or client filters, or create a new project to get started."
                        actionText="Create Project"
                        onAction={onCreateProject}
                    />
                </div>
            )}
        </>
      ) : (
          <ProjectTimeline projects={filteredProjects} clients={clients} onSelectProject={onSelectProject} />
      )}
    </div>
  );
};
