import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MaintenanceTask, MaintenanceBlock, Corridor, Conflict, AIRecommendation, SystemIntegration, TrainMovement } from '../types';
import { railwayService } from '../services/railwayService';

interface AppContextType {
  tasks: MaintenanceTask[];
  blocks: MaintenanceBlock[];
  corridors: Corridor[];
  conflicts: Conflict[];
  recommendations: AIRecommendation[];
  integrations: SystemIntegration[];
  trains: TrainMovement[];
  
  // Filter States
  selectedCorridor: string;
  setSelectedCorridor: (corridor: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  selectedCriticality: string;
  setSelectedCriticality: (criticality: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Modals & Drawers State
  isOptimizationModalOpen: boolean;
  setIsOptimizationModalOpen: (open: boolean) => void;
  activeExplainabilityRec: AIRecommendation | null;
  setActiveExplainabilityRec: (rec: AIRecommendation | null) => void;
  selectedTaskForDetail: MaintenanceTask | null;
  setSelectedTaskForDetail: (task: MaintenanceTask | null) => void;
  isCreateBlockModalOpen: boolean;
  setIsCreateBlockModalOpen: (open: boolean) => void;
  isAddTrainModalOpen: boolean;
  setIsAddTrainModalOpen: (open: boolean) => void;
  isRailRadarPanelOpen: boolean;
  setIsRailRadarPanelOpen: (open: boolean) => void;

  // Actions
  approveRecommendation: (id: string) => void;
  rejectRecommendation: (id: string) => void;
  resolveConflict: (id: string, solution?: string) => void;
  runAIOptimization: (params: { corridor?: string; timeHorizonDays?: number }) => void;
  createBlock: (blockData: Omit<MaintenanceBlock, 'id'>) => void;
  addTrainMovement: (trainData: Omit<TrainMovement, 'id'>) => void;
  updateTaskStatus: (id: string, status: MaintenanceTask['status']) => void;
  
  // Stats
  kpiStats: {
    assetAvailability: number;
    availabilityChange: number;
    urgentTasks: number;
    coordinatedPercentage: number;
    openConflicts: number;
    downtimeSavedHours: number;
  };

  // Toast Notification
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [blocks, setBlocks] = useState<MaintenanceBlock[]>([]);
  const [corridors, setCorridors] = useState<Corridor[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [integrations, setIntegrations] = useState<SystemIntegration[]>([]);
  const [trains, setTrains] = useState<TrainMovement[]>([]);

  // Default to Trans-Harbour & Sunday Mega Block date
  const [selectedCorridor, setSelectedCorridor] = useState<string>('THN–VSH');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-06');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI state
  const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState<boolean>(false);
  const [activeExplainabilityRec, setActiveExplainabilityRec] = useState<AIRecommendation | null>(null);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<MaintenanceTask | null>(null);
  const [isCreateBlockModalOpen, setIsCreateBlockModalOpen] = useState<boolean>(false);
  const [isAddTrainModalOpen, setIsAddTrainModalOpen] = useState<boolean>(false);
  const [isRailRadarPanelOpen, setIsRailRadarPanelOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshData = () => {
    setTasks([...railwayService.getTasks()]);
    setBlocks([...railwayService.getBlocks()]);
    setCorridors([...railwayService.getCorridors()]);
    setConflicts([...railwayService.getConflicts()]);
    setRecommendations([...railwayService.getAIRecommendations()]);
    setIntegrations([...railwayService.getIntegrations()]);
    setTrains([...railwayService.getTrainMovements()]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const approveRecommendation = (id: string) => {
    const newBlock = railwayService.approveRecommendation(id);
    refreshData();
    if (newBlock) {
      showToast(`Mega Block ${newBlock.id} approved & scheduled on ${newBlock.corridor}`);
    }
  };

  const rejectRecommendation = (id: string) => {
    railwayService.rejectRecommendation(id);
    refreshData();
    showToast(`Recommendation ${id} dismissed.`);
  };

  const resolveConflict = (id: string, solution?: string) => {
    railwayService.resolveConflict(id, solution);
    refreshData();
    showToast(`Conflict ${id} marked as resolved!`);
  };

  const runAIOptimization = (params: { corridor?: string; timeHorizonDays?: number }) => {
    const res = railwayService.generateNewPlan(params);
    refreshData();
    showToast(`Trans-Harbour AI Mega Block Optimization Complete: Generated ${res.generatedBlocks} coordinated blocks with average suitability ${res.suitabilityAvg}%!`);
  };

  const createBlock = (blockData: Omit<MaintenanceBlock, 'id'>) => {
    const newBlock = railwayService.createBlock(blockData);
    refreshData();
    showToast(`Mega Block ${newBlock.id} successfully scheduled.`);
  };

  const addTrainMovement = (trainData: Omit<TrainMovement, 'id'>) => {
    const newTrain = railwayService.addTrainMovement(trainData);
    refreshData();
    showToast(`Train Schedule #${newTrain.trainNumber} (${newTrain.name}) added to ${newTrain.corridor}!`);
  };

  const updateTaskStatus = (id: string, status: MaintenanceTask['status']) => {
    railwayService.updateTaskStatus(id, status);
    refreshData();
    showToast(`Task ${id} updated to ${status}`);
  };

  const urgentTasksCount = tasks.filter(t => t.criticality === 'Critical' || t.priority === 'P1').length;
  const openConflictsCount = conflicts.filter(c => c.status === 'Open').length;
  const coordinatedBlocksCount = blocks.filter(b => b.isCoordinated).length;
  const coordinatedPercentage = blocks.length ? Math.round((coordinatedBlocksCount / blocks.length) * 100) : 0;

  const kpiStats = {
    assetAvailability: 95.8,
    availabilityChange: +3.4,
    urgentTasks: urgentTasksCount,
    coordinatedPercentage: coordinatedPercentage,
    openConflicts: openConflictsCount,
    downtimeSavedHours: 24.5,
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        blocks,
        corridors,
        conflicts,
        recommendations,
        integrations,
        trains,
        selectedCorridor,
        setSelectedCorridor,
        selectedDepartment,
        setSelectedDepartment,
        selectedCriticality,
        setSelectedCriticality,
        selectedDate,
        setSelectedDate,
        searchQuery,
        setSearchQuery,
        isOptimizationModalOpen,
        setIsOptimizationModalOpen,
        activeExplainabilityRec,
        setActiveExplainabilityRec,
        selectedTaskForDetail,
        setSelectedTaskForDetail,
        isCreateBlockModalOpen,
        setIsCreateBlockModalOpen,
        isAddTrainModalOpen,
        setIsAddTrainModalOpen,
        isRailRadarPanelOpen,
        setIsRailRadarPanelOpen,
        approveRecommendation,
        rejectRecommendation,
        resolveConflict,
        runAIOptimization,
        createBlock,
        addTrainMovement,
        updateTaskStatus,
        kpiStats,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
