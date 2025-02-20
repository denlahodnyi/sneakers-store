import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
} from '@mui/material';

import {
  // CreateRecordLink,
  PageContentContainer,
  // PageHeaderActionsContainer,
  PageHeaderContainer,
  PageTitle,
  TableDeleteRecordButton,
  // TableEditRecordLink,
  TableHeaderSelectAllCell,
  TableProvider,
  TableRecordsPagination,
  TableSelectCell,
  TableToolbar,
  TableViewRecordLink,
} from '~/shared/ui/page-blocks';
import {
  bulkDeleteOrder,
  deleteOrder,
  getOrders,
} from './_api/orders.server-fn';

async function OrdersPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { page, perPage } = await props.searchParams;
  const { orders, pagination } = await getOrders({
    page: page ? Number(page) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
  });

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Orders</PageTitle>
        {/* <PageHeaderActionsContainer>
          <CreateRecordLink href="/orders/new" />
        </PageHeaderActionsContainer> */}
      </PageHeaderContainer>

      <TableProvider rows={orders}>
        <TableToolbar onDelete={bulkDeleteOrder} />
        <TableContainer>
          <Table size="small" sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow>
                <TableHeaderSelectAllCell />
                <TableCell>ID</TableCell>
                <TableCell>Total price</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Payment status</TableCell>
                <TableCell>Ordered at</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((o) => {
                const deleteById = deleteOrder.bind(null, o.id);
                return (
                  <TableRow key={o.id}>
                    <TableSelectCell id={o.id} />
                    <TableCell>{o.id}</TableCell>
                    <TableCell>{o.formattedTotalPrice}</TableCell>
                    <TableCell>{o.customerName}</TableCell>
                    <TableCell>{o.payStatus}</TableCell>
                    <TableCell>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <TableViewRecordLink href={`/orders/${o.id}`} />
                      {/* <TableEditRecordLink href={`/orders/${o.id}/edit`} /> */}
                      <TableDeleteRecordButton onDelete={deleteById} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableRecordsPagination pagination={pagination} />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </TableProvider>
    </PageContentContainer>
  );
}

export default OrdersPage;
