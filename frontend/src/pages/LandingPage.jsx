import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDatasetStore from '../store/useDatasetStore';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import PerformanceSection from '../components/PerformanceSection';
import HowItWorksSection from '../components/HowItWorksSection';
import Footer from '../components/Footer';
import UploadModal from '../components/UploadWindow';

export default function LandingPage() {
  const navigate = useNavigate();
  const uploadInfo = useDatasetStore((s) => s.uploadInfo);
  const clearUploadInfo = useDatasetStore((s) => s.clearUploadInfo);
  const [showRecentPopup, setShowRecentPopup] = useState(false);
  const [recentFileName, setRecentFileName] = useState('');
  const [showModal, setShowModal] = useState(false);


  // Check if the dataset still exists on the server
  useEffect(() => {
    if (uploadInfo?.tableName) {
      fetch(`/api/datasets/${uploadInfo.tableName}/metadata`)
        .then((res) => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then((data) => {
          setRecentFileName(data.originalFileName || data.tableName);
          setShowRecentPopup(true);
        })
        .catch(() => {
          // If not found, clear from local storage
          clearUploadInfo();
        });
    }
  }, [uploadInfo, clearUploadInfo]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    const targets = document.querySelectorAll('.animate-on-scroll');
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-background text-on-surface font-sans selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Navbar setShowModal={setShowModal} />
      <main className="pt-20">
        <HeroSection show={showModal} setShowModal={setShowModal}/>
        <FeaturesSection />
        <PerformanceSection />
        <HowItWorksSection />
      </main>
      <Footer />

      {/* Recent Dataset Popup */}
      {showRecentPopup && (
        <div className="fixed bottom-6 right-6 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 flex items-start gap-4 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-brand-50 p-2 rounded-lg text-brand-600">
            <i className="fa-solid fa-table"></i>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800">Recent Dataset Available</h4>
            <button 
              onClick={() => navigate('/dataset')} 
              className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline mt-1 text-left"
            >
              Open {recentFileName}
            </button>
          </div>
          <button 
            onClick={() => setShowRecentPopup(false)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      
      {/* Upload Modal */}
      {showModal && <UploadModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
