import { Edge, GraphDependencies, Node, NodeFactory } from './Graph';
import { NodeId } from './types';

type RawNodeCore<TData = unknown> = { id: NodeId; data: TData };
type RawEdgeCore<TData = unknown> = { targetNodeId: NodeId; data: TData };
type SourceAndTargetNodeId = `${NodeId}:${NodeId}`;
export class AdjacencyList<TNodeData = unknown, TEdgeData = unknown> {
  private rawNodeCoreById = new Map<NodeId, RawNodeCore<TNodeData>>();
  private rawEdgeCoreBySourceAndTargetNodeId = new Map<
    SourceAndTargetNodeId,
    RawEdgeCore<TEdgeData> & { sourceNodeId: NodeId }
  >();

  public add(
    node: RawNodeCore<TNodeData>,
    outgoingEdges: RawEdgeCore<TEdgeData>[]
  ) {
    this.rawNodeCoreById.set(node.id, node);
    for (const outgoingEdge of outgoingEdges) {
      const rawEdgeCore = {
        data: outgoingEdge.data,
        sourceNodeId: node.id,
        targetNodeId: outgoingEdge.targetNodeId,
      };
      this.rawEdgeCoreBySourceAndTargetNodeId.set(
        `${node.id}:${outgoingEdge.targetNodeId}`,
        rawEdgeCore
      );
    }
    return this;
  }

  public build<TNode extends Node<TNodeData, TEdgeData>>(config: {
    nodeFactory: NodeFactory<TNode, TNodeData, TEdgeData>;
  }): GraphDependencies<TNode, TNodeData, TEdgeData> & {
    outgoingEdgesByNodeId: Map<NodeId, Edge<TNode, TEdgeData>[]>;
  } {
    const nodeById = new Map<NodeId, TNode>();
    const incomingEdgesByNodeId = new Map<NodeId, Edge<TNode>[]>();
    const outgoingEdgesByNodeId = new Map<NodeId, Edge<TNode>[]>();
    this.rawNodeCoreById.forEach((rawNodeCore) => {
      nodeById.set(
        rawNodeCore.id,
        config.nodeFactory({
          rawNode: { ...rawNodeCore, edges: [] },
          nodeById,
          incomingEdgesByNodeId,
        })
      );
    });
    const edges: Edge<TNode, TEdgeData>[] = [];
    this.rawEdgeCoreBySourceAndTargetNodeId.forEach((rawEdgeCore) => {
      const sourceNode = nodeById.get(rawEdgeCore.sourceNodeId)!;
      const targetNode = nodeById.get(rawEdgeCore.targetNodeId)!;
      const rawEdge = {
        sourceNode: nodeById.get(rawEdgeCore.sourceNodeId)!.raw,
        data: rawEdgeCore.data,
        targetNode: nodeById.get(rawEdgeCore.targetNodeId)!.raw,
      };
      sourceNode.raw.edges.push(rawEdge);
      targetNode.raw.edges.push(rawEdge);
      const edge = new Edge(rawEdge, nodeById);
      if (!incomingEdgesByNodeId.has(rawEdgeCore.targetNodeId)) {
        incomingEdgesByNodeId.set(rawEdgeCore.targetNodeId, []);
      }
      incomingEdgesByNodeId.get(rawEdgeCore.targetNodeId)!.push(edge);
      if (!outgoingEdgesByNodeId.has(rawEdgeCore.sourceNodeId)) {
        outgoingEdgesByNodeId.set(rawEdgeCore.sourceNodeId, []);
      }
      outgoingEdgesByNodeId.get(rawEdgeCore.sourceNodeId)!.push(edge);
      edges.push(edge);
    });
    return {
      nodeById,
      incomingEdgesByNodeId,
      outgoingEdgesByNodeId,
      edges,
      nodeFactory: config.nodeFactory,
    };
  }
}
