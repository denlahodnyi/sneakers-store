'use client';
import type { Contract } from '@sneakers-store/contracts';
import type { ClientInferResponseBody } from '@ts-rest/core';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

type Data = ClientInferResponseBody<
  Contract['analytics']['getSummary'],
  200
>['data']['summary']['yearOverview'];

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function YearOverview({ data }: { data: Data }) {
  const monthRevenueMap = data.reduce<Map<string, Data[number]>>(
    (prev, cur) => {
      const [, month] = cur.yearMonth.split(' ');
      prev.set(month, cur);
      return prev;
    },
    new Map(),
  );
  const chartItems = months.map((m) => {
    return {
      name: m.slice(0, 3),
      total: monthRevenueMap.get(m)?.revenue || 0,
    };
  });

  return (
    <ResponsiveContainer height={250} width="100%">
      <BarChart data={chartItems} height={250} width={730}>
        <XAxis dataKey="name" />
        <Tooltip />
        <Bar className="fill-main" dataKey="total" />
      </BarChart>
    </ResponsiveContainer>
  );
}
