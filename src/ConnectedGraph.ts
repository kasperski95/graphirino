import { NodeId } from './types';
import { Graph, Node, NodeFromGraph } from './Graph';
import { AdjacencyList } from './AdjacencyList';

export class ConnectedGraph<TNode extends Node> extends Graph<TNode> {
  static connectedGraphFromAdjacencyList<TNodeData, TEdgeData>(
    adjacencyList: AdjacencyList<TNodeData, TEdgeData>
  ) {
    const deps = adjacencyList.build<Node<TNodeData, TEdgeData>>({
      nodeFactory: (deps) => new Node(deps),
    });
    return new ConnectedGraph(deps);
  }

  static connectedGraphsFromGraph<TGraph extends Graph<Node>>(
    graph: TGraph
  ): ConnectedGraph<NodeFromGraph<TGraph>>[] {
    const visitedNodeIds = new Set<NodeId>();
    const subgraphs: Graph<NodeFromGraph<TGraph>>[] = [];
    for (const node of graph.nodes) {
      if (visitedNodeIds.has(node.id)) {
        continue;
      }
      const dfsNodes = node.searchDepthFirst();
      for (const dfsNode of dfsNodes) {
        visitedNodeIds.add(dfsNode.id);
      }
      const dfsNodeIds = dfsNodes.map((dfsNode) => dfsNode.id);
      subgraphs.push(graph.createSubgraph(dfsNodeIds));
    }
    return subgraphs.map((subgraph) => {
      return ConnectedGraph.connectedGraphFromGraph(subgraph);
    });
  }

  static connectedGraphFromGraph<TNodeData, TEdgeData>(
    graph: Graph<Node<TNodeData, TEdgeData>>
  ): ConnectedGraph<Node<TNodeData, TEdgeData>> {
    const nodeById = graph.nodes.reduce((acc, node) => {
      acc.set(node.id, node);
      return acc;
    }, new Map<NodeId, Node<TNodeData, TEdgeData>>());
    return new ConnectedGraph({
      nodeById,
      edges: graph.edges,
      nodeFactory: graph._.nodeFactory,
      incomingEdgesByNodeId: graph._.incomingEdgesByNodeId,
    });
  }
}
