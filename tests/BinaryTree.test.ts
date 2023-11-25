import { AdjacencyList } from '../src/AdjacencyList';
import { BinaryTree } from '../src/BinaryTree';

it('should traverse binary tree in-order', () => {
  const binaryTree = BinaryTree.binaryTreeFromAdjacencyList(
    new AdjacencyList()
      .add({ id: 1, data: {} }, [
        { targetNodeId: 2, data: {} },
        { targetNodeId: 3, data: {} },
      ])
      .add({ id: 2, data: {} }, [])
      .add({ id: 3, data: {} }, [])
  );

  expect(binaryTree.rootNode!.id).toBe(1);
  expect(binaryTree.rootNode!.leftNode!.id).toBe(2);
  expect(binaryTree.rootNode!.rightNode!.id).toBe(3);
  expect(
    binaryTree.rootNode!.searchDepthFirstInorder().map((node) => node.id)
  ).toStrictEqual([2, 1, 3]);
});
