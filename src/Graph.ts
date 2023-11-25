import { GraphirinoError } from './GraphirinoError';
import { NodeId, RawNode, RawEdge } from './types';
import { AdjacencyList } from './AdjacencyList';

export type GraphDependencies<
  TNode extends Node<TNodeData, TEdgeData>,
  TNodeData = TNode['data'],
  TEdgeData = TNode['raw']['edges'][number]['data']
> = {
  nodeById: Map<NodeId, TNode>;
  edges: Edge<TNode, TEdgeData>[];
  nodeFactory: NodeFactory<TNode, TNodeData, TEdgeData>;
  incomingEdgesByNodeId: Map<NodeId, Edge<TNode, TEdgeData, TNodeData>[]>;
};

export type NodeFactory<
  TNode extends Node<TNodeData, TEdgeData>,
  TNodeData = unknown,
  TEdgeData = unknown
> = (nodeDependencies: NodeDependencies<TNode, TNodeData, TEdgeData>) => TNode;

export type NodeFromGraph<TGraph extends Graph<Node>> = TGraph['nodes'][number];

export class Graph<
  TNode extends Node<TNodeData, TEdgeData>,
  TNodeData = TNode['data'],
  TEdgeData = TNode['raw']['edges'][number]['data']
> {
  public static graphFromAdjacencyList<TNodeData, TEdgeData>(
    adjacencyList: AdjacencyList<TNodeData, TEdgeData>
  ) {
    const graphDependencies = adjacencyList.build<Node<TNodeData, TEdgeData>>({
      nodeFactory: (deps) => new Node<TNodeData, TEdgeData>(deps),
    });
    return new Graph(graphDependencies);
  }

  private nodeById: Map<NodeId, TNode>;
  private edges_: Edge<TNode, TEdgeData>[];
  private nodeFactory: NodeFactory<TNode, TNodeData, TEdgeData>;
  private incomingEdgesByNodeId: Map<NodeId, Edge<TNode, TEdgeData>[]>;

  protected constructor(
    dependencies: GraphDependencies<TNode, TNodeData, TEdgeData>
  ) {
    this.nodeById = dependencies.nodeById;
    this.edges_ = dependencies.edges;
    this.nodeFactory = dependencies.nodeFactory;
    this.incomingEdgesByNodeId = dependencies.incomingEdgesByNodeId;
  }

  public get _() {
    return {
      nodeFactory: this.nodeFactory,
      incomingEdgesByNodeId: this.incomingEdgesByNodeId,
    };
  }

  public findNodeById(nodeId: NodeId): TNode | null {
    return this.nodeById.get(nodeId) ?? null;
  }

  public get nodes(): TNode[] {
    return Array.from(this.nodeById.values());
  }

  public get edges(): Edge<TNode, TEdgeData>[] {
    return this.edges_;
  }

  public createSubgraph(nodeIds: NodeId[]): Graph<TNode, TNodeData, TEdgeData> {
    const selectedNodeById = this.nodes
      .filter((node) => nodeIds.includes(node.id))
      .reduce((acc, node) => {
        acc.set(
          node.id,
          this.nodeFactory({
            rawNode: { ...node.raw, edges: [] },
            nodeById: acc,
            incomingEdgesByNodeId: this.incomingEdgesByNodeId,
          })
        );
        return acc;
      }, new Map<NodeId, TNode>());
    const selectedEdges = this.edges
      .filter(
        (edge) =>
          nodeIds.includes(edge.sourceNode.id) &&
          nodeIds.includes(edge.targetNode.id)
      )
      .map((edge) => {
        return new Edge(
          {
            data: edge.data,
            sourceNode: selectedNodeById.get(edge.sourceNode.id)!.raw,
            targetNode: selectedNodeById.get(edge.targetNode.id)!.raw,
          },
          selectedNodeById
        );
      });
    for (const selectedEdge of selectedEdges) {
      selectedNodeById
        .get(selectedEdge.sourceNode.id)!
        .raw.edges.push(selectedEdge.raw);
      const targetNodeRawEdges = selectedNodeById.get(
        selectedEdge.targetNode.id
      )!.raw.edges;
      if (!targetNodeRawEdges.includes(selectedEdge.raw)) {
        targetNodeRawEdges.push(selectedEdge.raw);
      }
    }
    return new Graph({
      nodeById: selectedNodeById,
      edges: selectedEdges,
      nodeFactory: this.nodeFactory,
      incomingEdgesByNodeId: this.incomingEdgesByNodeId,
    });
  }
}

