import * as Constant from "./Constant";

export const redirect = url => {
  window.location.assign(url);
};

export const imageUrl = imageId => {
  return Constant.BASE_URL + "api/files/getimage/" + imageId;
};
