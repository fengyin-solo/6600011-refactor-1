import { create } from 'zustand';
import { EEGData, BandPower, BrainState, CorrelationData } from '../types';

export interface StreamState {
  eegData: EEGData | null;
  selectedChannel: string;
  bandPower: BandPower | null;
  isStreaming: boolean;
  brainState: BrainState | null;
  correlationData: CorrelationData | null;
  setEEGData: (d: EEGData | null) => void;
  setChannel: (c: string) => void;
  setBandPower: (b: BandPower | null) => void;
  setStreaming: (v: boolean) => void;
  setBrainState: (s: BrainState | null) => void;
  setCorrelationData: (c: CorrelationData | null) => void;
  updateAll: (eeg: EEGData, bands: BandPower, brainState: BrainState, correlation: CorrelationData) => void;
}

export const useStreamStore = create<StreamState>((set) => ({
  eegData: null,
  selectedChannel: 'Fp1',
  bandPower: null,
  isStreaming: false,
  brainState: null,
  correlationData: null,
  setEEGData: (d) => set({ eegData: d }),
  setChannel: (c) => set({ selectedChannel: c }),
  setBandPower: (b) => set({ bandPower: b }),
  setStreaming: (v) => set({ isStreaming: v }),
  setBrainState: (s) => set({ brainState: s }),
  setCorrelationData: (c) => set({ correlationData: c }),
  updateAll: (eeg, bands, brainState, correlation) =>
    set({ eegData: eeg, bandPower: bands, brainState, correlationData: correlation }),
}));
