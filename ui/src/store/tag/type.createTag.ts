import type { Coordinates } from "../map/type.mapState";

export interface CreateTagState {
  showCreateTagModal: boolean;
  name: string;
  description: String;
  coordinates: Coordinates;
}
