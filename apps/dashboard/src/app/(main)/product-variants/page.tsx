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
  TableDeleteRecordButton,
  TableEditRecordLink,
  TableHeaderSelectAllCell,
  TableProvider,
  TableSelectCell,
  TableToolbar,
  TableViewRecordLink,
} from '~/shared/ui/page-blocks';
import {
  bulkDeleteProductVariant,
  deleteProductVariant,
  getProductVariants,
} from './_api/product-var-server-fn';

async function ProductVariantsPage() {
  const { productVariants } = await getProductVariants();

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Product variants</PageTitle>
        <PageHeaderActionsContainer>
          <CreateRecordLink href="/product-variants/new" />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <TableProvider rows={productVariants}>
        <TableToolbar onDelete={bulkDeleteProductVariant} />
        <TableContainer>
          <Table size="small" sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow>
                <TableHeaderSelectAllCell />
                <TableCell>ID</TableCell>
                <TableCell>Product ID</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productVariants.map((p) => {
                const deleteById = deleteProductVariant.bind(null, p.id);
                return (
                  <TableRow key={p.id}>
                    <TableSelectCell id={p.id} />
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.productId}</TableCell>
                    <TableCell>
                      <TableViewRecordLink href={`/product-variants/${p.id}`} />
                      <TableEditRecordLink
                        href={`/product-variants/${p.id}/edit`}
                      />
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

export default ProductVariantsPage;
