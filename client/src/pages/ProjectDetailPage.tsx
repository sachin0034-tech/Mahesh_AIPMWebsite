import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProjectById } from "@/lib/cohortApi";
import { ProjectPublicView } from "@/components/ProjectPublicView";

export const ProjectDetailPage = (): JSX.Element => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await getProjectById(projectId);
        setProject(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  return (
    <div className="min-h-screen" style={{ background: "#f5f2ed" }}>

      {/* Nav */}
      <header
        className="w-full sticky top-0 z-40 backdrop-blur-md border-b"
        style={{ background: "rgba(245,242,237,0.92)", borderColor: "rgba(0,0,0,0.06)" }}
      >
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 transition-opacity hover:opacity-60"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: "0.78rem", letterSpacing: "0.12em", color: "#1a1a1a",
              background: "none", border: "none", cursor: "pointer", padding: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            BACK
          </button>

          <Link to="/" className="flex flex-col leading-none select-none">
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.02em", color: "#1a1a1a", lineHeight: 1 }}>MYAI</span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.02em", color: "#1a1a1a", lineHeight: 1 }}>COMMUNITY</span>
          </Link>

          {/* spacer to balance the back button */}
          <div style={{ width: 60 }} />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-20">
        {loading ? (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
            <div className="w-full h-52 bg-gray-100" />
            <div className="p-6 space-y-4">
              <div className="h-5 w-2/3 bg-gray-100 rounded" />
              <div className="h-3 w-1/3 bg-gray-100 rounded" />
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-3 w-5/6 bg-gray-100 rounded" />
            </div>
          </div>
        ) : error || !project ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-sm mb-4">Project not found or no longer available.</p>
            <button
              onClick={() => navigate("/")}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: "0.78rem", letterSpacing: "0.12em",
                background: "#1a1a1a", color: "#f5f2ed",
                border: "none", borderRadius: 8, padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              BACK TO HOME
            </button>
          </div>
        ) : (
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.05)" }}
          >
            <ProjectPublicView project={project} index={0} isPreview={false} />
            {/* bottom padding inside card */}
            <div className="pb-6" />
          </div>
        )}
      </main>
    </div>
  );
};
