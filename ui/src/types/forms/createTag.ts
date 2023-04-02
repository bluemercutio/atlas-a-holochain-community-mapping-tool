import type { Coordinates } from "../../store/map/type.mapState";
import type { FormEntry } from "./formEntry";

export interface CreateTagForm {
  name: FormEntry;
  description: FormEntry;
  latitude: FormEntry;
  longitude: FormEntry;
}
