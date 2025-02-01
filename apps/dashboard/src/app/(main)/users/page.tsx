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
import { bulkDeleteUser, deleteUser, getUsers } from './_api/user.server-fn';

async function UsersPage() {
  const { users, pagination } = await getUsers();

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Users</PageTitle>
        <PageHeaderActionsContainer>
          <CreateRecordLink href="/users/new" />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <TableProvider rows={users}>
        <TableToolbar onDelete={bulkDeleteUser} />
        <TableContainer>
          <Table size="small" sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow>
                <TableHeaderSelectAllCell />
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((b) => {
                const deleteById = deleteUser.bind(null, b.id);
                return (
                  <TableRow key={b.id}>
                    <TableSelectCell id={b.id} />
                    <TableCell>{b.id}</TableCell>
                    <TableCell>{b.name}</TableCell>
                    <TableCell>{b.email}</TableCell>
                    <TableCell>{b.role}</TableCell>
                    <TableCell>
                      <TableViewRecordLink href={`/users/${b.id}`} />
                      <TableEditRecordLink href={`/users/${b.id}/edit`} />
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

export default UsersPage;
