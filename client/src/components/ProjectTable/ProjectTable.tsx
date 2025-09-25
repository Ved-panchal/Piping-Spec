import React, { useState } from 'react';
import { ArrowUpDown, Folder, Pencil, Trash2, Lock } from 'lucide-react';
import showToast from '../../utils/toast';
import { api as configApi } from "../../utils/api/config";
import deleteWithBody from '../../utils/api/DeleteAxios';
import ConfirmationModal from '../ConfirmationDeleteModal/CornfirmationModal';
import { ApiError, DeleteResponse, Project, ProjectFormValues, Subscription } from '../../utils/interface';
import { 
  checkSubscriptionStatus, 
  canPerformAction, 
  getSubscriptionMessage,
  checkUsageLimits,
  getUserAccessLevel,
  getPlanDisplayInfo,
  hasUnlimitedAccess
} from '../../utils/subscriptionUtils';

interface ProjectTableProps {
  projects: Project[];
  filteredProjects: Project[];
  handleSort: (key: keyof Project) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  setSelectedProject: (project: ProjectFormValues | null) => void;
  setProjectList: (projectlist: Project[]) => void;
  onProjectClick: (projectId: string, projectCode: string, companyName: string) => void;
  subscriptions?: Subscription[];
  currentUsage?: { projects: number; specs: number };
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  filteredProjects,
  handleSort,
  searchTerm,
  setSearchTerm,
  setIsModalOpen,
  setSelectedProject,
  setProjectList,
  onProjectClick,
  subscriptions,
  currentUsage = { projects: 0, specs: 0 },
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  console.log(subscriptions)
  const subscriptionStatus = checkSubscriptionStatus(subscriptions);
  const canCreateProject = canPerformAction(subscriptions, 'create_project');
  const canViewProject = canPerformAction(subscriptions, 'open_project');
  const usageLimits = checkUsageLimits(subscriptions, currentUsage);
  const userAccessLevel = getUserAccessLevel(subscriptions);
  const planInfo = getPlanDisplayInfo(subscriptions);
  const isUnlimited = hasUnlimitedAccess(subscriptions);

  const handleEdit = (project: Project, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!canPerformAction(subscriptions, 'create_project')) {
      showToast({ 
        message: getSubscriptionMessage(subscriptions, 'create_project'), 
        type: 'error' 
      });
      return;
    }

