"use client"; // whenever u ur using react hooks like useEffect or useSate, make sure to mention this directory at the top

import { useEffect, useState } from 'react';
import { useAuth } from "@clerk/nextjs"; /* { useAuth } - it will give access to the JWT token. only if we have access to the JWT token, we can make api calls to the server, and the server can authenticate the user*/

import { useRouter } from 'next/navigation'; /* to redirect the users */
import { ProjectsGrid } from '@/components/projects/ProjectsGrid'; /* it will neatly display the projects in a list or grid */

import { CreateProjectModal } from '@/components/projects/CreateProjectModal'; // Popup modal to create a new project
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'; /* Shows spinner while loading data */

import toast from "react-hot-toast"; /* Shows small popup messages */ 
import { apiClient } from '@/lib/api';

interface Project{  // to remove the typescript red zigzag lines
  id: string,
  name: string,
  description: string,
  created_at: string,
  clerk_id: string
}
function ProjectsPage(){
    // Data state
    const [projects, setProjects] = useState<Project[]>([]); // Stores all projects fetched from backend
    const [loading, setLoading]= useState(true);
    const [error, setError] = useState(null);

    // UI State
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    //Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const {getToken, userId} = useAuth();
    const router = useRouter();

    //Business logic functions (the skeleton)
    const loadProjects = async () => {
      try {
          setLoading(true);

          const token = await getToken() // get the token

          if (!token) {
            console.error("No JWT token available. User might not be signed in.");
            toast.error("You must be signed in to load projects");
            return;
          }

          console.log("Clerk JWT token:", token); // Debug token

          const result = await apiClient.get("/api/projects", token) // make api call

          const { data } = result || {}

          console.log(data, "projectList")

          setProjects(data);
      } catch (err) {
          console.error("Error Loading Projects", err)
          toast.error("Failed to create project")
      } finally {
        setLoading(false);
      }
    };

    const handleCreateProject = async (name: string, description: string) => {
      try {
          setError(null) // clear all the errors we might have in the past
          setIsCreating(true)

          const token = await getToken() // get the token

          if (!token) {
            console.error("No JWT token available. User might not be signed in.");
            toast.error("You must be signed in to create a project");
            return;
          }

          console.log("Clerk JWT token:", token); // Debug token

          const result = await apiClient.post(         // make api call
            "/api/projects", 
            {
              name: name,
              description: description
          },
          token
        );

        const savedProject = result?.data || {}
        setProjects((prev) => [savedProject, ...prev])

        setShowCreateModal(false)
        toast.success("Project created successfully!")
        
      } catch (err) {

        toast.error("Failed to create project ")
        console.error("Failed to create project", err);

      } finally {

        setIsCreating(false);
        
      }
    };

    const handleDeleteProject = async (projectId: string) => {
      try {
        setError(null)
        const token = await getToken();
        
        await apiClient.delete(`/api/projects/${projectId}`, token);

        setProjects((prev) => prev.filter((project) => project.id !==projectId));

        toast.success("Project deleted successfully!");
        

      } catch(err) {

        toast.error("Failed to delete project");
        console.error("Failed to delete project", err);

      }
    };

    // we also want a method that is going to redirect the application on a particular project click by the user\
    const handleProjectClick = (projectId: string) =>{      // to go to that particular project's detailed page once clicked by the user
        router.push(`/projects/${projectId}`);
    } ;

    // Event Handlers. now we need 2 event handlers. 1 to manage the opening of the modal, and the other to close the modal
    const handleOpenModal = () => {
      setShowCreateModal(true);
    };
    const handleCloseModal = () => {
      setShowCreateModal(false);
    };

    useEffect (() => {  // whenever we make an api call, we use useEffect
      if(userId){
        loadProjects();
      }
    }, [userId])

    //filter projects in the search bar
    const filterProjects = projects.filter(
      (project) => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    //loader
    if (loading){
      return <LoadingSpinner message="Loading projects..."/>
    }

    return (
    <div>
      <ProjectsGrid
      projects={filterProjects}
      loading={loading}
      error={error}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onProjectClick={handleProjectClick}
      onCreateProject={handleOpenModal}
      onDeleteProject={handleDeleteProject}
      />
      <CreateProjectModal
      isOpen={showCreateModal}
      onClose={handleCloseModal}
      onCreateProject={handleCreateProject}
      isLoading={isCreating}
      />
    </div>
  );
}   

export default ProjectsPage;
