const getPaginationLinks = (params) => {
  const { uri, page, totalPages, limit } = params;
  return {
    self: `${uri}?page=${page}&limit=${limit}`,
    first: `${uri}?page=${1}&limit=${limit}`,
    last: `${uri}?page=${totalPages}&limit=${limit}`,
    previous: page !== 1 ? `${uri}?page=${page - 1}&limit=${limit}` : null,
    next: page < totalPages ? `${uri}?page=${page + 1}&limit=${limit}` : null,
  };
};

module.exports = { getPaginationLinks };
