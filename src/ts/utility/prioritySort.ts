/**
 * Sort keys based on priority list of keys. They will always be first and in
 * same order as the priority list.
 *
 * @param priorityKeys List of keys that should be sorted before any other keys.
 */
export function createPriorityKeySort(
  priorityKeys: Array<string>
): (a: string, b: string) => number {
  return (a: string, b: string) => {
    const isAInPriority = priorityKeys.includes(a);
    const isBInPriority = priorityKeys.includes(b);

    if (isAInPriority || isBInPriority) {
      if (isAInPriority && isBInPriority) {
        return priorityKeys.indexOf(a) - priorityKeys.indexOf(b);
      } else if (isAInPriority) {
        return -1;
      }
      return 1;
    }

    if (a < b) {
      return -1;
    }

    if (a > b) {
      return 1;
    }

    return 0;
  };
}
