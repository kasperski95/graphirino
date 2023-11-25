### @kasperski95/graphirino

Type-safe graph data structures.

## Example

```ts
import { Graph, AdjacencyList } from "@kasperski95/graphirino"

const graph = Graph.graphFromAdjacencyList(
  new AdjacencyList()
    .add({ id: 1, data: {} }, [
      { targetNodeId: 2, data: {} },
      { targetNodeId: 3, data: {} },
    ])
    .add({ id: 2, data: {} }, [{ targetNodeId: 4, data: {} }])
    .add({ id: 3, data: {} }, [])
    .add({ id: 4, data: {} }, [])
    .add({ id: 5, data: {} }, [])
);
const dfsNodeIds = graph
  .findNodeById(1)!
  .searchDepthFirst()
  .map((node) => node.id);

console.log(dfsNodeIds) // [1, 3, 2, 4]
```