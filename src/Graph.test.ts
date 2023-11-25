import { AdjacencyList } from './AdjacencyList';
import { Graph } from './Graph';

function createSimpleTreeAdjacencyList() {
  return new AdjacencyList()
    .add({ id: 1, data: {} }, [
      { targetNodeId: 2, data: {} },
      { targetNodeId: 3, data: {} },
    ])
    .add({ id: 2, data: {} }, [])
    .add({ id: 3, data: {} }, []);
}

describe('Graph', () => {
  it('should build graph from simple graph', () => {
    const graph = Graph.graphFromAdjacencyList(createSimpleTreeAdjacencyList());

    const node1 = graph.findNodeById(1);
    const node2 = graph.findNodeById(2);
    const node3 = graph.findNodeById(3);
    const node4 = graph.findNodeById(4);

    expect(node1!.id).toBe(1);
    expect(node2!.id).toBe(2);
    expect(node3!.id).toBe(3);
    expect(node4).toBeNull();
  });

  it('should create a subgraph', () => {
    const graph = Graph.graphFromAdjacencyList(createSimpleTreeAdjacencyList());

    const subgraph = graph.createSubgraph([1, 2]);

    const subgraphNodeId = subgraph.nodes.map((node) => node.id);
    const node1 = subgraph.findNodeById(1)!;

    expect(subgraphNodeId).toStrictEqual([1, 2]);
    expect(node1.outgoingNodes.length).toBe(1);
  });
});

describe('Node', () => {
  describe('reachableNodes', () => {
    it('should find reachable nodes from root', () => {
      const graph = Graph.graphFromAdjacencyList(
        createSimpleTreeAdjacencyList()
      );

      const node1 = graph.findNodeById(1)!;

      expect(node1.reachableNodes.map((node) => node.id)).toEqual(
        expect.arrayContaining([2, 3])
      );
    });

    it('should not find reachable nodes', () => {
      const graph = Graph.graphFromAdjacencyList(
        createSimpleTreeAdjacencyList()
      );

      const node2 = graph.findNodeById(2)!;

      expect(node2.reachableNodes.length).toBe(0);
    });
  });

  describe('incomingEdges', () => {
    it('should expose edges', () => {
      const graph = Graph.graphFromAdjacencyList(
        createSimpleTreeAdjacencyList()
      );

      const node1 = graph.findNodeById(1)!;
      const node2 = graph.findNodeById(2)!;

      expect(node1.incomingEdges.length).toEqual(0);
      expect(node2.incomingEdges.length).toEqual(1);
    });
  });

  describe('searchDepthFirst', () => {
    it('should return a list of nodes in correct order', () => {
      const graph = Graph.graphFromAdjacencyList(
        new AdjacencyList()
          .add({ id: 1, data: {} }, [
            { targetNodeId: 2, data: {} },
            { targetNodeId: 3, data: {} },
          ])
          .add({ id: 2, data: {} }, [{ targetNodeId: 4, data: {} }])
          .add({ id: 3, data: {} }, [])
          .add({ id: 4, data: {} }, [])
          .add({ id: 5, data: {} }, [])
      );
      const dfsNodeIds = graph
        .findNodeById(1)!
        .searchDepthFirst()
        .map((node) => node.id);

      expect(dfsNodeIds).toStrictEqual([1, 3, 2, 4]);
    });
  });
});
