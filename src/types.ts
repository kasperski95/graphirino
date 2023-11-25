export type NodeId = number | string;

export type RawNode<TNodeData = unknown, TEdgeData = unknown> = {
  id: NodeId;
  data: TNodeData;
  edges: RawEdge<TNodeData, TEdgeData>[];
};

export type RawEdge<TNodeData = unknown, TEdgeData = unknown> = {
  sourceNode: RawNode<TNodeData, TEdgeData>;
  targetNode: RawNode<TNodeData, TEdgeData>;
  data: TEdgeData;
};

export type RawGraph<TNodeData, TEdgeData> = {
  nodes: RawNode<TNodeData, TEdgeData>[];
  edges: RawEdge<TNodeData, TEdgeData>[];
};
