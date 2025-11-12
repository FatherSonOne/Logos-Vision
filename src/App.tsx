import React, { useState, useCallback, useEffect } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Placeholder } from '../components/Placeholder';
import { Dashboard } from '../components/Dashboard';
import { ProjectList } from '../components/ProjectList';
import { ProjectDetail } from '../components/ProjectDetail';
import { mockClients, mockTeamMembers, mockProjects, mockActivities, mockChatRooms, mockChatMessages, mockDonations, mockVolunteers, mockCases, mockDocuments, mockWebpages, mockEvents, mockEmailCampaigns } from '../data/mockData';
import { portalDbService } from '../services/portalDbService';
import { performAdvancedSearch } from '../services/geminiService';
import type { Client, TeamMember, Project, EnrichedTask, Activity, ChatRoom, ChatMessage, Donation, Volunteer, Case, Document, Webpage, CaseComment, Event, PortalLayout, EmailCampaign, WebSearchResult, SearchResults } from './types';
import type { Page, RecentItem } from '../types';
import { ClientList } from '../components/ClientList';
import { OrganizationDetail } from '../components/OrganizationDetail';
import { TeamMemberList } from '../components/ConsultantList';
import { ActivityFeed } from '../components/ActivityFeed';
import { ActivityDialog } from '../components/ActivityDialog';
import { TeamChat } from '../components/TeamChat';
import { CreateRoomDialog } from '../components/CreateRoomDialog';
import { VideoConference } from '../components/VideoConference';
import { AddTeamMemberDialog } from '../components/AddTeamMemberDialog';
import { ContactList } from '../components/ContactList';
import { AddContactDialog } from '../components/AddContactDialog';
import { Donations } from '../components/Donations';
import { CalendarView } from '../components/CalendarView';
import { TaskView } from '../components/TaskView';
import { FormGenerator } from '../components/FormGenerator';
import { VolunteerList } from '../components/VolunteerList';
import { AddVolunteerDialog } from '../components/AddVolunteerDialog';
import { CharityTracker } from '../components/CharityTracker';
import { CaseManagement } from '../components/CaseManagement';
import { DocumentLibrary } from '../components/DocumentLibrary';
import { WebManagement } from '../components/WebManagement';
import { GoldPages } from '../components/GoldPages';
import { WebpageStatus, DocumentCategory, ActivityType, ActivityStatus } from './types';
import { AiChatBot } from '../components/AiChatBot';
import { AiTools } from '../components/AiTools';
import { LiveChat } from '../components/LiveChat';
import { CaseDialog } from '../components/CaseDialog';
import { CaseStatus } from './types';
import { SearchResultsPage } from '../components/SearchResultsPage';
import { CaseDetail } from '../components/CaseDetail';
import { EventEditor } from '../components/EventEditor';
import { Reports } from '../components/Reports';
import { PortalBuilder } from '../components/PortalBuilder';
import { ClientPortalLogin } from '../components/ClientPortalLogin';
import { ClientPortal } from '../components/ClientPortal';
import { EmailCampaigns } from '../components/EmailCampaigns';
import { GrantAssistant } from '../components/GrantAssistant';
import { GuidedTour } from '../components/GuidedTour';
import type { TourStep } from '../components/GuidedTour';
import { ToastProvider, useToast } from './components/ui/Toast';

