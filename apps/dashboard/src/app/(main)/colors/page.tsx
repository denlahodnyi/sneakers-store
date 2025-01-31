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
import { getConicGradientFromHexes } from '~/shared/ui/styles';
import {
  bulkDeleteColor,
  deleteColor,
  getColors,
} from './_api/color.server-fn';

async function BrandsPage() {
  const { colors } = await getColors();

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Colors</PageTitle>
        <PageHeaderActionsContainer>
          <CreateRecordLink href="/colors/new" />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <TableProvider rows={colors}>
        <TableToolbar onDelete={bulkDeleteColor} />
        <TableContainer>
          <Table size="small" sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow>
                <TableHeaderSelectAllCell />
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Hex</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {colors.map((c) => {
                const deleteById = deleteColor.bind(null, c.id);
                return (
                  <TableRow key={c.id}>
                    <TableSelectCell id={c.id} />
                    <TableCell>{c.id}</TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableActiveCell active={c.isActive} />
                    <TableCell>
                      <div>
                        <span
                          className="border-border mr-2 inline-block min-h-[12px] min-w-[12px] rounded-full border border-solid"
                          style={{
                            backgroundImage: getConicGradientFromHexes(c.hex),
                          }}
                        />
                        {c.hex.length > 1
                          ? `${c.hex[0]} +${c.hex.length - 1}`
                          : c.hex[0]}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TableViewRecordLink href={`/colors/${c.id}`} />
                      <TableEditRecordLink href={`/colors/${c.id}/edit`} />
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
