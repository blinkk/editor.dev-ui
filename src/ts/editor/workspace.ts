export const SPECIAL_BRANCHES = ['main', 'master', 'staging'];

/**
 * The branch names in the editor are either specific reserved branche names
 * or should be prefixed by `workspace/`.
 *
 * @param branch Short branch name from url.
 */
export function expandWorkspaceBranch(branch: string): string {
  // Special branches are considered workspace branches.
  if (SPECIAL_BRANCHES.includes(branch)) {
    return branch;
  }
  return `workspace/${branch}`;
}

/**
 * Determines which branches should be shown in the editor.
 *
 * @param branch Full branch reference
 * @returns If the branch should be shown in the editor as a workspace.
 */
export function isWorkspaceBranch(branch: string): boolean {
  // Special branches are considered workspace branches.
  if (SPECIAL_BRANCHES.includes(branch)) {
    return true;
  }
  return branch.startsWith('workspace/');
}

/**
 * Shortens down the full branch name to make it more readable.
 *
 * @param branch full branch name
 * @returns shortened version of the branch name
 */
export function shortenWorkspaceName(branch: string) {
  return branch.replace(/^workspace\//, '');
}
