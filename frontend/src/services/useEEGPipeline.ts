import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useStreamStore } from '../store/stream';
import { useRecordingStore } from '../store/recording';
import { usePlaybackStore } from '../store/playback';
import { generateMockEEG, computeBandPower, computeBrainState, computeCorrelation } from '../utils/mockEeg';
import { EEGData, BandPower, BrainState, CorrelationData } from '../types';

const POLL_INTERVAL = 3000;

async function fetchEEGSample(channel: string): Promise<{
  eeg: EEGData;
  bands: BandPower;
  brainState: BrainState;
  correlation: CorrelationData;
}> {
  try {
    const { data } = await axios.get(`/api/eeg/sample/${channel}?duration=3`);
    return {
      eeg: data.eeg,
      bands: data.bands,
      brainState: data.brainState,
      correlation: data.correlation,
    };
  } catch {
    const eeg = generateMockEEG(3);
    const bands = computeBandPower();
    const brainState = computeBrainState(bands);
    const correlation = computeCorrelation(channel, eeg);
    return { eeg, bands, brainState, correlation };
  }
}

export const useEEGPipeline = () => {
  const selectedChannel = useStreamStore((s) => s.selectedChannel);
  const playbackMode = usePlaybackStore((s) => s.playbackMode);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (playbackMode) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const tick = async () => {
      const channel = useStreamStore.getState().selectedChannel;
      const { eeg, bands, brainState, correlation } = await fetchEEGSample(channel);
      useStreamStore.getState().updateAll(eeg, bands, brainState, correlation);
      if (useRecordingStore.getState().isRecording) {
        useRecordingStore.getState().addRecordingFrame(eeg, bands, brainState);
      }
    };

    tick();
    intervalRef.current = window.setInterval(tick, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedChannel, playbackMode]);
};
