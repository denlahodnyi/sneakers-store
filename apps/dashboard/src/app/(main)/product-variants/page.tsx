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
  CreateRecordLink,
  PageContentContainer,
  PageHeaderActionsContainer,
  PageHeaderContainer,
  PageTitle,
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
  bulkDeleteProductVariant,
  deleteProductVariant,
  getProductVariants,
} from './_api/product-var.server-fn';

async function ProductVariantsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { page, perPage } = await props.searchParams;
  const { productVariants, pagination } = await getProductVariants({
    page: page ? Number(page) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
  });

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
                <TableCell>Name</TableCell>
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
                    <TableCell>{p.name || 'N/A'}</TableCell>
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

export default ProductVariantsPage;
