import { useState, useEffect } from 'react';
import { ChevronsRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserDropDown from '../components/UserDropDown/UserDropDown';
import ProjectTable from '../components/ProjectTable/ProjectTable';
import CreateProjectModal from '../components/CreateProjectModal/CreateProjectModal';
import Specs from '../components/Specs/Specs'; // Import the Specs component
import api from '../utils/api/apiutils';
import { api as configApi } from "../utils/api/config";
import { Project, ProjectFormValues } from '../utils/interface';



const PipingSpecCreation = () => {
  const [projectlist, setProjectList] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Project; direction: 'ascending' | 'descending' } | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectFormValues | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null); // Track selected project ID
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const fetchUserProjects = async () => {
    const response = await api.get(`${configApi.API_URL.project.getAllProjectByUser}`);
    return response.data.projects;
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')!);
    const token = JSON.parse(localStorage.getItem('token')!);
    if (user && token) {
      setUsername(user.name);
      fetchUserProjects().then(fetchedProjects => {
        setProjectList(fetchedProjects);
      });

      // Check if there's a saved projectId in localStorage
      const savedProjectId = localStorage.getItem('currentProjectId');
      if (savedProjectId) {
        setSelectedProjectId(savedProjectId); // Load Specs if projectId exists
      }
    } else {
      localStorage.clear();
      window.location.href = '/';
    }
  }, []);

  const handleSort = (key: keyof Project) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleCreateProject = async () => {
    const updatedProjects = await fetchUserProjects();
    setProjectList(updatedProjects);
    setIsModalOpen(false);
  };

  const handleProjectClick = (projectId: string,projectCode: string) => {
    localStorage.setItem('projectCode', projectCode);
    setSelectedProjectId(projectId); // Set the selected project ID when clicking on a project
    localStorage.setItem('currentProjectId', projectId); // Save the selected project ID to localStorage
  };

  const sortedProjects = [...projectlist].sort((a, b) => {
    if (!sortConfig) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredProjects = sortedProjects.filter((project) =>
    project.projectDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.projectCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Breadcrumb Navigation */}
      <nav className="text-sm font-medium text-gray-500 mb-4 flex justify-between" aria-label="Breadcrumb">
        <ol className="list-reset flex items-center">
          <li>
            <Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link>
          </li>
          <li>
            <ChevronsRight className="mx-2 text-gray-500" size={20} strokeWidth={1.5} />
          </li>
          <li>
            {selectedProjectId ? (
              <div className='flex'>
                <Link 
                  to="/services/pipingspec-creation" 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    setSelectedProjectId(null);
                    localStorage.removeItem('currentProjectId'); // Clear saved projectId
                  }}  
                >
                  Projects
                </Link>
                <ChevronsRight className="mx-2 text-gray-500" size={20} strokeWidth={1.5} />
                <span className="text-gray-500">Specs</span>
              </div>
            ) : (
              <span className="text-gray-500">Projects</span>
            )}
          </li>

        </ol>
        <div className="flex items-center">
          <UserDropDown username={username} />
        </div>
      </nav>
  
      {/* Flexbox layout for ProjectTable and Specs */}
      <div className="flex flex-col space-y-6">
        {!selectedProjectId ? (
          <div className="flex-grow"> 
            <ProjectTable
              projects={projectlist}
              filteredProjects={filteredProjects}
              handleSort={handleSort}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setIsModalOpen={setIsModalOpen}
              setSelectedProject={setSelectedProject}
              setProjectList={setProjectList}
              onProjectClick={handleProjectClick}
            />
          </div>
        ) : (
          <div className="flex-grow"> 
            <Specs projectId={selectedProjectId} />
          </div>
        )}
      </div>
  
      {/* Create Project Modal */}
      {isModalOpen && (
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={async () => {
            setIsModalOpen(false);
            setSelectedProject(null);
            const updatedProjects = await fetchUserProjects();
            setProjectList(updatedProjects);
          }}
          onSubmit={handleCreateProject}
          project={selectedProject}
        />
      )}
    </div>
  );
};

export default PipingSpecCreation;
