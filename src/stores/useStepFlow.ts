import { create } from 'zustand';

export type AnalysisType = 'self' | 'partner' | 'ex' | 'crush' | null | undefined;
export type AnalysisMode = 'fast' | 'deep' | null | undefined;

interface StepFlowState {
  analysisType: AnalysisType;
  mode: AnalysisMode;
  isRecovering: boolean;
  setStepData: (data: Partial<Omit<StepFlowState, 'setStepData' | 'resetFlowState' | 'setRecovering'>>) => void;
  resetFlowState: () => void;
  setRecovering: (status: boolean) => void;
}

const initialState: Omit<StepFlowState, 'setStepData' | 'resetFlowState' | 'setRecovering'> = {
    analysisType: undefined,
    mode: undefined,
    isRecovering: false,
};

export const useStepFlow = create<StepFlowState>((set, get) => ({
  ...initialState, 
  setStepData: (data) => {
    set((state) => ({ ...state, ...data }))
  },
  resetFlowState: () => {
    
    set({ ...initialState, isRecovering: true });
  },
  setRecovering: (status) => {
    const currentRecoveryStatus = get().isRecovering;
    set({ isRecovering: status });
  },
}));