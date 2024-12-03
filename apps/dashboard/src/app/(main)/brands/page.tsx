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
  bulkDeleteBrand,
  deleteBrand,
  getBrands,
} from './_api/brand-server-fn';

async function BrandsPage() {
  const { brands } = await getBrands();

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Brands</PageTitle>
        <PageHeaderActionsContainer>
          <CreateRecordLink href="/brands/new" />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <TableProvider rows={brands}>
        <TableToolbar onDelete={bulkDeleteBrand} />
        <TableContainer>
          <Table size="small" sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow>
                <TableHeaderSelectAllCell />
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Icon URL</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {brands.map((b) => {
                const deleteById = deleteBrand.bind(null, b.id);
                return (
                  <TableRow key={b.id}>
                    <TableSelectCell id={b.id} />
                    <TableCell>{b.id}</TableCell>
                    <TableCell>{b.name}</TableCell>
                    <TableActiveCell active={b.isActive} />
                    <TableCell>{b.iconUrl}</TableCell>
                    <TableCell>
                      <TableViewRecordLink href={`/brands/${b.id}`} />
                      <TableEditRecordLink href={`/brands/${b.id}/edit`} />
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

export default BrandsPage;
