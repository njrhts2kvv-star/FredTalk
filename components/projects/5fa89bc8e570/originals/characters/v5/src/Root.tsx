import type {FC} from "react";
import {Composition, Folder} from "remotion";
import manifest from "../docs/production.manifest.json";
import {Scene} from "./Scene";
import type {Page} from "./types";

const pages = manifest.pages as unknown as Page[];

export const Root: FC = () => <Folder name="Fred-Character-Approved-Modules-V3">
  {pages.map((item) => <Composition key={item.stableId} id={item.compositionId} component={Scene} defaultProps={{item}} width={1920} height={1080} fps={30} durationInFrames={item.durationInFrames} />)}
</Folder>;
