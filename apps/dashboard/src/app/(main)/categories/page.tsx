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
  bulkDeleteCategory,
  deleteCategory,
  getCategories,
} from './_api/category-server-fn';

async function CategoriesPage() {
  const { categories } = await getCategories();

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Categories</PageTitle>
        <PageHeaderActionsContainer>
          <CreateRecordLink href="/categories/new" />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <TableProvider rows={categories}>
        <TableToolbar onDelete={bulkDeleteCategory} />
        <TableContainer>
          <Table size="small" sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow>
                <TableHeaderSelectAllCell />
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Parent ID</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((c) => {
                const deleteById = deleteCategory.bind(null, c.id);
                return (
                  <TableRow key={c.id}>
                    <TableSelectCell id={c.id} />
                    <TableCell>{c.id}</TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableActiveCell active={c.isActive} />
                    <TableCell>{c.parentId}</TableCell>
                    <TableCell>
                      <TableViewRecordLink href={`/categories/${c.id}`} />
                      <TableEditRecordLink href={`/categories/${c.id}/edit`} />
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

export default CategoriesPage;
