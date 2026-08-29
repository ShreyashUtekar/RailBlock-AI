import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { OptimizationModal } from './components/ai/OptimizationModal';
import { AddTrainModal } from './components/common/AddTrainModal';
import { RailRadarLivePanel } from './components/ai/RailRadarLivePanel';

// Pages
import { Overview } from './pages/Overview';
import { BlockPlanner } from './pages/BlockPlanner';
import { MaintenanceTasks } from './pages/MaintenanceTasks';
import { CorridorAvailability } from './pages/CorridorAvailability';
import { AIRecommendations } from './pages/AIRecommendations';
import { Conflicts } from './pages/Conflicts';
import { Analytics } from './pages/Analytics';
import { DataIntegration } from './pages/DataIntegration';
import { Settings } from './pages/Settings';

export const AppContent: React.FC = () => {
  const { isRailRadarPanelOpen, setIsRailRadarPanelOpen } = useApp();

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* Persistent Operations Control Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <TopBar />

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/planner" element={<BlockPlanner />} />
            <Route path="/tasks" element={<MaintenanceTasks />} />
            <Route path="/corridors" element={<CorridorAvailability />} />
            <Route path="/ai-recommendations" element={<AIRecommendations />} />
            <Route path="/conflicts" element={<Conflicts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/data-integration" element={<DataIntegration />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      {/* Global Modals */}
      <OptimizationModal />
      <AddTrainModal />
      <RailRadarLivePanel
        isOpen={isRailRadarPanelOpen}
        onClose={() => setIsRailRadarPanelOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
