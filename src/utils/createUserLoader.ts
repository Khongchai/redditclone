import DataLoader from "dataloader";
import { User } from "../entities/User";

// keys = users' id [1, 78, 8, 9]
// returning a map [{id: 1, username: 'tim'}, {}, {}, {}]
//batches together multiple requests into one fucntion call
export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);

    const userAndIdMap: Record<number, User> = {};
    users.forEach((user) => (userAndIdMap[user.id] = user));

    const userWithCorrectOrder = userIds.map((id) => userAndIdMap[id]);

    return userWithCorrectOrder;
  });
