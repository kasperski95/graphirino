import { AdjacencyList } from './AdjacencyList';
import { Node } from './Graph';

it('should return node and edge mappings', () => {
  const adjacencyList = new AdjacencyList<
    { backgroundColor?: string },
    { label?: string }
  >();

  const { nodeById, incomingEdgesByNodeId, outgoingEdgesByNodeId } =
    adjacencyList
      .add({ id: 1, data: { backgroundColor: 'red' } }, [
        { targetNodeId: 2, data: { label: 'edgeLabel' } },
        { targetNodeId: 3, data: {} },
      ])
      .add({ id: 2, data: {} }, [])
      .add({ id: 3, data: {} }, [])
      .build<Node<{ backgroundColor?: string }, { label?: string }>>({
        nodeFactory: (deps) => {
          return new Node(deps);
        },
      });

  expect(nodeById.get(1)!.data.backgroundColor).toBe('red');
  expect(nodeById.get(2)!.id).toBe(2);
  expect(incomingEdgesByNodeId.get(2)![0].data.label).toBe('edgeLabel');
  expect(outgoingEdgesByNodeId.get(1)!.length).toBe(2);
});
