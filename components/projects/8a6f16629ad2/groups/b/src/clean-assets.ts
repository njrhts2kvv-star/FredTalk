import {staticFile} from "remotion";
import mapping from "../clean-asset-map.json";
export const cleanStaticFile = (path: string): string => {
  const mapped = (mapping as Record<string,string>)[path];
  if (!mapped) throw new Error(`Unmapped source asset: ${path}`);
  return staticFile(mapped);
};
