import React from "react";
import { Composition, registerRoot } from "remotion";
import manifest from "../manifest.json";
import { FredMotion } from "./FredMotion";
function Root() {
  return (
    <>
      {manifest.pages.filter((item) => item.number === 36).map((item) => (
        <Composition
          key={item.stableId}
          id={item.stableId}
          component={FredMotion}
          width={item.width}
          height={item.height}
          fps={60}
          durationInFrames={360}
          defaultProps={{ number: item.number, overrides: {}, withAudio: false }}
        />
      ))}
    </>
  );
}
registerRoot(Root);
