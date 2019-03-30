import * as Constant from "./Constant";

export const redirect = url => {
  window.location.assign(url);
};

export const imageUrl = imageId => {
  return Constant.BASE_URL + "api/files/getimage/" + imageId;
};

export const getProgress = (first, last) => {
  var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  var firstDate = new Date(first);
  var secondDate = new Date(last);

  var daysTotal = Math.round(
    Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay)
  );

  var daysPassed = Math.round((firstDate.getTime() - new Date()) / oneDay);
  if (daysPassed > 0) {
    daysPassed = 0;
  }
  var res = Math.ceil((Math.abs(daysPassed) / daysTotal) * 100);
  return res;
};
