export type MockUser = {
  id: string;
  kind: 'profile';
  name: string;
  subtitle: string;
  verified: boolean;
};

export type MockFanSuite = {
  id: string;
  kind: 'fan';
  name: string;
  subtitle: string;
  memberIds: string[];
};

export type MockContact = MockFanSuite | MockUser;

export const MOCK_USERS: MockUser[] = [
  { id: 'user-1', kind: 'profile', name: 'Ethan Shoots', subtitle: '@ethan_shoots', verified: true },
  { id: 'user-2', kind: 'profile', name: 'Alex Rivera', subtitle: '@alex_rivera', verified: true },
  { id: 'user-3', kind: 'profile', name: 'Maya Chen', subtitle: '@maya_chen', verified: true },
  { id: 'user-4', kind: 'profile', name: 'Noah Williams', subtitle: '@noah_w', verified: true },
  { id: 'user-5', kind: 'profile', name: 'Sofia Martin', subtitle: '@sofia_martin', verified: true },
  { id: 'user-6', kind: 'profile', name: 'Leo Brooks', subtitle: '@leo_brooks', verified: false },
  { id: 'user-7', kind: 'profile', name: 'Ava Thompson', subtitle: '@ava_t', verified: true },
  { id: 'user-8', kind: 'profile', name: 'Lucas Moore', subtitle: '@lucas_moore', verified: false },
];

export const MOCK_FAN_SUITES: MockFanSuite[] = [
  { id: 'suite-vip', kind: 'fan', name: 'VIP Fans', subtitle: '3 fans', memberIds: ['user-1', 'user-2', 'user-3'] },
  { id: 'suite-recent', kind: 'fan', name: 'Recent Subscribers', subtitle: '2 fans', memberIds: ['user-4', 'user-5'] },
  { id: 'suite-rebill', kind: 'fan', name: 'Rebill Audience', subtitle: '3 fans', memberIds: ['user-6', 'user-7', 'user-8'] },
];

export const MOCK_CONTACTS: MockContact[] = [...MOCK_FAN_SUITES, ...MOCK_USERS];

export function resolveSelectedUsers(selectedIds: string[]) {
  const userIds = new Set<string>();

  for (const selectedId of selectedIds) {
    const fanSuite = MOCK_FAN_SUITES.find(({ id }) => id === selectedId);
    if (fanSuite) fanSuite.memberIds.forEach((memberId) => userIds.add(memberId));
    else if (MOCK_USERS.some(({ id }) => id === selectedId)) userIds.add(selectedId);
  }

  return MOCK_USERS.filter(({ id }) => userIds.has(id));
}
