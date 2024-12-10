import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

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
  TableSelectCell,
  TableToolbar,
  TableViewRecordLink,
} from '~/shared/ui/page-blocks';
import {
  bulkDeleteProductSku,
  deleteProductSku,
  getProductSkus,
} from './_api/sku-server-fn';

async function SkusPage() {
  const { productSkus } = await getProductSkus();

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
                <TableCell>Name</TableCell>
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
                    <TableCell>{s.name || 'N/A'}</TableCell>
                    <TableActiveCell active={s.isActive} />
                    <TableCell>{s.stockQty}</TableCell>
                    <TableCell>{`$${s.basePrice / 100}`}</TableCell>
                    <TableCell>
                      <TableViewRecordLink href={`/skus/${s.id}`} />
                      <TableEditRecordLink href={`/skus/${s.id}/edit`} />
                      <TableDeleteRecordButton onDelete={deleteById} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </TableProvider>
    </PageContentContainer>
  );
}

export default SkusPage;
