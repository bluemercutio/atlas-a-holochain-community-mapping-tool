import type { Coordinates } from "../../store/map/type.mapState";
import type { CreateProfileForm } from "../../types/forms/form.createProfile";

import type { CreateTagForm } from "../../types/forms/form.createTag";

export const getFieldsForCreateProfile = (): CreateProfileForm => {
  return {
    user_name: "",
  };
};
