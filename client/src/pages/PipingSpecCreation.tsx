import { useState, useEffect } from 'react';
import { ChevronsRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserDropDown from '../components/UserDropDown/UserDropDown';
import ProjectTable from '../components/ProjectTable/ProjectTable';
import CreateProjectModal from '../components/CreateProjectModal/CreateProjectModal';
import api from '../utils/api/apiutils';
import {api as configApi} from "../utils/api/config";
import Cookies from "js-cookie";

interface Project {
  projectCode: string;
  projectDescription: string;
  companyName: string;
}

interface ProjectFormValues {
  code: string;
  description: string;
  company: string;
}

const PipingSpecCreation = () => {
  const [projectlist, setProjectList] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Project; direction: 'ascending' | 'descending' } | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectFormValues | null>(null);
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 


  const fetchUserProjects = async () => {
    const response = await api.get(`${configApi.API_URL.project.getAllProjectByUser}`);
    return response.data;
};

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')!);
    const token = Cookies.get('token');
    if (user && token) {
      setUsername(user.name);
      fetchUserProjects().then(fetchedProjects => {
        setProjectList(fetchedProjects);
      });
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
          <li className="text-gray-500">Create Project</li>
        </ol>
        <div className="flex items-center">
          <UserDropDown username={username} />
        </div>
      </nav>

      {/* Project Table Component */}
      <ProjectTable
        projects={projectlist}
        filteredProjects={filteredProjects}
        handleSort={handleSort}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setIsModalOpen={setIsModalOpen}
        setSelectedProject={setSelectedProject}
        setProjectList = {setProjectList}
      />

      {/* Create Project Modal */}
      {isModalOpen && (
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={async () => {
            setIsModalOpen(false);
            setSelectedProject(null)
            const updatedProjects = await fetchUserProjects(); // Fetch projects for the user when modal closes
            setProjectList(updatedProjects); // Update the state with new projects
          }}
          onSubmit={handleCreateProject}
          project={selectedProject}
        />
      )}
    </div>
  );
};

export default PipingSpecCreation;
