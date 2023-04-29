import type { TagItem } from "../../routes/tags/types";
import type { Coordinates } from "../map/type.mapState";

export interface CreateTagState {
  showCreateTagModal: boolean;
  name: string;
  description: String;
  coordinates: Coordinates;
}

export interface AllTagsStore {
  allTags: TagItem[];
}
