import type { Coordinates } from "../../store/map/type.mapState";

import type { CreateTagForm } from "../../types/forms/form.createTag";

export const getFieldsForCreateTag = (
  latitude: number,
  longitude: number
): CreateTagForm => {
  return {
    name: {
      label: "Name",
      value: "",
      required: true,
    },
    description: {
      label: "Description",
      value: "",
      required: true,
    },
    latitude: {
      label: "Latitude",
      value: latitude.toString(),
      required: true,
    },
    longitude: {
      label: "Longitude",
      value: longitude.toString(),
      required: true,
    },
  };
};
