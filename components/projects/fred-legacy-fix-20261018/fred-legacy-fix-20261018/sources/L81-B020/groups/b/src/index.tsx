// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import React from "react";
import { Composition, registerRoot } from "remotion";
import manifest from "../manifest.json";
import { FredMotion } from "./FredMotion";
function Root() {
  return (
    <>
      {manifest.pages.map((item) => (
        <Composition
          key={item.stableId}
          id={item.stableId}
          component={FredMotion}
          width={item.width}
          height={item.height}
          fps={item.fps}
          durationInFrames={item.durationInFrames}
          defaultProps={{ number: item.number, overrides: {}, withAudio: false }}
        />
      ))}
    </>
  );
}
registerRoot(Root);
