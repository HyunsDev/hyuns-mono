import type { OffsetPaginationMeta, OffsetPaginationQuery } from './offset-pagination.schema';

export const convertOffsetPaginationMetaToTakeSkip = (meta: OffsetPaginationMeta) => {
  const { page, limit } = meta;

  return {
    skip: (page - 1) * limit,
    take: limit,
  };
};

export const createOffsetPaginatedResult = <T>(props: {
  items: T[];
  totalItems: number;
  query: OffsetPaginationQuery;
}) => {
  const { items, totalItems, query } = props;
  const { page, limit } = query;

  const totalPage = Math.ceil(totalItems / limit);
  const hasNext = page < totalPage;
  const hasPrevious = page > 1;

  return {
    items,
    meta: {
      page,
      limit,
      total: totalItems,
      totalPage,
      hasNext,
      hasPrevious,
    },
  };
};
