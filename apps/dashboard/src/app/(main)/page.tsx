import {
  AnalyticsOutlined,
  EmojiEventsOutlined,
  InventoryOutlined,
  PaymentsOutlined,
  ShoppingBagOutlined,
} from '@mui/icons-material';
import { Card, CardContent, Typography } from '@mui/material';
import { cookies } from 'next/headers';
import type { PropsWithChildren } from 'react';

import { getClient } from '~/shared/api';
import { PageContentContainer } from '~/shared/ui/page-blocks';
import { YearOverviewChart } from './_ui';

const client = getClient();

export default async function Home() {
  const cookieString = (await cookies()).toString();
  const { body } = await client.analytics.getSummary({
    extraHeaders: { Cookie: cookieString },
  });
  const analytics = body.status === 'success' ? body.data.summary : null;

  return (
    <PageContentContainer>
      <Typography className="mb-10" component="h1" variant="h3">
        Welcome to the dashboard
      </Typography>
      <div className="grid grid-cols-3 gap-3 md:gap-10">
        <Card variant="outlined">
          <CardContent>
            <AnalyticsCardTitle>
              <span className="mr-2 align-middle">
                <ShoppingBagOutlined />
              </span>
              <span>Total orders</span>
            </AnalyticsCardTitle>
            <AnalyticsCardValue>
              {analytics?.totalOrders || 0}
            </AnalyticsCardValue>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <AnalyticsCardTitle>
              <span className="mr-2 align-middle">
                <PaymentsOutlined />
              </span>
              <span>Total revenue</span>
            </AnalyticsCardTitle>
            <AnalyticsCardValue>
              {analytics?.totalRevenue || '$0'}
            </AnalyticsCardValue>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <AnalyticsCardTitle>
              <span className="mr-2 align-middle">
                <PaymentsOutlined />
              </span>
              <span>Average revenue</span>
            </AnalyticsCardTitle>
            <AnalyticsCardValue>
              {analytics?.avgRevenue || '$0'}
            </AnalyticsCardValue>
          </CardContent>
        </Card>
        <Card className="col-span-3 md:col-span-1" variant="outlined">
          <CardContent>
            <AnalyticsCardTitle>
              <span className="mr-2 align-middle">
                <InventoryOutlined />
              </span>
              <span>Products in stock</span>
            </AnalyticsCardTitle>
            <AnalyticsCardValue>
              {analytics?.productsInStock || 0}
            </AnalyticsCardValue>
            <div className="mt-5">
              <AnalyticsCardTitle>
                <span className="mr-2 align-middle">
                  <InventoryOutlined />
                </span>
                <span>Units in stock</span>
              </AnalyticsCardTitle>
              <AnalyticsCardValue>
                {analytics?.unitsInStock || 0}
              </AnalyticsCardValue>
            </div>
          </CardContent>
        </Card>
        <Card
          className="col-span-3 col-start-1 md:col-span-2 md:col-start-2"
          variant="outlined"
        >
          <CardContent>
            <AnalyticsCardTitle>
              <span className="mr-2 align-middle">
                <EmojiEventsOutlined />
              </span>
              <span>Top 3 bestsellers</span>
            </AnalyticsCardTitle>
            <ol className="space-y-2">
              {analytics?.bestSellingProducts.map((p) => (
                <li key={p.name} className="text-3xl">
                  <span>{p.name}</span>{' '}
                  <span className="font-bold">({p.count})</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
        <Card className="col-span-3" variant="outlined">
          <CardContent>
            <AnalyticsCardTitle>
              <span className="mr-2 align-middle">
                <AnalyticsOutlined />
              </span>
              <span>Sales overview</span>
            </AnalyticsCardTitle>
            {analytics?.yearOverview && (
              <YearOverviewChart data={analytics.yearOverview} />
            )}
          </CardContent>
        </Card>
      </div>
    </PageContentContainer>
  );
}

function AnalyticsCardTitle(props: PropsWithChildren) {
  return (
    <Typography
      className="mb-4 leading-[24px]"
      color="textSecondary"
      component="h2"
      variant="h6"
    >
      {props.children}
    </Typography>
  );
}

function AnalyticsCardValue(props: PropsWithChildren) {
  return (
    <p className="text-xl font-extrabold sm:text-4xl md:text-5xl">
      {props.children}
    </p>
  );
}
