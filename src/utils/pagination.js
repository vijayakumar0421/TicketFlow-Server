const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const getPagination = (
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT
) => {
  const currentPage = Math.max(
    parseInt(page, 10) || DEFAULT_PAGE,
    DEFAULT_PAGE
  );

  const currentLimit = Math.min(
    Math.max(
      parseInt(limit, 10) || DEFAULT_LIMIT,
      1
    ),
    MAX_LIMIT
  );

  return {
    page: currentPage,
    limit: currentLimit,
    skip: (currentPage - 1) * currentLimit,
  };
};

module.exports = {
  getPagination,
};