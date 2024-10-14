import { useState, useEffect } from 'react';
import { ChevronsRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserDropDown from '../components/UserDropDown/UserDropDown';
import ProjectTable from '../components/ProjectTable/ProjectTable';
import CreateProjectModal from '../components/CreateProjectModal/CreateProjectModal';
import api from '../utils/api/apiutils';
import {api as configApi} from "../utils/api/config";

interface Project {
  code: string;
  description: string;
  company: string;
}

const PipingSpecCreation = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Project; direction: 'ascending' | 'descending' } | null>(null);
  const [username, setUsername] = useState('');
//   const [userId, setUserId] = useState(''); // Store user ID
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state


  const fetchUserProjects = async () => {
    const response = await api.get(`${configApi.API_URL.project.getAllProjectByUser}`);
    console.log(response);
    return response.data.projects; // Adjust this based on your response structure
};

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')!);
    if (user) {
      setUsername(user.name);
    //   setUserId(user.id); // Get user ID
      // Fetch initial projects for the user when component mounts
      fetchUserProjects().then(fetchedProjects => {
        setProjects(fetchedProjects);
      });
    } else {
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

  const handleCreateProject = async (newProject: Project) => {
    // Assuming you have logic to create a project already in place
    // ...

    // After creating a project, fetch the updated projects list
    const updatedProjects = await fetchUserProjects(); // Fetch projects for the user again
    setProjects(updatedProjects); // Update the state with new projects
    setIsModalOpen(false); // Close modal after creating the project
  };

  const sortedProjects = [...projects].sort((a, b) => {
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
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.code.toLowerCase().includes(searchTerm.toLowerCase())
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
        projects={projects}
        filteredProjects={filteredProjects}
        handleSort={handleSort}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setIsModalOpen={setIsModalOpen} // Pass down the setIsModalOpen function
      />

      {/* Create Project Modal */}
      {isModalOpen && (
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={async () => {
            setIsModalOpen(false);
            const updatedProjects = await fetchUserProjects(); // Fetch projects for the user when modal closes
            setProjects(updatedProjects); // Update the state with new projects
          }}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  );
};

export default PipingSpecCreation;
