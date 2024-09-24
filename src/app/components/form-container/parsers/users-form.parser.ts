export interface Users {
  items: Array<UserGroup>
}

interface UserGroup {
  group: User;
}

export interface User {
  country: string;
  username: string;
  birthday: string;
}

export function parseFromModelToDto(model: Users): Array<User> {
  return model.items.map((item: { group: any; }) => item.group);
}
