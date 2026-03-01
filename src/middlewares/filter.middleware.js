export const filter = (req, res, next) => {
  const queryObj = { ...req.query };
  const excludeFields = ["page", "sort", "limit", "fields"]; //exclude the pagination and sort query fields
  excludeFields.forEach((field) => delete queryObj[field]);
  //   ==============================================================
  //   handle a dynamic range filter like price age or any ranged fields
  Object.keys(queryObj).forEach((key) => {
    // check if the query param has a range filter
    if (key.includes("min") || key.includes("max")) {
      const operator = key.includes("min") ? "gte" : "lte";
      const filterBy = key.replace("min", "").replace("max", "").toLowerCase(); //extract the range filter field name
      queryObj[filterBy] = queryObj[filterBy] || {};
      queryObj[filterBy][`$${operator}`] = queryObj[key];
      delete queryObj[key];
    } else if (!Number.isNaN(+queryObj[key])) {
      queryObj[key] = { $eq: +queryObj[key] };
    } else {
      queryObj[key] = { $regex: queryObj[key], $options: "i" }; // make the filter case insensitive
    }
  });
  //   ================================================
  req.filter = queryObj;
  next();
};
