import { AllTagsStore } from ".";
import type { TagItem } from "../../routes/tags/types";

export const addTag = (tag: TagItem) => {
  AllTagsStore.update((state) => ({
    ...state,
    allTags: [...state, tag],
  }));
};
