import { ConnectedGraph } from './ConnectedGraph';
import { Graph } from './Graph';
import { AdjacencyList } from './AdjacencyList';

it('should create multiple connected graphs from graph', () => {
  const graph = Graph.graphFromAdjacencyList(
    new AdjacencyList()
      .add({ id: 1, data: {} }, [
        { targetNodeId: 2, data: [] },
        { targetNodeId: 3, data: [] },
      ])
      .add({ id: 2, data: {} }, [])
      .add({ id: 3, data: [] }, [])
      .add({ id: 4, data: [] }, [])
  );

  const connectedGraphs = ConnectedGraph.connectedGraphsFromGraph(graph);

  expect(connectedGraphs.length).toBe(2);
});
