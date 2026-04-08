import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectUser } from '@/contexts/ProjectUserContext';
import { getMyProjects } from '@/lib/projectUserApi';
import { Loader2, Pencil, LogOut } from 'lucide-react';
import type { CohortProject } from '@/lib/supabase';

export const ProjectUserDashboard = (): JSX.Element => {
  const { isLoggedIn, user, logout } = useProjectUser();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<CohortProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/project-login');
      return;
    }
    (async () => {
      try {
        const { projects: data } = await getMyProjects();
        if (data.length === 1) {
          // Auto-navigate to the editor if only one project
          navigate(`/project-editor/${data[0].id}`, { replace: true });
          return;
        }
        setProjects(data ?? []);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoggedIn]);

  const handleLogout = async () => {
    await logout();
    navigate('/project-login');
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="font-black text-lg tracking-tight">MYAICOMMUNITY</div>
          <p className="text-gray-400 text-xs mt-0.5">My Projects</p>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-500">Hi, <span className="font-medium text-gray-700">{user.username}</span></span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Projects</h1>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading…
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No projects assigned to your account yet.</p>
            <p className="text-xs mt-1">Contact your admin to get access.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {project.thumbnail_url ? (
                  <img src={project.thumbnail_url} alt={project.title} className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                    <span className="text-3xl font-black text-indigo-200">
                      {project.title.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{project.title}</h3>
                    <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      project.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-4">{project.description}</p>
                  )}
                  <button
                    onClick={() => navigate(`/project-editor/${project.id}`)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#E75A55] to-[#9747FF] text-white text-sm font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Pencil size={13} /> Edit Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
