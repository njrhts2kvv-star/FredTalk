import {FiveFontFace} from "../five-fonts.ts";
import { useEffect, useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";
const misansReady = Promise.all(
  [
    ["400", "MiSans-Regular.otf"],
    ["500", "MiSans-Medium.otf"],
    ["600", "MiSans-Semibold.otf"],
    ["700", "MiSans-Heavy.otf"],
    ["900", "MiSans-Heavy.otf"],
  ].map(async ([weight, file]) => {
    const font = new FiveFontFace("MiSans", `url(${staticFile("fonts/" + file)})`, {
      weight,
    });
    await font.load();
    document.fonts.add(font);
  }),
);
const displayFont = new FiveFontFace("NanoTik", `url(${staticFile("fonts/NanoTikBazHei-Bold.ttf")})`, {weight: "700"});
const extraFonts = ["RuiZi"].map(async family => {
  const font = new FiveFontFace(family, `url(${staticFile("fonts/" + family + ".ttf")})`, {weight: "700"});
  await font.load(); document.fonts.add(font);
});
const sourceSans = new FiveFontFace("SourceSans3", `url(${staticFile("fonts/MiSans-Heavy.otf")})`, {weight: "900"});
const ready = Promise.all([sourceSans.load().then(font => document.fonts.add(font)),misansReady, ...extraFonts, displayFont.load().then(font => document.fonts.add(font))]);
export function useFonts() {
  const [handle] = useState(() => delayRender("Mounted Fred MiSans"));
  useEffect(() => {
    ready.then(() => continueRender(handle)).catch(cancelRender);
    return () => continueRender(handle);
  }, [handle]);
}
