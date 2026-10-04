import React, {createContext, useContext} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from './timeline.json';

const TimeContext = createContext<{actual: number; authored: number} | null>(null);

export function mapSceneTime(actual: number, points: number[][]) {
  if (actual <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    if (actual <= points[i][0]) {
      const progress = (actual - points[i-1][0]) / (points[i][0] - points[i-1][0]);
      return points[i-1][1] + progress * (points[i][1] - points[i-1][1]);
    }
  }
  return points[points.length-1][1];
}

// Mounted inside each Sequence. Both clocks are scene-local; audio/subtitles use the film clock.
export const SceneTimingProvider: React.FC<React.PropsWithChildren<{index: number}>> = ({index, children}) => {
  const actual = useCurrentFrame() / useVideoConfig().fps;
  return <TimeContext.Provider value={{actual, authored: mapSceneTime(actual, timeline.sceneTimeMaps[index])}}>{children}</TimeContext.Provider>;
};

export function sceneSeconds() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return useContext(TimeContext)?.actual ?? frame / fps;
}

export function authoredSeconds() {
  const actual = sceneSeconds();
  return useContext(TimeContext)?.authored ?? actual;
}
