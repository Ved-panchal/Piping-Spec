import db from "../models";

export const validateProjectAndUser = async (projectId: string, userId: string) => {
    // Fetch the project by projectId
    const project = await db.Project.findOne({
      where: { id: projectId },
    });
  
    // Check if project exists and if userId matches
    if (!project || project.userId !== userId) {
      return false; // Project not valid
    }
  
    return true; // Project is valid
  };
