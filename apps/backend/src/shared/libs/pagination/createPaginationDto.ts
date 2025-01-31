import type { PaginationDto } from '@sneakers-store/contracts';

const createPaginationDto = ({
  total,
  page,
  perPage,
}: {
  total: number;
  page: number;
  perPage: number;
}): PaginationDto => {
  const totalPages = Math.ceil(total / perPage);
  return {
    totalItems: total,
    totalPages,
    perPage, // TODO: should be "All" if -1?
    current: page,
    next: page < totalPages ? page + 1 : null,
    prev: page > 1 ? page - 1 : null,
  };
};

export default createPaginationDto;
