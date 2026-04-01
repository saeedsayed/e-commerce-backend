export const paginate = (model) => async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { filter } = req;
    const totalDocuments = await model.countDocuments(
      typeof filter === "object" && filter,
    );
    console.log("totalDocuments", totalDocuments);
    let pageNumber = parseInt(page) || 1;
    console.log("pageNumber", pageNumber);
    const limitNumber = parseInt(limit) || 10;
    let skip = (pageNumber - 1) * limitNumber;
    const totalPages = Math.ceil(totalDocuments / limitNumber);
    if (skip >= totalDocuments) {
      pageNumber = totalPages || 1;
      skip = (pageNumber - 1) * limitNumber;
    }
    req.pagination = {
      limit: limitNumber,
      skip,
      totalPages,
      currentPage: pageNumber,
      nextPage: pageNumber + 1 > totalPages ? 1 : pageNumber + 1,
      previousPage: pageNumber - 1 < 1 ? totalPages : pageNumber - 1,
      totalDocuments,
    };
    next();
  } catch (error) {
    next(error);
  }
};
