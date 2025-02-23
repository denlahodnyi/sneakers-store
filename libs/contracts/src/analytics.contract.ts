import { initContract } from '@ts-rest/core';
import type { ErrorResponseData, SuccessResponseData } from './dto/misc.js';
import type { AnalyticsSummaryResponseDto } from './dto/analytics.dto.js';

const c = initContract();
const pathname = '/analytics';

const analyticsContract = c.router({
  getSummary: {
    method: 'GET',
    path: pathname,
    summary: 'Get analytics summary',
    responses: {
      200: c.type<
        SuccessResponseData<{ summary: AnalyticsSummaryResponseDto }>
      >(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
    },
  },
});

export { analyticsContract };
