/**
 * Data Structures Domain Tool: Visualizer
 * Visualizes data structures (trees, graphs, etc.)
 */

type ArrayStructure = { type: 'array'; values: unknown[] }
type TreeStructure = { type: 'tree'; value: unknown; children?: TreeStructure[] }
type GraphStructure = { type: 'graph'; nodes: string[]; edges: Array<[string, string]> }

type SupportedStructure = ArrayStructure | TreeStructure | GraphStructure

export type VisualizationMetadata = {
  type: string
  nodes?: number
  edges?: number
  depth?: number
}

export class DataStructuresVisualizer {
  visualize(structure: SupportedStructure): {
    visualization: string
    metadata: VisualizationMetadata
  } {
    switch (structure.type) {
      case 'array':
        return this.visualizeArray(structure)
      case 'tree':
        return this.visualizeTree(structure)
      case 'graph':
        return this.visualizeGraph(structure)
      default:
        return {
          visualization: 'Unsupported structure type.',
          metadata: { type: 'unknown' },
        }
    }
  }

  private visualizeArray(structure: ArrayStructure) {
    return {
      visualization: `[${structure.values.join(', ')}]`,
      metadata: { type: structure.type, nodes: structure.values.length },
    }
  }

  private visualizeTree(structure: TreeStructure) {
    const depth = this.calculateTreeDepth(structure)
    return {
      visualization: `Tree root: ${String(structure.value)}`,
      metadata: { type: structure.type, depth },
    }
  }

  private visualizeGraph(structure: GraphStructure) {
    return {
      visualization: `Graph with ${structure.nodes.length} nodes and ${structure.edges.length} edges`,
      metadata: { type: structure.type, nodes: structure.nodes.length, edges: structure.edges.length },
    }
  }

  private calculateTreeDepth(node: TreeStructure | undefined, depth = 0): number {
    if (!node) return depth
    const childDepths = (node.children ?? []).map(child => this.calculateTreeDepth(child, depth + 1))
    return Math.max(depth, ...childDepths)
  }
}

export default DataStructuresVisualizer
