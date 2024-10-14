import { ArrowUpDown, Folder, Pencil, Trash2 } from 'lucide-react';

interface Project {
  projectCode: string;        
  projectDescription: string; 
  companyName: string;        
}

interface ProjectTableProps {
  projects: Project[];
  filteredProjects: Project[];
  handleSort: (key: keyof Project) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setIsModalOpen: (isOpen: boolean) => void; // Accept the function to open modal
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  filteredProjects,
  handleSort,
  searchTerm,
  setSearchTerm,
  setIsModalOpen,
}) => {
  return (
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
              <th
                className="p-2 w-20 text-left cursor-pointer select-none" // Disable text selection on double-click
                onClick={() => handleSort('projectCode')}
              >
                Project Code <ArrowUpDown size={17} className="inline-block ml-1" />
              </th>
              <th
                className="p-2 w-2/5 text-left cursor-pointer select-none" // Disable text selection
                onClick={() => handleSort('projectDescription')}
              >
                Project Description <ArrowUpDown size={17} className="inline-block ml-1" />
              </th>
              <th
                className="p-2 w-1/4 text-left cursor-pointer select-none" // Disable text selection
                onClick={() => handleSort('companyName')}
              >
                Company Name <ArrowUpDown size={17} className="inline-block ml-1" />
              </th>
              <th className="p-2 w-32 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? ( // Check if there are no projects
              <tr>
                <td colSpan={5} className="text-center text-gray-400 italic py-4">
                  No projects are created
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr
                  key={project.projectCode} // Use projectCode as the key
                  className="border-t hover:bg-gray-100 cursor-pointer" // Add hover effect and pointer cursor
                >
                  <td className="p-2 w-8">
                    <Folder className="text-gray-600" size={20} /> {/* Folder Icon */}
                  </td>
                  <td className="p-2 w-24">{project.projectCode}</td>
                  <td className="p-2 w-2/5">{project.projectDescription}</td>
                  <td className="p-2 w-1/4">{project.companyName}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTable;
