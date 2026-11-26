import { boxes } from "./boxes";
import { rotatingTriangles } from "./rotating-triangles";
import { sineWave } from "./sine-wave";
import { solidTriangles } from "./solid-triangles";
import type { DrawingDefinition, DrawingName } from "./types";

export type { DrawingDefinition, DrawingName } from "./types";

export const drawings: Record<DrawingName, DrawingDefinition> = {
  "sine-wave": sineWave,
  "rotating-boxes": boxes,
  "solid-triangles": solidTriangles,
  "rotating-triangles": rotatingTriangles,
};

export const drawingNames = Object.keys(drawings) as DrawingName[];
