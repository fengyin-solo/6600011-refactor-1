import { create } from 'zustand';
import { Recording, PlaybackState as PlaybackStateType } from '../types';
import { useStreamStore } from './stream';

export interface PlaybackStoreState {
  playbackMode: boolean;
  activeRecording: Recording | null;
  playbackState: PlaybackStateType;
  enterPlaybackMode: (recording: Recording) => void;
  exitPlaybackMode: () => void;
  setPlaybackTime: (time: number) => void;
  togglePlayback: () => void;
  setPlaybackPlaying: (playing: boolean) => void;
}

const initialPlaybackState: PlaybackStateType = {
  isPlaying: false,
  currentTime: 0,
  currentFrame: null,
};

export const usePlaybackStore = create<PlaybackStoreState>((set, get) => ({
  playbackMode: false,
  activeRecording: null,
  playbackState: { ...initialPlaybackState },
  enterPlaybackMode: (recording) => {
    if (recording.frames.length === 0) return;
    const frame = recording.frames[0];
    useStreamStore.getState().updateAll(frame.eeg, frame.bands, frame.brainState, useStreamStore.getState().correlationData!);
    set({
      playbackMode: true,
      activeRecording: recording,
      playbackState: {
        isPlaying: false,
        currentTime: 0,
        currentFrame: frame,
      },
    });
  },
  exitPlaybackMode: () => {
    set({
      playbackMode: false,
      activeRecording: null,
      playbackState: { ...initialPlaybackState },
    });
  },
  setPlaybackTime: (time) => {
    const { activeRecording } = get();
    if (!activeRecording || activeRecording.frames.length === 0) return;
    const frames = activeRecording.frames;
    let frameIndex = 0;
    for (let i = 0; i < frames.length; i++) {
      if (frames[i].relativeTime <= time) {
        frameIndex = i;
      } else {
        break;
      }
    }
    const frame = frames[frameIndex];
    useStreamStore.getState().setEEGData(frame.eeg);
    useStreamStore.getState().setBandPower(frame.bands);
    useStreamStore.getState().setBrainState(frame.brainState);
    set({
      playbackState: {
        ...get().playbackState,
        currentTime: time,
        currentFrame: frame,
      },
    });
  },
  togglePlayback: () => {
    set({
      playbackState: {
        ...get().playbackState,
        isPlaying: !get().playbackState.isPlaying,
      },
    });
  },
  setPlaybackPlaying: (playing) => {
    set({
      playbackState: {
        ...get().playbackState,
        isPlaying: playing,
      },
    });
  },
}));
