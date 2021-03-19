import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";

// keys = [{postId: 5, userId: 10}]
// returning [{postId: 5, userId: 10, value: 1}] where "value" is the updoot value.
export const createUpdootLoader = () =>
  //key is an object because to load an updoot, we need to know both the use and the post id.
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.findByIds(keys as any);
      const updootIdsToUpdoot: Record<string, Updoot> = {};
      updoots.forEach((updoot) => {
        updootIdsToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot;
      });

      const updootsObjCorrectOrder = keys.map(
        (key) => updootIdsToUpdoot[`${key.userId}|${key.postId}`]
      );
      return updootsObjCorrectOrder;
    }
  );
