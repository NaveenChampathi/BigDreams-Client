export const numberWithCommas = (x) => {
  return x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "-";
};

export const getDateYYYYMMDD = (x) => x.toISOString().substring(0, 10);
