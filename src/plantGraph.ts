import { Plant } from "./plant";

export class PlantGraph {
  private nodes: Map<number, Set<number>>;

  constructor() {
    this.nodes = new Map([]);
  }

  private addMonoConnection(from: number, to: number) {
    const connections = this.nodes.get(from);

    if (!connections) {
      this.nodes.set(from, new Set([to]));
      return;
    }

    connections.add(to);
  }

  addConnection(from: number, to: number) {
    this.addMonoConnection(from, to);
    this.addMonoConnection(to, from);
  }

  removeNode(id: number) {
    this.nodes.delete(id);

    const keys = this.nodes.keys();
    for (const key of keys) {
      this.nodes.get(key)!.delete(key);
    }
  }

  clear() {
    this.nodes.clear();
  }

  getKeys() {
    return [...this.nodes.keys()];
  }

  get(id: number) {
    return this.nodes.get(id);
  }
}

/*
this. = map...() => {
  
}
*/
