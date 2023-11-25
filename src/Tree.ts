import { ConnectedGraph } from './ConnectedGraph';
import { GraphDependencies, Node, NodeDependencies } from './Graph';
import { GraphirinoError } from './GraphirinoError';
import { NodeId } from './types';
import { AdjacencyList } from './AdjacencyList';

export class Tree<
  TTreeNode extends TreeNode
> extends ConnectedGraph<TTreeNode> {
  static treeFromAdjacencyList<TNodeData, TEdgeData>(
    adjacencyList: AdjacencyList<TNodeData, TEdgeData>
  ): Tree<TreeNode<TNodeData, TEdgeData>> {
    const deps = adjacencyList.build<TreeNode<TNodeData, TEdgeData>>({
      nodeFactory: (deps) => new TreeNode(deps),
    });
    return new Tree(deps);
  }

  protected constructor(dependencies: GraphDependencies<TTreeNode>) {
    super(dependencies);
  }

  public get rootNode(): TTreeNode | null {
    if (this.nodes.length === 0) {
      return null;
    }
    return this.nodes[0];
  }
}

export class TreeNode<TNodeData = unknown, TEdgeData = unknown> extends Node<
  TNodeData,
  TEdgeData
> {
  constructor(
    deps: NodeDependencies<TreeNode<TNodeData, TEdgeData>, TNodeData, TEdgeData>
  ) {
    super(deps);
  }

  get depth(): number {
    return this.ancestorNodes.length;
  }

  get ancestorNodes(): this[] {
    const ancestorNodes: this[] = [];
    let currentNode: this | null = this;
    while (currentNode?.parentNode) {
      currentNode = currentNode.parentNode;
      if (currentNode !== null) {
        ancestorNodes.push(currentNode);
      }
    }
    return ancestorNodes;
  }

  get parentNode(): this | null {
    if (this.incomingNodes.length === 0) {
      return null;
    }
    if (this.incomingNodes.length > 1) {
      throw new GraphirinoError('TreeNode cannot have multiple parents');
    }
    return this.findNodeById(this.incomingNodes[0].id)!;
  }
}

export function findRootFromNode(node: Node): Node | null {
  const visitedNodeIds = new Set<NodeId>();
  while (node.incomingNodes.length <= 1) {
    if (node.incomingNodes.length === 0) {
      return node;
    } else {
      node = node.incomingNodes[0];
      if (visitedNodeIds.has(node.id)) {
        return null;
      }
      visitedNodeIds.add(node.id);
    }
  }
  return null;
}
