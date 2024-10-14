import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronsRight, Folder, Pencil, Trash2 } from 'lucide-react';
import UserDropDown from '../components/UserDropDown/UserDropDown';
import CreateProjectModal from '../components/CreateProjectModal/CreateProjectModal';
import { ArrowUpDown } from 'lucide-react'; // Import the sort icon

interface Project {
  code: string;
  description: string;
  company: string;
}

const PipingSpecCreation = () => {
  const [projects, setProjects] = useState<Project[]>([
    { code: 'SE2', description: 'Spec for SE2 project', company: 'ABC Corp' },
    { code: 'TY1', description: 'Spec for TY1 project', company: 'XYZ Ltd' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Project; direction: 'ascending' | 'descending' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')!);
    if (user) {
      setUsername(user.name);
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

  const handleCreateProject = (newProject: Project) => {
    setProjects([...projects, newProject]);
    setIsModalOpen(false); // Close modal after submission
  };

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
          <li className="text-gray-500">PipingSpecCreation</li>
        </ol>
        <div className="flex items-center">
          <UserDropDown username={username} />
        </div>
      </nav>

      {/* Page Content with Create Project Button */}
      <div className="bg-white p-6 rounded-lg shadow-md relative">
        <div className="flex justify-between items-center mb-4">
          {/* Search bar */}
          <input
            type="text"
            placeholder="Search projects..."
            className="border rounded-lg p-2 w-[20rem]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Create Project Button */}
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
            onClick={() => setIsModalOpen(true)} // Open modal
          >
            + Create Project
          </button>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-y-auto max-h-[75vh]"> {/* Adjust max-height as needed */}
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="p-2"></th> {/* Empty header for Folder icon */}
                <th className="p-2 w-24 text-left cursor-pointer" onClick={() => handleSort('code')}>
                  Project Code <ArrowUpDown size={17} className="inline-block ml-1" />
                </th>
                <th className="p-2 w-2/5 text-left cursor-pointer" onClick={() => handleSort('description')}>
                  Project Description <ArrowUpDown size={17} className="inline-block ml-1" />
                </th>
                <th className="p-2 w-1/4 text-left cursor-pointer" onClick={() => handleSort('company')}>
                  Company Name <ArrowUpDown size={17} className="inline-block ml-1" />
                </th>
                <th className="p-2 w-32 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.code} className="border-t">
                  <td className="p-2 w-8">
                    <Folder className="text-gray-600" size={20} /> {/* Folder Icon */}
                  </td>
                  <td className="p-2 w-24">{project.code}</td>
                  <td className="p-2 w-2/5">{project.description}</td>
                  <td className="p-2 w-1/4">{project.company}</td>
                  <td className="p-2 w-32 flex justify-start space-x-2">
                    <div className="relative group">
                      <button className="text-blue-500 hover:underline mr-2">
                        <Pencil size={17} />
                      </button>
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-gray-700 text-white py-1 px-2 rounded-lg shadow-lg">
                        Edit
                      </span>
                    </div>

                    <div className="relative group">
                      <button className="text-red-500 hover:underline">
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
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  );
};

export default PipingSpecCreation;