const AppContent: React.FC = () => {
  const { showToast } = useToast();

  const [clients, setClients] = useState<Client[]>(mockClients);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [activities, setActivities] = useState<Activity[]>(mockActivities.sort((a,b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()));
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(mockChatRooms);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [donations, setDonations] = useState<Donation[]>(mockDonations);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers);
  const [cases, setCases] = useState<Case[]>(mockCases);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [webpages, setWebpages] = useState<Webpage[]>(mockWebpages);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>(mockEmailCampaigns);
  const [portalLayouts, setPortalLayouts] = useState<PortalLayout[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentItem[]>([]);
  
  const [currentUserId, setCurrentUserId] = useState<string>('c1'); // Alice Johnson is logged in user

  const [openTabs, setOpenTabs] = useState<Page[]>(['dashboard']);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [portalClientId, setPortalClientId] = useState<string | null>(null);

  // State for global search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  // State for Dialogs (centralized)
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isCreateRoomDialogOpen, setIsCreateRoomDialogOpen] = useState(false);
  const [isAddTeamMemberDialogOpen, setIsAddTeamMemberDialogOpen] = useState(false);
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [isAddVolunteerDialogOpen, setIsAddVolunteerDialogOpen] = useState(false);
  const [isCaseDialogOpen, setIsCaseDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);

  // State for Gold Pages editor
  const [isGoldPagesEditorOpen, setIsGoldPagesEditorOpen] = useState(false);
  const [editingWebpage, setEditingWebpage] = useState<Webpage | null>(null);
  
  // State for Notifications
  const [notifications, setNotifications] = useState<Set<Page>>(new Set());
  
  // State for Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
        return localStorage.getItem('theme') as 'light' | 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });

  // Guided Tour State
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
      const layouts = portalDbService.getLayouts();
      setPortalLayouts(layouts);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (theme === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
    } else {
        root.classList.remove('dark');
        body.classList.add('light-mode');
        body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Check for new data on initial load to set notifications
  useEffect(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const newNotifications = new Set<Page>();

    if (mockCases.some(c => new Date(c.createdAt).getTime() > oneDayAgo)) {
        newNotifications.add('case');
    }
    if (mockActivities.some(a => new Date(a.activityDate).getTime() > oneDayAgo)) {
        newNotifications.add('activities');
    }
    if (mockDonations.some(d => new Date(d.donationDate).getTime() > oneDayAgo)) {
        newNotifications.add('donations');
    }
    
    setNotifications(newNotifications);
  }, []);

  const trackRecentlyViewed = useCallback((item: RecentItem) => {
      setRecentlyViewed(prev => {
          const filtered = prev.filter(i => i.id !== item.id);
          return [item, ...filtered].slice(0, 5);
      });
  }, []);

  const switchActivePage = useCallback((page: Page, id?: string) => {
    if (id) {
        if (page === 'projects') setSelectedProjectId(id);
        else if (page === 'case') setSelectedCaseId(id);
        else if (page === 'organizations') setSelectedOrganizationId(id);
    } else {
        setSelectedProjectId(null);
        setSelectedCaseId(null);
        setSelectedOrganizationId(null);
    }
    setCurrentPage(page);
    setPortalClientId(null);
    setNotifications(prev => {
        const newNotifications = new Set(prev);
        newNotifications.delete(page);
        return newNotifications;
    });
  }, []);

  const navigateToPage = useCallback((page: Page, id?: string) => {
    if (!openTabs.includes(page)) {
      setOpenTabs(prev => [...prev, page]);
    }
    switchActivePage(page, id);
  }, [openTabs, switchActivePage]);
  
  const handleCloseTab = useCallback((pageToClose: Page, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const tabIndex = openTabs.indexOf(pageToClose);
    if (tabIndex === -1 || openTabs.length <= 1) return;

    const newTabs = openTabs.filter(p => p !== pageToClose);
    setOpenTabs(newTabs);

    if (currentPage === pageToClose) {
        const newIndex = tabIndex > 0 ? tabIndex - 1 : 0;
        switchActivePage(newTabs[newIndex]);
    }
  }, [openTabs, currentPage, switchActivePage]);


  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleSelectProject = useCallback((id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
        trackRecentlyViewed({ id, type: 'project', label: project.name, link: 'projects' });
    }
    setSelectedProjectId(id);
    navigateToPage('projects', id);
  }, [navigateToPage, projects, trackRecentlyViewed]);
  
  const handleBackToList = useCallback(() => {
    setSelectedProjectId(null);
    navigateToPage('projects');
  }, [navigateToPage]);

  const handleSelectCase = useCallback((id: string) => {
    const caseItem = cases.find(c => c.id === id);
    if (caseItem) {
        trackRecentlyViewed({ id, type: 'case', label: caseItem.title, link: 'case' });
    }
    setSelectedCaseId(id);
    navigateToPage('case', id);
  }, [navigateToPage, cases, trackRecentlyViewed]);

  const handleBackFromCase = useCallback(() => {
    setSelectedCaseId(null);
  }, []);
  
  const handleSelectOrganization = useCallback((id: string) => {
    const client = clients.find(c => c.id === id);
    if (client) {
        trackRecentlyViewed({ id, type: 'organization', label: client.name, link: 'organizations' });
    }
    setSelectedOrganizationId(id);
    navigateToPage('organizations', id);
  }, [navigateToPage, clients, trackRecentlyViewed]);

  const handleBackFromOrganizations = useCallback(() => {
    setSelectedOrganizationId(null);
  }, []);


  const handleSaveActivity = (activity: Omit<Activity, 'createdById'> & { id?: string }) => {
    if (activity.id) {
      setActivities(prev => prev.map(act => 
        act.id === activity.id 
          ? { ...act, ...activity } 
          : act
      ).sort((a,b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()));
      showToast('Activity updated!', 'success');
    } else {
      const newActivity: Activity = {
        ...(activity as Omit<Activity, 'id' | 'createdById'>),
        id: `act-${Date.now()}`,
        createdById: currentUserId, 
      };
      setActivities(prev => [newActivity, ...prev].sort((a,b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()));
      showToast('Activity logged!', 'success');
    }
    setIsActivityDialogOpen(false);
    setEditingActivity(null);
  };
  
  const handleScheduleActivity = (activityData: Partial<Activity>) => {
    const newActivity: Activity = {
      id: '',
      type: ActivityType.Call,
      title: '',
      status: ActivityStatus.Scheduled,
      activityDate: new Date().toISOString().split('T')[0],
      createdById: currentUserId,
      ...activityData
    };
    setEditingActivity(newActivity);
    setIsActivityDialogOpen(true);
  };


  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setIsActivityDialogOpen(true);
  };

  const handleDeleteActivity = (activityId: string) => {
    setActivities(prev => prev.filter(a => a.id !== activityId));
    showToast('Activity deleted!', 'success');
  };

  const handleSendMessage = (roomId: string, text: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      text,
      senderId: currentUserId,
      timestamp: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleCreateRoom = (roomName: string) => {
    const newRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      name: roomName.startsWith('#') ? roomName : `#${roomName}`,
    };
    setChatRooms(prev => [...prev, newRoom]);
    setIsCreateRoomDialogOpen(false);
    showToast(`Channel ${newRoom.name} created!`, 'success');
  };
  
  const handleAddTeamMember = (newMember: Omit<TeamMember, 'id'>) => {
    const memberWithId: TeamMember = {
        ...newMember,
        id: `c-${Date.now()}`,
    };
    setTeamMembers(prev => [...prev, memberWithId]);
    setIsAddTeamMemberDialogOpen(false);
    showToast('Team member added!', 'success');
  };

  const handleAddContact = (newContact: Omit<Client, 'id' | 'createdAt'>) => {
    const contactWithId: Client = {
        ...newContact,
        id: `cl-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    setClients(prev => [...prev, contactWithId]);
    setIsAddContactDialogOpen(false);
    showToast('Contact added!', 'success');
  };

  const handleAddVolunteer = (newVolunteer: Omit<Volunteer, 'id'>) => {
    const volunteerWithId: Volunteer = {
        ...newVolunteer,
        id: `v-${Date.now()}`,
    };
    setVolunteers(prev => [...prev, volunteerWithId]);
    setIsAddVolunteerDialogOpen(false);
    showToast('Volunteer added!', 'success');
  }

  // --- Case Management Handlers ---
  const handleAddCase = () => {
    setEditingCase(null);
    setIsCaseDialogOpen(true);
  };

  const handleEditCase = (caseItem: Case) => {
    setEditingCase(caseItem);
    setIsCaseDialogOpen(true);
  };

  const handleDeleteCase = (caseId: string) => {
    setCases(prev => prev.filter(c => c.id !== caseId));
    showToast('Case deleted!', 'success');
  };

  const handleSaveCase = (caseToSave: Omit<Case, 'createdAt' | 'lastUpdatedAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    if (caseToSave.id) {
      setCases(prev => prev.map(c =>
        c.id === caseToSave.id
          ? { ...c, ...caseToSave, lastUpdatedAt: now }
          : c
      ));
      showToast('Case updated!', 'success');
    } else {
      const newCase: Case = {
        ...(caseToSave as Omit<Case, 'id' | 'createdAt' | 'lastUpdatedAt'>),
        id: `case-${Date.now()}`,
        createdAt: now,
        lastUpdatedAt: now,
        comments: [],
      };
      setCases(prev => [newCase, ...prev]);
      showToast('Case created!', 'success');
    }
    setIsCaseDialogOpen(false);
    setEditingCase(null);
  };

  const handleUpdateCaseStatus = (caseId: string, newStatus: CaseStatus) => {
    setCases(prevCases => prevCases.map(c => 
        c.id === caseId ? { ...c, status: newStatus, lastUpdatedAt: new Date().toISOString() } : c
    ));
    showToast('Case status updated!', 'info');
  };

  const handleAddCaseComment = (caseId: string, text: string) => {
    const newComment: CaseComment = {
        id: `com-${Date.now()}`,
        authorId: currentUserId,
        text,
        timestamp: new Date().toISOString(),
    };
    setCases(prevCases => prevCases.map(c => {
        if (c.id === caseId) {
            return {
                ...c,
                comments: [...(c.comments || []), newComment],
            };
        }
        return c;
    }));
  };

  const handleUpdateTaskNote = (projectId: string, taskId: string, notes: string) => {
    setProjects(prevProjects => 
        prevProjects.map(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    tasks: p.tasks.map(t => {
                        if (t.id === taskId) {
                            return { ...t, notes };
                        }
                        return t;
                    })
                };
            }
            return p;
        })
    );
    showToast('Task note saved!', 'success');
  };

  // --- Placeholder Action Handlers for Empty States ---
  const handleCreateProject = () => {
    showToast('"Create Project" functionality is not yet implemented.', 'info');
  };

  const handleUploadDocument = () => {
    showToast('"Upload Document" functionality is not yet implemented.', 'info');
  };


  // --- Gold Pages Handlers ---
  const handleCreateNewPage = () => {
    const newPage: Webpage = {
      id: `wp-${Date.now()}`,
      relatedId: '', // Will be set in editor
      title: 'Untitled Page',
      status: WebpageStatus.Draft,
      lastUpdated: new Date().toISOString(),
      visits: 0,
      engagementScore: 0,
      content: [],
    };
    setEditingWebpage(newPage);
    setIsGoldPagesEditorOpen(true);
  };

  const handleEditPage = (pageId: string) => {
    const pageToEdit = webpages.find(p => p.id === pageId);
    if (pageToEdit) {
      setEditingWebpage(pageToEdit);
      setIsGoldPagesEditorOpen(true);
    }
  };

  const handleCloseEditor = () => {
    setEditingWebpage(null);
    setIsGoldPagesEditorOpen(false);
  };

  const handleSaveWebpage = (pageToSave: Webpage) => {
    setWebpages(prev => {
      const exists = prev.some(p => p.id === pageToSave.id);
      if (exists) {
        return prev.map(p => p.id === pageToSave.id ? { ...pageToSave, lastUpdated: new Date().toISOString() } : p);
      }
      return [...prev, { ...pageToSave, lastUpdated: new Date().toISOString() }];
    });
    handleCloseEditor();
    showToast('Webpage saved successfully!', 'success');
  };
  // --- End Gold Pages Handlers ---

  const handleSaveEvent = (eventToSave: Event) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === eventToSave.id);
      if (exists) {
        return prev.map(e => e.id === eventToSave.id ? eventToSave : e);
      }
      return [...prev, eventToSave].sort((a,b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    });
  };
  
  const handleSavePortalLayout = (layout: PortalLayout) => {
    let newLayouts;
    const exists = portalLayouts.some(l => l.clientId === layout.clientId);
    if (exists) {
        newLayouts = portalLayouts.map(l => l.clientId === layout.clientId ? layout : l);
    } else {
        newLayouts = [...portalLayouts, layout];
    }
    setPortalLayouts(newLayouts);
    portalDbService.saveLayouts(newLayouts);
    showToast('Portal layout saved!', 'success');
  };

  const handlePortalLogin = (clientId: string) => {
    setPortalClientId(clientId);
  };

  const handlePortalLogout = () => {
    setPortalClientId(null);
  };
  
  const handleSaveEmailCampaign = (campaign: Omit<EmailCampaign, 'id' | 'sentDate' | 'stats' | 'status'> & { scheduleDate?: string }) => {
    const isScheduled = !!campaign.scheduleDate;
    const newCampaign: EmailCampaign = {
        ...campaign,
        id: `ec-${Date.now()}`,
        status: isScheduled ? 'Scheduled' : 'Sent',
        sentDate: isScheduled ? undefined : new Date().toISOString(),
        stats: { sent: clients.length, opened: 0, clicked: 0, unsubscribes: 0 },
    };
    setEmailCampaigns(prev => [newCampaign, ...prev].sort((a, b) => {
        const dateA = a.scheduleDate || a.sentDate || 0;
        const dateB = b.scheduleDate || b.sentDate || 0;
        return new Date(dateB as string).getTime() - new Date(dateA as string).getTime();
    }));
    showToast(`Campaign '${newCampaign.name}' ${isScheduled ? 'scheduled' : 'sent'}!`, 'success');
  };

  const handleSearch = useCallback(async (query: string, includeWebSearch: boolean) => {
    setSearchQuery(query);
    setIsSearching(true);
    navigateToPage('search-results');
    setSearchResults(null);

    try {
        const allTasks: EnrichedTask[] = projects.flatMap(p => 
            p.tasks.map(t => ({...t, projectName: p.name, projectId: p.id}))
        );

        const allDataForAI = { clients, projects, tasks: allTasks, cases, teamMembers, activities, volunteers, documents };
        
        const { internalResults, webResults } = await performAdvancedSearch(query, allDataForAI, includeWebSearch);
        
        const finalResults: SearchResults = {
            projects: projects.filter(p => internalResults.projectIds?.includes(p.id)),
            clients: clients.filter(c => internalResults.clientIds?.includes(c.id)),
            tasks: allTasks.filter(t => internalResults.taskIds?.includes(t.id)),
            teamMembers: teamMembers.filter(tm => internalResults.teamMemberIds?.includes(tm.id)),
            activities: activities.filter(a => internalResults.activityIds?.includes(a.id)),
            volunteers: volunteers.filter(v => internalResults.volunteerIds?.includes(v.id)),
            cases: cases.filter(c => internalResults.caseIds?.includes(c.id)),
            documents: documents.filter(d => internalResults.documentIds?.includes(d.id)),
            webResults: webResults,
        };
        setSearchResults(finalResults);

    } catch (error) {
        console.error("Advanced search failed:", error);
        setSearchResults({ projects: [], clients: [], tasks: [], teamMembers: [], activities: [], volunteers: [], cases: [], documents: [], webResults: [] });
    } finally {
        setIsSearching(false);
    }
  }, [clients, projects, cases, teamMembers, activities, volunteers, documents, navigateToPage]);

  const tourSteps: TourStep[] = [
      { selector: '#main-sidebar', title: 'Main Navigation', content: 'This is your main navigation bar. Access all major sections of the CRM from here.', position: 'right', },
      { selector: '#global-search-form', title: 'Global Search', content: 'Search across your entire CRM or even find new leads on the web using our powerful AI-driven search.', position: 'bottom', },
      { selector: '#theme-toggle-button', title: 'Toggle Theme', content: 'Switch between light and dark modes to suit your preference.', position: 'left', },
      { selector: '#daily-briefing', title: 'Daily Briefing', content: 'Start your day with an AI-powered summary of your most important tasks, activities, and cases.', position: 'bottom', },
      { selector: '#tour-start-button', title: 'Help & Tour', content: 'You can restart this tour anytime by clicking this button.', position: 'left' }
  ];

  
  const renderContent = () => {
    if (currentPage === 'projects' && selectedProjectId) {
        const project = projects.find(p => p.id === selectedProjectId);
        if (project) {
            const client = clients.find(c => c.id === project.clientId);
            const projectTeamMembers = teamMembers.filter(c => project.teamMemberIds.includes(c.id));
            const projectCases = cases.filter(c => c.clientId === project.clientId);
            return <ProjectDetail 
              project={project} 
              client={client} 
              projectTeamMembers={projectTeamMembers} 
              allTeamMembers={teamMembers} 
              cases={projectCases}
              onBack={handleBackToList}
              onUpdateTaskNote={handleUpdateTaskNote}
            />
        }
    }
    
    if (currentPage === 'case' && selectedCaseId) {
        const caseItem = cases.find(c => c.id === selectedCaseId);
        if (caseItem) {
            const client = clients.find(c => c.id === caseItem.clientId);
            const assignee = teamMembers.find(tm => tm.id === caseItem.assignedToId);
            return <CaseDetail
                caseItem={caseItem}
                client={client}
                assignee={assignee}
                activities={activities.filter(a => a.caseId === selectedCaseId)}
                teamMembers={teamMembers}
                onBack={handleBackFromCase}
                onAddComment={handleAddCaseComment}
                currentUserId={currentUserId}
            />
        }
    }
    
    if (currentPage === 'organizations' && selectedOrganizationId) {
        const organization = clients.find(c => c.id === selectedOrganizationId);
        if(organization) {
            return <OrganizationDetail
                client={organization}
                projects={projects.filter(p => p.clientId === selectedOrganizationId)}
                activities={activities.filter(a => a.clientId === selectedOrganizationId)}
                cases={cases.filter(c => c.clientId === selectedOrganizationId)}
                donations={donations.filter(d => d.clientId === selectedOrganizationId)}
                documents={documents.filter(d => d.relatedId === selectedOrganizationId && d.category === DocumentCategory.Client)}
                teamMembers={teamMembers}
                events={events.filter(e => e.clientId === selectedOrganizationId)}
                onBack={handleBackFromOrganizations}
                onSelectProject={handleSelectProject}
                onScheduleActivity={handleScheduleActivity}
             />
        }
    }


    switch (currentPage) {
      case 'dashboard':
        return <Dashboard 
                  projects={projects} 
                  clients={clients} 
                  cases={cases}
                  activities={activities}
                  teamMembers={teamMembers}
                  currentUserId={currentUserId}
                  onSelectProject={handleSelectProject}
                  recentlyViewed={recentlyViewed}
                  onNavigate={navigateToPage}
               />;
      case 'projects':
        return <ProjectList projects={projects} clients={clients} onSelectProject={handleSelectProject} onCreateProject={handleCreateProject} />;
      case 'activities':
        return <ActivityFeed 
          activities={activities} 
          projects={projects} 
          clients={clients} 
          teamMembers={teamMembers}
          onLogActivity={() => { setEditingActivity(null); setIsActivityDialogOpen(true); }}
          onEdit={handleEditActivity}
          onDelete={handleDeleteActivity}
        />;
      case 'organizations':
        return <ClientList clients={clients} onAddOrganization={() => setIsAddContactDialogOpen(true)} onSelectOrganization={handleSelectOrganization} />;
      case 'team':
        return <TeamMemberList teamMembers={teamMembers} onAddTeamMember={() => setIsAddTeamMemberDialogOpen(true)} />;
      case 'chat':
        return <TeamChat 
                  rooms={chatRooms}
                  messages={chatMessages}
                  teamMembers={teamMembers}
                  currentUserId={currentUserId}
                  onSendMessage={handleSendMessage}
                  onCreateRoom={() => setIsCreateRoomDialogOpen(true)}
                />;
      case 'contacts': 
        return <ContactList clients={clients} onAddContact={() => setIsAddContactDialogOpen(true)} />;
      case 'donations':
        return <Donations donations={donations} clients={clients} />;
      case 'calendar': 
        return <CalendarView teamMembers={teamMembers} projects={projects} activities={activities} />;
      case 'tasks': 
        return <TaskView projects={projects} teamMembers={teamMembers} onSelectTask={handleSelectProject} />;
      case 'form-generator':
        return <FormGenerator clients={clients} />;
      case 'grant-assistant':
        return <GrantAssistant projects={projects} donations={donations} clients={clients} />;
      case 'portal-builder':
        return <PortalBuilder
                    clients={clients}
                    projects={projects}
                    teamMembers={teamMembers}
                    activities={activities}
                    donations={donations}
                    documents={documents}
                    events={events}
                    portalLayouts={portalLayouts}
                    onSaveLayout={handleSavePortalLayout}
                />;
      case 'client-portal':
        if (portalClientId) {
            const client = clients.find(c => c.id === portalClientId);
            if (!client) {
                setPortalClientId(null); // Should not happen, but good practice
                return <ClientPortalLogin clients={clients} onSelectClient={handlePortalLogin} />;
            }
            const layout = portalLayouts.find(l => l.clientId === portalClientId);
            const clientProjects = projects.filter(p => p.clientId === client.id);
            const clientProjectIds = clientProjects.map(p => p.id);
            const clientTeamMemberIds = new Set(clientProjects.flatMap(p => p.teamMemberIds));
            const clientVolunteers = volunteers.filter(v => 
                v.assignedClientIds.includes(client.id) || 
                v.assignedProjectIds.some(pId => clientProjectIds.includes(pId))
            );
            
            return <ClientPortal 
                        client={client} 
                        layout={layout}
                        projects={clientProjects}
                        tasks={projects.flatMap(p => p.tasks.filter(t => clientProjectIds.includes(p.id) && t.sharedWithClient))}
                        activities={activities.filter(a => a.clientId === client.id && a.sharedWithClient)}
                        donations={donations.filter(d => d.clientId === client.id)}
                        documents={documents.filter(d => d.relatedId === client.id && d.category === DocumentCategory.Client)}
                        events={events.filter(e => e.clientId === client.id)}
                        team={teamMembers.filter(tm => clientTeamMemberIds.has(tm.id))}
                        volunteers={clientVolunteers}
                        onLogout={handlePortalLogout} 
                    />;
        }
        return <ClientPortalLogin clients={clients} onSelectClient={handlePortalLogin} />;
      case 'volunteers': 
        return <VolunteerList 
                  volunteers={volunteers} 
                  clients={clients} 
                  projects={projects} 
                  onAddVolunteer={() => setIsAddVolunteerDialogOpen(true)} 
                />;
      case 'charity': 
        return <CharityTracker clients={clients} donations={donations} />;
      case 'case': 
        return <CaseManagement 
                  cases={cases} 
                  clients={clients} 
                  teamMembers={teamMembers}
                  onAddCase={handleAddCase}
                  onEditCase={handleEditCase}
                  onDeleteCase={handleDeleteCase}
                  onSelectCase={handleSelectCase}
                  onUpdateCaseStatus={handleUpdateCaseStatus}
                />;
      case 'documents': 
        return <DocumentLibrary 
                  documents={documents}
                  clients={clients}
                  projects={projects}
                  teamMembers={teamMembers}
                  onUploadDocument={handleUploadDocument}
                />;
      case 'web-management':
        return <WebManagement 
                  webpages={webpages} 
                  clients={clients}
                  onCreatePage={handleCreateNewPage}
                  onEditPage={handleEditPage} 
                />;
      case 'ai-tools':
        return <AiTools />;
      case 'live-chat':
        return <LiveChat />;
      case 'search-results':
        return <SearchResultsPage
            query={searchQuery}
            isLoading={isSearching}
            results={searchResults}
            onNavigateToProject={handleSelectProject}
            onNavigateToPage={navigateToPage}
        />;
      
      case 'video': return <VideoConference />;
      case 'email': return <EmailCampaigns campaigns={emailCampaigns} clients={clients} onSaveCampaign={handleSaveEmailCampaign} />;
      case 'events': return <EventEditor events={events} clients={clients} volunteers={volunteers} onSave={handleSaveEvent} />;
      case 'reports':
          return <Reports
            projects={projects}
            clients={clients}
            donations={donations}
            activities={activities}
            cases={cases}
            teamMembers={teamMembers}
            documents={documents}
          />;
      default:
        return <Dashboard 
                  projects={projects} 
                  clients={clients} 
                  cases={cases}
                  activities={activities}
                  teamMembers={teamMembers}
                  currentUserId={currentUserId}
                  onSelectProject={handleSelectProject}
                  recentlyViewed={recentlyViewed}
                  onNavigate={navigateToPage}
                />;
    }
  };

  return (
    <div className="flex h-screen text-slate-800 dark:text-slate-200">
      <Sidebar currentPage={currentPage} onNavigate={navigateToPage} notifications={notifications} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header 
          onSearch={handleSearch}
          isSearching={isSearching}
          theme={theme}
          onToggleTheme={toggleTheme}
          onStartTour={() => setIsTourOpen(true)}
          openTabs={openTabs}
          currentPage={currentPage}
          onNavigate={(page) => switchActivePage(page)}
          onCloseTab={handleCloseTab}
        />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
            <div key={currentPage} className="page-content-wrapper">
                {renderContent()}
            </div>
        </main>
        
        <AiChatBot />
      </div>
      <ActivityDialog 
        isOpen={isActivityDialogOpen}
        onClose={() => { setIsActivityDialogOpen(false); setEditingActivity(null); }}
        onSave={handleSaveActivity}
        clients={clients}
        projects={projects}
        activityToEdit={editingActivity}
      />
      <CaseDialog
        isOpen={isCaseDialogOpen}
        onClose={() => { setIsCaseDialogOpen(false); setEditingCase(null); }}
        onSave={handleSaveCase}
        clients={clients}
        teamMembers={teamMembers}
        caseToEdit={editingCase}
      />
      <CreateRoomDialog
        isOpen={isCreateRoomDialogOpen}
        onClose={() => setIsCreateRoomDialogOpen(false)}
        onSave={handleCreateRoom}
      />
      <AddTeamMemberDialog
        isOpen={isAddTeamMemberDialogOpen}
        onClose={() => setIsAddTeamMemberDialogOpen(false)}
        onSave={handleAddTeamMember}
      />
      <AddContactDialog
        isOpen={isAddContactDialogOpen}
        onClose={() => setIsAddContactDialogOpen(false)}
        onSave={handleAddContact}
      />
      <AddVolunteerDialog
        isOpen={isAddVolunteerDialogOpen}
        onClose={() => setIsAddVolunteerDialogOpen(false)}
        onSave={handleAddVolunteer}
        clients={clients}
        projects={projects}
      />
      {isGoldPagesEditorOpen && editingWebpage && (
        <div className="absolute inset-0 z-50 bg-white/30 dark:bg-slate-900/50 backdrop-blur-xl">
          <GoldPages
            webpage={editingWebpage}
            onClose={handleCloseEditor}
            onSave={handleSaveWebpage}
            clients={clients}
          />
        </div>
      )}
       <GuidedTour 
            steps={tourSteps}
            isOpen={isTourOpen}
            onClose={() => setIsTourOpen(false)}
        />
    </div>
  );
};

const App: React.FC = () => (
    <ToastProvider>
        <AppContent />
    </ToastProvider>
);


export default App;