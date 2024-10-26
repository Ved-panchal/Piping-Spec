import React, { useState } from 'react';
import { ArrowUpDown, Folder, Pencil, Trash2 } from 'lucide-react';
import showToast from '../../utils/toast';
import { api as configApi } from "../../utils/api/config";
import deleteWithBody from '../../utils/api/DeleteAxios';
import ConfirmationModal from './CornfirmationModal'; // Import your ConfirmationModal

interface Project {
  id: string;
  projectCode: string;        
  projectDescription: string; 
  companyName: string;        
}

interface ApiError extends Error {
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
}

interface ProjectFormValues {
  code: string;
  description: string;
  company: string;
}

interface DeleteResponse {
  data: {
    success: boolean;
    message: string;
    error?: string;
  }
}

interface ProjectTableProps {
  projects: Project[];
  filteredProjects: Project[];
  handleSort: (key: keyof Project) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  setSelectedProject: (project: ProjectFormValues | null) => void;
  setProjectList: (projectlist: Project[]) => void;
  onProjectClick: (projectId: string) => void;
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Control visibility of delete modal
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null); // Track project to delete

  const handleEdit = (project: Project, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event bubbling
    const projectFormValues: ProjectFormValues = {
      code: project.projectCode,
      description: project.projectDescription,
      company: project.companyName,
    };
    setSelectedProject(projectFormValues);
    setIsModalOpen(true);
  };

  const openConfirmationModal = (project: Project, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event bubbling
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

          const updatedProjects = projects.filter(
            (p) => p.projectCode !== project.projectCode
          );

          setProjectList(updatedProjects);
          setIsDeleteModalOpen(false); // Close modal after deletion
          setProjectToDelete(null); // Clear the project to delete
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
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        project={projectToDelete}
      />
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search projects..."
          className="border rounded-lg p-2 w-[20rem]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
          onClick={() => setIsModalOpen(true)} // Open modal
        >
          + Create Project
        </button>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center text-gray-400 italic py-4">
          No projects are created
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[75vh]">
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="p-2"></th>
                <th className="p-2 w-20 text-left cursor-pointer select-none" onClick={() => handleSort('projectCode')}>
                  Project Code <ArrowUpDown size={17} className="inline-block ml-1" />
                </th>
                <th className="p-2 w-2/5 text-left cursor-pointer select-none" onClick={() => handleSort('projectDescription')}>
                  Project Description <ArrowUpDown size={17} className="inline-block ml-1" />
                </th>
                <th className="p-2 w-1/4 text-left cursor-pointer select-none" onClick={() => handleSort('companyName')}>
                  Company Name <ArrowUpDown size={17} className="inline-block ml-1" />
                </th>
                <th className="p-2 w-32 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.projectCode} className="border-t hover:bg-gray-100 cursor-pointer" onClick={() => onProjectClick(project.id)}>
                  <td className="p-2 w-8">
                    <Folder className="text-gray-600" size={20} />
                  </td>
                  <td className="p-2 w-24">{project.projectCode}</td>
                  <td className="p-2 w-2/5">{project.projectDescription}</td>
                  <td className="p-2 w-1/4">{project.companyName}</td>
                  <td className="p-2 w-32 flex justify-start space-x-2">
                    <div className="relative group">
                      <button
                        className="text-blue-500 hover:underline mr-2"
                        onClick={(e) => handleEdit(project, e)} // Pass the event
                      >
                        <Pencil size={17} />
                      </button>
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-gray-700 text-white py-1 px-2 rounded-lg shadow-lg">
                        Edit
                      </span>
                    </div>

                    <div className="relative group">
                      <button
                        className="text-red-500 hover:underline"
                        onClick={(e) => openConfirmationModal(project, e)} // Pass the event
                      >
                        <Trash2 size={17} />
                      </button>
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-gray-700 text-white py-1 px-2 rounded-lg shadow-lg">
                        Delete
                      </span>
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
