export const VIP_GROUPS = Array.from({ length: 42 }, (_, i) => ({
  groupId: i + 1,
  password: `SS26-${i + 1}`,
}));

export function getGroupPassword(groupId: number): string | null {
  const group = VIP_GROUPS.find(g => g.groupId === groupId);
  return group ? group.password : null;
}

export function isValidGroup(groupId: number): boolean {
  return VIP_GROUPS.some(g => g.groupId === groupId);
}
