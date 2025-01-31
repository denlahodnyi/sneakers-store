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
  bulkDeleteProduct,
  deleteProduct,
  getProducts,
} from './_api/product-server-fn';

async function ProductsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { page, perPage } = await props.searchParams;
  const { products, pagination } = await getProducts({
    page: page ? Number(page) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
  });

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Products</PageTitle>
        <PageHeaderActionsContainer>
          <CreateRecordLink href="/products/new" />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <TableProvider rows={products}>
        <TableToolbar onDelete={bulkDeleteProduct} />
        <TableContainer>
          <Table size="small" sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow>
                <TableHeaderSelectAllCell />
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Featured</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => {
                const deleteById = deleteProduct.bind(null, p.id);
                return (
                  <TableRow key={p.id}>
                    <TableSelectCell id={p.id} />
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.gender}</TableCell>
                    <TableActiveCell active={p.isActive} />
                    <TableActiveCell active={p.isFeatured} />
                    <TableCell>
                      <TableViewRecordLink href={`/products/${p.id}`} />
                      <TableEditRecordLink href={`/products/${p.id}/edit`} />
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

export default ProductsPage;
