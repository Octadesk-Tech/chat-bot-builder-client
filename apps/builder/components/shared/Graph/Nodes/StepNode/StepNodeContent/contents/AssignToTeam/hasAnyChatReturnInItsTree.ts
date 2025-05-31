export function hasAnyChatReturnInItsTree(
  typebot: any,
  assignToTeamBlockId: string
): boolean {
  if (!assignToTeamBlockId || !typebot) return false;

  const edgeById = indexEdgesById(typebot.edges ?? []);
  const blockById = indexBlocksById(typebot.blocks ?? []);
  const stepById = indexStepsById(typebot.blocks ?? []);

  const visited = new Set<string>();
  const stack = [assignToTeamBlockId];

  while (stack.length > 0) {
    const currentBlockId = stack.pop()!;
    if (visited.has(currentBlockId)) continue;
    visited.add(currentBlockId);

    const incomingEdges = getIncomingEdges(typebot.edges, currentBlockId);

    for (const edge of incomingEdges) {
      const fromBlockId = edge.from?.blockId;
      const fromStepId = edge.from?.stepId;
      const fromItemId = edge.from?.itemId;

      if (isReturnItem(stepById[fromStepId], fromItemId)) {
        return true;
      }

      if (fromBlockId) {
        pushIfNotVisited(stack, fromBlockId, visited);
        processIndirectItemLinks(stack, blockById[fromBlockId], currentBlockId, edgeById, visited);
      }
    }
  }

  return false;
}

function indexEdgesById(edges: any[]): Record<string, any> {
  return Object.fromEntries(edges.map((e) => [e.id, e]));
}

function indexBlocksById(blocks: any[]): Record<string, any> {
  return Object.fromEntries(blocks.map((b) => [b.id, b]));
}

function indexStepsById(blocks: any[]): Record<string, any> {
  const result: Record<string, any> = {};
  for (const block of blocks) {
    for (const step of block.steps ?? []) {
      result[step.id] = step;
    }
  }
  return result;
}

function getIncomingEdges(edges: any[], targetBlockId: string): any[] {
  return edges.filter((e) => e.to?.blockId === targetBlockId);
}

function isReturnItem(step: any, itemId: string): boolean {
  if (!step || step.type !== "chat-return") return false;
  return (step.items ?? []).some(
    (item: any) =>
      item?.id === itemId && item?.content?.returnType === "IS_RETURN"
  );
}

function pushIfNotVisited(stack: string[], blockId: string, visited: Set<string>) {
  if (!visited.has(blockId)) {
    stack.push(blockId);
  }
}

function processIndirectItemLinks(
  stack: string[],
  fromBlock: any,
  currentBlockId: string,
  edgeById: Record<string, any>,
  visited: Set<string>
) {
  for (const step of fromBlock?.steps ?? []) {
    for (const item of step.items ?? []) {
      const edgeId = item.outgoingEdgeId;
      const linkedEdge = edgeById[edgeId];
      const toBlockId = linkedEdge?.to?.blockId;
      if (toBlockId === currentBlockId && !visited.has(fromBlock.id)) {
        stack.push(fromBlock.id);
      }
    }
  }
}
