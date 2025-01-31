import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
} from '@mui/material';
import { PRICE_MINOR_UNITS } from '@sneakers-store/contracts';

import {
  CreateRecordLink,
  PageContentContainer,
  PageHeaderActionsContainer,
  PageHeaderContainer,
  PageTitle,
  TableActiveCell,
  TableDeleteRecordButton,
  TableEditRecordLink,
  TableHeaderSelectAllCell,
  TableProvider,
  TableRecordsPagination,
  TableSelectCell,
  TableToolbar,
  TableViewRecordLink,
} from '~/shared/ui/page-blocks';
import {
  bulkDeleteProductSku,
  deleteProductSku,
  getProductSkus,
} from './_api/sku-server-fn';

async function SkusPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { page, perPage } = await props.searchParams;
  const { productSkus, pagination } = await getProductSkus({
    page: page ? Number(page) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
  });

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>SKUs</PageTitle>
        <PageHeaderActionsContainer>
          <CreateRecordLink href="/skus/new" />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <TableProvider rows={productSkus}>
        <TableToolbar onDelete={bulkDeleteProductSku} />
        <TableContainer>
          <Table size="small" sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow>
                <TableHeaderSelectAllCell />
                <TableCell>ID</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Stock quantity</TableCell>
                <TableCell>Base price</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productSkus.map((s) => {
                const deleteById = deleteProductSku.bind(null, s.id);
                return (
                  <TableRow key={s.id}>
                    <TableSelectCell id={s.id} />
                    <TableCell>{s.id}</TableCell>
                    <TableCell>{s.sku}</TableCell>
                    <TableActiveCell active={s.isActive} />
                    <TableCell>{s.stockQty}</TableCell>
                    <TableCell>{`$${s.basePrice / PRICE_MINOR_UNITS}`}</TableCell>
                    <TableCell>
                      <TableViewRecordLink href={`/skus/${s.id}`} />
                      <TableEditRecordLink href={`/skus/${s.id}/edit`} />
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

export default SkusPage;
