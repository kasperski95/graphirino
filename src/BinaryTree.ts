import { AdjacencyList } from './AdjacencyList';
import { NodeDependencies } from './Graph';
import { Tree, TreeNode } from './Tree';

export class BinaryTree<
  TBinaryTreeNode extends BinaryTreeNode
> extends Tree<TBinaryTreeNode> {
  static binaryTreeFromAdjacencyList<TNodeData, TEdgeData>(
    adjacencyList: AdjacencyList<TNodeData, TEdgeData>
  ): BinaryTree<BinaryTreeNode<TNodeData, TEdgeData>> {
    const deps = adjacencyList.build<BinaryTreeNode<TNodeData, TEdgeData>>({
      nodeFactory: (deps) => new BinaryTreeNode(deps),
    });
    return new BinaryTree(deps);
  }
}

export class BinaryTreeNode<
  TNodeData = unknown,
  TEdgeData = unknown
> extends TreeNode<TNodeData, TEdgeData> {
  constructor(
    deps: NodeDependencies<
      BinaryTreeNode<TNodeData, TEdgeData>,
      TNodeData,
      TEdgeData
    >
  ) {
    super(deps);
  }

  public get leftNode(): this | null {
    if (this.outgoingNodes.length === 0) {
      return null;
    }
    return this.outgoingNodes[0];
  }

  public get rightNode(): this | null {
    if (this.outgoingNodes.length < 2) {
      return null;
    }
    return this.outgoingNodes[1];
  }

  public searchDepthFirstInorder(): this[] {
    const result = [];
    const nodesToVisit: this[] = [];
    let currentNode: this | null = this;
    while (currentNode || nodesToVisit.length > 0) {
      while (currentNode) {
        nodesToVisit.push(currentNode);
        currentNode = currentNode.leftNode;
      }
      currentNode = nodesToVisit.pop()!;
      result.push(currentNode);
      currentNode = currentNode.rightNode;
    }
    return result;
  }
}
