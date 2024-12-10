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
import { bulkDeleteSize, deleteSize, getSizes } from './_api/size-server-fn';

async function SizesPage() {
  const { sizes } = await getSizes();

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Sizes</PageTitle>
        <PageHeaderActionsContainer>
          <CreateRecordLink href="/sizes/new" />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <TableProvider rows={sizes}>
        <TableToolbar onDelete={bulkDeleteSize} />
        <TableContainer>
          <Table size="small" sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow>
                <TableHeaderSelectAllCell />
                <TableCell>ID</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>System</TableCell>
                <TableCell>Is active</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sizes.map((s) => {
                const deleteById = deleteSize.bind(null, s.id);
                return (
                  <TableRow key={s.id}>
                    <TableSelectCell id={s.id} />
                    <TableCell>{s.id}</TableCell>
                    <TableCell>{s.size}</TableCell>
                    <TableCell>{s.system}</TableCell>
                    <TableActiveCell active={s.isActive} />
                    <TableCell>
                      <TableViewRecordLink href={`/sizes/${s.id}`} />
                      <TableEditRecordLink href={`/sizes/${s.id}/edit`} />
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

export default SizesPage;