    const projectFormValues: ProjectFormValues = {
      code: project.projectCode,
      description: project.projectDescription,
      company: project.companyName,
    };
    setSelectedProject(projectFormValues);
    setIsModalOpen(true);
  };

  const openConfirmationModal = (project: Project, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!canPerformAction(subscriptions, 'create_project')) {
      showToast({ 
        message: getSubscriptionMessage(subscriptions, 'create_project'), 
        type: 'error' 
      });
      return;
    }

    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async (project: Project) => {
    if (!canPerformAction(subscriptions, 'create_project')) {
      showToast({ 
        message: getSubscriptionMessage(subscriptions, 'create_project'), 
        type: 'error' 
      });
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
      return;
    }

    const requestBody = {
      projectCode: project.projectCode,
    };

    try {
      const response = await deleteWithBody<DeleteResponse>(configApi.API_URL.project.delete, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response && response.data) {
        const { success, message, error } = response.data;

        if (success) {
          showToast({ message: message || 'Project deleted successfully!', type: 'success' });

          const updatedProjects = projects.filter(
            (p) => p.projectCode !== project.projectCode
          );
          setProjectList(updatedProjects);
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        } else {
          showToast({ message: error || 'Failed to delete project.', type: 'error' });
        }
      } else {
        showToast({ message: 'Failed to delete project. Please try again.', type: 'error' });
      }
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response && apiError.response.data) {
        const errorMessage = apiError.response.data.error || 'Failed to delete project. Please try again.';
        showToast({ message: errorMessage, type: 'error' });
      } else if (error instanceof Error) {
        if (error.message.includes('401')) {
          showToast({
            message: "Unauthorized Access: token is not provided",
            type: 'error',
          });
        } else {
          showToast({
            message: error.message || 'Failed to process the request. Please try again.',
            type: 'error',
          });
        }
      } else {
        showToast({
          message: 'An unknown error occurred.',
          type: 'error',
        });
      }
    }
  };

  const handleProjectClick = (projectId: string, projectCode: string, companyName: string) => {
    if (!canViewProject) {
      showToast({ 
        message: getSubscriptionMessage(subscriptions, 'open_project'), 
        type: 'error' 
      });
      return;
    }
    
    onProjectClick(projectId, projectCode, companyName);
  };

  const handleCreateProject = () => {
    if (!canCreateProject) {
      showToast({ 
        message: getSubscriptionMessage(subscriptions, 'create_project'), 
        type: 'error' 
      });
      return;
    }

    if (!usageLimits.canCreateProject && usageLimits.projectsRemaining === 0) {
      showToast({ 
        message: 'You have reached your project limit. Please upgrade your subscription to create more projects.', 
        type: 'error' 
      });
      return;
    }

    setIsModalOpen(true);
  };

  // Render subscription alert based on user access level
  const renderSubscriptionAlert = () => {
    if (subscriptionStatus.isExpired) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <Lock className="text-red-500 mr-2" size={20} />
            <div>
              <h3 className="text-red-800 font-medium">Subscription Expired</h3>
              <p className="text-red-600 text-sm mt-1">{subscriptionStatus.message}</p>
            </div>
          </div>
        </div>
      );
    }

    if (subscriptionStatus.isExpiringSoon) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <Lock className="text-yellow-500 mr-2" size={20} />
            <div>
              <h3 className="text-yellow-800 font-medium">Subscription Expiring Soon</h3>
              <p className="text-yellow-600 text-sm mt-1">{subscriptionStatus.message}</p>
            </div>
          </div>
        </div>
      );
    }

    // Only show alert for free trial users
    if (userAccessLevel === 'free_trial') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <Lock className="text-blue-500 mr-2" size={20} />
            <div>
              <h3 className="text-blue-800 font-medium">Free Trial</h3>
              <p className="text-blue-600 text-sm mt-1">
                You're using the free trial with limited features. 
                {usageLimits.projectsRemaining > 0 
                  ? ` You can create ${usageLimits.projectsRemaining} more project${usageLimits.projectsRemaining !== 1 ? 's' : ''}.`
                  : ' Please upgrade to create more projects.'
                }
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Render projects remaining text based on plan
  const renderProjectsRemaining = () => {
    if (subscriptionStatus.isExpired || userAccessLevel === 'expired') return null;
    
    // For yearly plan (unlimited), don't show any remaining count
    if (userAccessLevel === 'yearly' || isUnlimited) {
      return null;
    }
    
    // For free trial, show "Free trial: X projects remaining"
    if (userAccessLevel === 'free_trial') {
      return (
        <span className="text-sm text-gray-600">
          Free trial: {usageLimits.projectsRemaining} projects remaining
        </span>
      );
    }
    
    // For other paid plans (free, weekly, monthly), just show the number
    if (planInfo.showLimits && usageLimits.projectsRemaining !== Infinity) {
      return (
        <span className="text-sm text-gray-600">
          {usageLimits.projectsRemaining} projects remaining
        </span>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {renderSubscriptionAlert()}
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDelete(projectToDelete!)}
        title="Delete Project"
        message={`Are you sure you want to delete the project ${projectToDelete?.projectCode}?`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search projects..."
          className="border border-gray-300 rounded-lg p-2 w-[20rem] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={subscriptionStatus.isExpired}
        />
        <div className="flex items-center space-x-2">
          {renderProjectsRemaining()}
          <button
            className={`font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform ${
              canCreateProject && usageLimits.canCreateProject
                ? 'bg-primary-500 hover:bg-primary-600 text-white hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleCreateProject}
            disabled={!canCreateProject || !usageLimits.canCreateProject}
            title={
              !canCreateProject 
                ? getSubscriptionMessage(subscriptions, 'create_project')
                : !usageLimits.canCreateProject 
                ? 'Project limit reached'
                : 'Create new project'
            }
          >
            {!canCreateProject || !usageLimits.canCreateProject ? (
              <>
                <Lock size={16} className="inline-block mr-1" />
                Create Project
              </>
            ) : (
              '+ Create Project'
            )}
          </button>
        </div>
      </div>

      {subscriptionStatus.isExpired ? (
        <div className="text-center text-gray-400 py-8">
          <Lock size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Subscription Expired</p>
          <p className="text-sm">Please renew your subscription to view and manage projects.</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center text-gray-400 italic py-4">
          No projects are created
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[75vh] border border-gray-200 rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-3 text-left"></th>
                <th 
                  className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer select-none" 
                  onClick={() => canViewProject && handleSort('projectCode')}
                >
                  Project Code <ArrowUpDown size={16} className="inline-block ml-1" />
                </th>
                <th 
                  className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer select-none" 
                  onClick={() => canViewProject && handleSort('projectDescription')}
                >
                  Project Description <ArrowUpDown size={16} className="inline-block ml-1" />
                </th>
                <th 
                  className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer select-none" 
                  onClick={() => canViewProject && handleSort('companyName')}
                >
                  Company Name <ArrowUpDown size={16} className="inline-block ml-1" />
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr 
                  key={project.projectCode} 
                  className={`border-b border-gray-200 transition-colors ${
                    canViewProject
                      ? 'hover:bg-gray-50 cursor-pointer' 
                      : 'bg-gray-50 cursor-not-allowed'
                  }`}
                  onClick={() => handleProjectClick(project.id, project.projectCode, project.companyName)}
                >
                  <td className="p-3">
                    <Folder className={canViewProject ? "text-gray-600" : "text-gray-400"} size={20} />
                  </td>
                  <td className={`p-3 ${canViewProject ? 'text-gray-700' : 'text-gray-400'}`}>
                    {project.projectCode}
                  </td>
                  <td className={`p-3 ${canViewProject ? 'text-gray-700' : 'text-gray-400'}`}>
                    {project.projectDescription}
                  </td>
                  <td className={`p-3 ${canViewProject ? 'text-gray-700' : 'text-gray-400'}`}>
                    {project.companyName}
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-4">
                      <div className="relative group">
                        <button
                          className={`transition-colors ${
                            subscriptionStatus.isActive
                              ? 'text-blue-600 hover:text-blue-800'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          onClick={(e) => handleEdit(project, e)}
                          disabled={!subscriptionStatus.isActive}
                          title={subscriptionStatus.isActive ? 'Edit' : 'Subscription required'}
                        >
                          {subscriptionStatus.isActive ? <Pencil size={18} /> : <Lock size={18} />}
                        </button>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-gray-700 text-white py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">
                          {subscriptionStatus.isActive ? 'Delete' : 'Subscription required'}
                        </span>
                      </div>
                      <div className="relative group">
                        <button
                          className={`transition-colors ${
                            subscriptionStatus.isActive
                              ? 'text-red-500 hover:text-red-700'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          onClick={(e) => openConfirmationModal(project, e)}
                          disabled={!subscriptionStatus.isActive}
                          title={subscriptionStatus.isActive ? 'Delete' : 'Subscription required'}
                        >
                          {subscriptionStatus.isActive ? <Trash2 size={18} /> : <Lock size={18} />}
                        </button>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-gray-700 text-white py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">
                        {subscriptionStatus.isActive ? 'Delete' : 'Subscription required'}
                        </span>
                    </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectTable;