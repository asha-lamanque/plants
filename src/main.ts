import {
  Circle,
  EmptyElement,
  Line2d,
  Simulation,
  Vector3,
  distance2d,
  frameLoop,
  vector2,
  vector3,
  vertex,
} from "simulationjsv2";
import {
  maxDist,
  maxWaterRadius,
  nutrientsInc,
  waterColor,
  waterTime,
} from "./constants";
import { Plant } from "./plant";
import { PlantGraph } from "./plantGraph";

//Creates canvas
const canvas = new Simulation("canvas");
canvas.fitElement();
canvas.start();

//Adds plants to Canvas
let nodeId = 0;
let plants = createPlants(10);
const graph = new PlantGraph();
setGraph(graph, plants);

let lines = getLines(graph);

const lineGroup = new EmptyElement();
canvas.add(lineGroup);

const plantGroup = new EmptyElement();
canvas.add(plantGroup);

const ripples = new EmptyElement();
canvas.add(ripples);

function setGraph(graph: PlantGraph, plants: Plant[]) {
  graph.clear();

  for (let i = 0; i < plants.length; i++) {
    for (let j = 0; j < plants.length; j++) {
      if (i === j) continue;

      const dist = distance2d(plants[i].getPos(), plants[j].getPos());
      if (dist < maxDist) {
        graph.addConnection(plants[i].getId(), plants[j].getId());
      }
    }
  }
}

function mountLines(lines: Line2d[]) {
  lineGroup.empty();
  lines.forEach((line) => lineGroup.add(line));
}

function mountPlants(plants: Plant[]) {
  plantGroup.empty();
  plants.forEach((plant) => plantGroup.add(plant.getGraphic()));
}

function getPlantFromId(id: number, plants: Plant[]) {
  for (let i = 0; i < plants.length; i++) {
    if (plants[i].getId() === id) return plants[i];
  }

  return null;
}

function getLines(graph: PlantGraph) {
  const lines: Line2d[] = [];

  const keys = graph.getKeys();
  for (let i = 0; i < keys.length; i++) {
    const connections = graph.get(keys[i])!;
    connections.forEach((connection) => {
      const plantFrom = getPlantFromId(keys[i], plants)!;
      const plantTo = getPlantFromId(connection, plants)!;

      const line = new Line2d(
        vertex(...plantFrom.getPos()),
        vertex(...plantTo.getPos())
      );
      lines.push(line);
    });
  }

  return lines;
}

//Creates the plants as circles at range places on the board
function createPlants(numPlants: number) {
  const plants: Plant[] = [];

  for (let i = 0; i < numPlants; i++) {
    const plant = new Plant(canvas.getWidth(), canvas.getHeight(), nodeId);
    plants.push(plant);
    nodeId++;
  }

  return plants;
}

function shiftNutrients() {
  plants.forEach((plant) => {
    const nutrients = plant.getNutrients();
    const res = graph.get(plant.getId());
    if (!res) return;

    const connectionIds = [...res];
    const connections = connectionIds
      .map((id) => getPlantFromId(id, plants)!)
      .filter((plant) => plant.getNutrients() < nutrients)
      .sort((a, b) => a.getNutrients() - b.getNutrients());

    const maxSacrifice = 0.01;
    let sacrifice = maxSacrifice;
    const perPlant = sacrifice / connections.length;

    connections.forEach((plant) => {
      const diff = nutrients - plant.getNutrients();
      const gift = Math.min(diff / 2, perPlant);
      sacrifice -= gift;
      plant.addNutrients(gift);
    });

    plant.removeNutrients(maxSacrifice - sacrifice);
  });
}

let frozen = false;

frameLoop(() => {
  if (frozen) return;

  shiftNutrients();
  plants.forEach((plant) => plant.step());

  plants = plants.filter((plant) => plant.getNutrients() > 0);
  setGraph(graph, plants);
  lines = getLines(graph);

  mountPlants(plants);
  mountLines(lines);
})();

addEventListener("keypress", (e) => {
  if (e.key === " ") frozen = !frozen;
});

canvas.on("click", (e) => {
  const pos = vector3(
    e.offsetX * devicePixelRatio,
    -e.offsetY * devicePixelRatio
  );
  water(pos, plants);

  const waterRipple = new Circle(vector2(0, 0), 0, waterColor.clone());

  waterRipple.moveTo(pos);
  waterRipple.setRadius(0);
  waterRipple.fill(waterColor.clone());

  const newColor = waterColor.clone();
  newColor.a = 0;
  waterRipple.setRadius(maxWaterRadius, waterTime);
  waterRipple.fill(newColor, waterTime);

  ripples.add(waterRipple);
  setTimeout(() => {
    ripples.remove(waterRipple);
  }, waterTime * 1000);
});

function water(pos: Vector3, plants: Plant[]) {
  for (let i = 0; i < plants.length; i++) {
    let dist = distance2d(plants[i].getPos(), pos);
    if (dist < maxWaterRadius) {
      const toAdd =
        dist === 0
          ? nutrientsInc
          : nutrientsInc * Math.max(0, 1 - dist / maxWaterRadius);
      plants[i].addNutrients(toAdd);
    }
  }
}
