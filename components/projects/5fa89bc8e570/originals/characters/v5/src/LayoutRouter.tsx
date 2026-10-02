import type {FC} from "react";
import type {Page} from "./types";
import {ApertureSlice, AxisLock, CounterSlot, FocusWindow, ModuleSplit, PathBuild, PointToField, TerminalSteps} from "./layouts/GroupOne";
import {CompressBand, FocusRail, LineToPlane, ModuleMerge, PanelsConverge, SplitCopy, StepTiles, WordGrid} from "./layouts/GroupTwo";
import {FinalField, MetricRibbon, ResolvePath, SlotJudgment, StopIntervention, WordImpact} from "./layouts/GroupThree";

const layouts: Record<string, FC<{item: Page}>> = {
  "path-build": PathBuild,
  "focus-window": FocusWindow,
  "counter-slot": CounterSlot,
  "aperture-slice": ApertureSlice,
  "point-to-field": PointToField,
  "axis-lock": AxisLock,
  "terminal-steps": TerminalSteps,
  "module-split": ModuleSplit,
  "split-copy": SplitCopy,
  "line-to-plane": LineToPlane,
  "step-tiles": StepTiles,
  "compress-band": CompressBand,
  "focus-rail": FocusRail,
  "word-grid": WordGrid,
  "panels-converge": PanelsConverge,
  "module-merge": ModuleMerge,
  "word-impact": WordImpact,
  "metric-ribbon": MetricRibbon,
  "slot-judgment": SlotJudgment,
  "stop-intervention": StopIntervention,
  "resolve-path": ResolvePath,
  "final-field": FinalField,
};

export const LayoutRouter: FC<{item: Page}> = ({item}) => {
  const Layout = layouts[item.layout];
  if (!Layout) throw new Error(`Unknown layout: ${item.layout}`);
  return <Layout item={item} />;
};
