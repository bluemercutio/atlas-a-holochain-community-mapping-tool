import type { Profile, UpdateProfile } from "../../routes/profiles/types";
import type { TagItem, UpdateTagItem } from "../../routes/tags/types";

export type ZomeDetailTypes = TagItem | Profile;

export type ZomeListTypes = TagItem[] | Profile[];
export type UpdateZomeDetailType = UpdateTagItem | UpdateProfile;
