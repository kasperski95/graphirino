import { AdjacencyList } from '../src/AdjacencyList';
import { ConnectedGraph } from '../src/ConnectedGraph';
import { findRootFromNode, Tree } from '../src/Tree';

it('should find root node', () => {
  const connectedGraph = ConnectedGraph.connectedGraphFromAdjacencyList(
    new AdjacencyList()
      .add({ id: 1, data: {} }, [
        { targetNodeId: 2, data: {} },
        { targetNodeId: 3, data: {} },
      ])
      .add({ id: 2, data: {} }, [])
      .add({ id: 3, data: {} }, [])
  );

  const node = connectedGraph.findNodeById(2)!;

  expect(findRootFromNode(node)!.id).toBe(1);
});

describe('TreeNodeWrapper', () => {
  describe('depth', () => {
    it('should return depth correctly for basic tree', () => {
      const tree = Tree.treeFromAdjacencyList(
        new AdjacencyList()
          .add({ id: 1, data: {} }, [
            { targetNodeId: 2, data: {} },
            { targetNodeId: 3, data: {} },
          ])
          .add({ id: 2, data: {} }, [])
          .add({ id: 3, data: {} }, [])
      );

      const node1 = tree.findNodeById(1)!;
      const node2 = tree.findNodeById(2)!;

      expect(node1.depth).toBe(0);
      expect(node2.depth).toBe(1);
    });
  });
});
