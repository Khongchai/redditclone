import DataLoader from "dataloader";
import { User } from "../entities/User";

// keys = [{postId: 5, userId: 10}]
//
// returning [{}]
//batches together multiple requests into one fucntion call
export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, number | null>(
    async (userIds) => {
      const users = await User.findByIds(userIds as number[]);

      const userAndIdMap: Record<number, User> = {};
      users.forEach((user) => (userAndIdMap[user.id] = user));

      const userWithCorrectOrder = userIds.map((id) => userAndIdMap[id]);

      return userWithCorrectOrder;
    }
  );
