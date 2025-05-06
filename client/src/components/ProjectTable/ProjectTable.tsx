import React, { useState } from 'react';
import { ArrowUpDown, Folder, Pencil, Trash2 } from 'lucide-react';
import showToast from '../../utils/toast';
import { api as configApi } from "../../utils/api/config";
import deleteWithBody from '../../utils/api/DeleteAxios';
import ConfirmationModal from '../ConfirmationDeleteModal/CornfirmationModal';
import { ApiError, DeleteResponse, Project, ProjectFormValues } from '../../utils/interface';

interface ProjectTableProps {
  projects: Project[];
  filteredProjects: Project[];
  handleSort: (key: keyof Project) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  setSelectedProject: (project: ProjectFormValues | null) => void;
  setProjectList: (projectlist: Project[]) => void;
  onProjectClick: (projectId: string, projectCode: string) => void;
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
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleEdit = (project: Project, event: React.MouseEvent) => {
    event.stopPropagation();
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
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async (project: Project) => {
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

          // console.log(projects)
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
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
        />
        <button
          className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
          onClick={() => setIsModalOpen(true)}
        >
          + Create Project
        </button>
      </div>

      {filteredProjects.length === 0 ? (
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
                  onClick={() => handleSort('projectCode')}
                >
                  Project Code <ArrowUpDown size={16} className="inline-block ml-1" />
                </th>
                <th 
                  className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer select-none" 
                  onClick={() => handleSort('projectDescription')}
                >
                  Project Description <ArrowUpDown size={16} className="inline-block ml-1" />
                </th>
                <th 
                  className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer select-none" 
                  onClick={() => handleSort('companyName')}
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
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors" 
                  onClick={() => onProjectClick(project.id, project.projectCode)}
                >
                  <td className="p-3">
                    <Folder className="text-gray-600" size={20} />
                  </td>
                  <td className="p-3 text-gray-700">{project.projectCode}</td>
                  <td className="p-3 text-gray-700">{project.projectDescription}</td>
                  <td className="p-3 text-gray-700">{project.companyName}</td>
                  <td className="p-3">
                    <div className="flex space-x-4">
                      <div className="relative group">
                        <button
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          onClick={(e) => handleEdit(project, e)}
                        >
                          <Pencil size={18} />
                        </button>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-gray-700 text-white py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">
                          Edit
                        </span>
                      </div>

                      <div className="relative group">
                        <button
                          className="text-red-500 hover:text-red-700 transition-colors"
                          onClick={(e) => openConfirmationModal(project, e)}
                        >
                          <Trash2 size={18} />
                        </button>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-gray-700 text-white py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">
                          Delete
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