export type NodeDependencies<
  TNodeType extends Node<TNodeData, TEdgeData>,
  TNodeData = unknown,
  TEdgeData = unknown
> = {
  rawNode: RawNode<TNodeData, TEdgeData>;
  nodeById: Map<NodeId, TNodeType>;
  incomingEdgesByNodeId: Map<NodeId, Edge<TNodeType, TEdgeData>[]>;
};
export class Node<TNodeData = unknown, TEdgeData = unknown> {
  private rawNode: RawNode<TNodeData, TEdgeData>;
  private nodeById: Map<NodeId, Node<TNodeData>>;
  private incomingEdgesByNodeId: Map<
    NodeId,
    Edge<Node<TNodeData, TEdgeData>, TEdgeData>[]
  >;

  public constructor(
    deps: NodeDependencies<Node<TNodeData, TEdgeData>, TNodeData, TEdgeData>
  ) {
    this.rawNode = deps.rawNode;
    this.nodeById = deps.nodeById;
    this.incomingEdgesByNodeId = deps.incomingEdgesByNodeId;
  }

  protected findNodeById(id: NodeId): this {
    return this.nodeById.get(id)! as any as this;
  }

  protected findIncomingEdgesByNodeId(nodeId: NodeId): Edge<this>[] {
    return (this.incomingEdgesByNodeId.get(nodeId) ?? []) as Edge<this>[];
  }

  public get raw(): RawNode<TNodeData, TEdgeData> {
    return this.rawNode;
  }

  public get id() {
    return this.rawNode.id;
  }

  public get data(): TNodeData {
    return this.rawNode.data;
  }

  public get incomingEdges(): Edge<this>[] {
    return this.findIncomingEdgesByNodeId(this.id);
  }

  public get incomingNodes(): this[] {
    return this.rawNode.edges
      .filter((edge) => edge.targetNode.id === this.rawNode.id)
      .map((edge) => this.findNodeById(edge.sourceNode.id)!);
  }

  public get outgoingNodes(): this[] {
    return this.rawNode.edges
      .filter((edge) => edge.sourceNode.id === this.rawNode.id)
      .map((edge) => this.findNodeById(edge.targetNode.id)!);
  }

  public get reachableNodes(): this[] {
    const visitedNodes = new Set<this>();
    const nodesToVisit = this.outgoingNodes;
    while (nodesToVisit.length > 0) {
      const node = nodesToVisit.pop()!;
      for (const outgoingNode of node.outgoingNodes) {
        if (
          !nodesToVisit.includes(outgoingNode) &&
          !visitedNodes.has(outgoingNode)
        ) {
          nodesToVisit.push(outgoingNode);
        }
      }
      visitedNodes.add(node);
    }
    return Array.from(visitedNodes);
  }

  public searchDepthFirst(): this[] {
    const nodesToVisit: this[] = [];
    const visitedNodes = new Set<this>();
    nodesToVisit.push(this);
    while (nodesToVisit.length > 0) {
      const currentNode = nodesToVisit.pop();
      if (currentNode && !visitedNodes.has(currentNode)) {
        visitedNodes.add(currentNode);
        for (const outgoingNode of currentNode.outgoingNodes) {
          if (!visitedNodes.has(outgoingNode)) {
            nodesToVisit.push(outgoingNode);
          }
        }
      }
    }
    return Array.from(visitedNodes);
  }
}

export class Edge<
  TNode extends Node<TNodeData, TEdgeData>,
  TEdgeData = TNode['raw']['edges'][number]['data'],
  TNodeData = TNode['data']
> {
  constructor(
    private edge: RawEdge<TNodeData, TEdgeData>,
    private nodeById: Map<NodeId, TNode>
  ) {}

  public get raw(): RawEdge<TNodeData, TEdgeData> {
    return this.edge;
  }

  public get data(): TEdgeData {
    return this.edge.data;
  }

  public get sourceNode(): TNode {
    const sourceNode = this.nodeById.get(this.edge.sourceNode.id);
    if (!sourceNode) {
      throw new GraphirinoError("Unexpected error. Couldn't find sourceNode.");
    }
    return sourceNode;
  }

  public get targetNode(): TNode {
    const targetNode = this.nodeById.get(this.edge.targetNode.id);
    if (!targetNode) {
      throw new GraphirinoError("Unexpected error. Couldn't find targetNode.");
    }
    return targetNode;
  }
}
