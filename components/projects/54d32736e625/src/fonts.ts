import { useEffect, useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";
const ready = Promise.all(
  [
    ["500", "MiSans-Medium.otf"],
    ["700", "MiSans-Semibold.otf"],
  ].map(async ([weight, file]) => {
    const font = new FontFace("MiSans", `url(${staticFile("fonts/" + file)})`, {
      weight,
    });
    await font.load();
    document.fonts.add(font);
  }),
);
export function useFonts() {
  const [handle] = useState(() => delayRender("Mounted Fred MiSans"));
  useEffect(() => {
    ready.then(() => continueRender(handle)).catch(cancelRender);
    return () => continueRender(handle);
  }, [handle]);
}
