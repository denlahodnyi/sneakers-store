'use client';

import {
  CancelOutlined,
  CheckCircleOutline,
  DeleteOutline,
  EditOutlined,
  Visibility,
} from '@mui/icons-material';
import {
  Button,
  Checkbox,
  IconButton,
  TableCell,
  TablePagination,
  Toolbar,
  Typography,
} from '@mui/material';
import type { PaginationDto } from '@sneakers-store/contracts';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useState,
  useTransition,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';

interface RowData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;
}

export const TableContext = createContext<{
  rows: RowData[];
  selectedRows: RowData['id'][];
  setSelectedRows: Dispatch<SetStateAction<RowData['id'][]>>;
}>({
  rows: [],
  selectedRows: [],
  setSelectedRows: () => null,
});

export function TableProvider({
  children,
  rows,
}: PropsWithChildren & { rows: RowData[] }) {
  const [selectedRows, setSelectedRows] = useState<RowData['id'][]>([]);

  return (
    <TableContext.Provider value={{ rows, selectedRows, setSelectedRows }}>
      {children}
    </TableContext.Provider>
  );
}

export function TableToolbar({
  onDelete,
}: {
  onDelete: (ids: RowData['id'][]) => unknown;
}) {
  const { selectedRows, setSelectedRows } = useContext(TableContext);
  const [pending, startTransition] = useTransition();
  return (
    <Toolbar sx={{ gap: 5, minHeight: { sm: '48px' } }}>
      {selectedRows.length > 0 && (
        <Typography variant="subtitle1">{`${selectedRows.length} selected`}</Typography>
      )}
      {selectedRows.length > 0 && (
        <Button
          color="error"
          disabled={pending}
          size="large"
          startIcon={<DeleteOutline />}
          variant="text"
          onClick={() => {
            startTransition(async () => {
              await onDelete(selectedRows);
              setSelectedRows([]);
            });
          }}
        >
          Delete
        </Button>
      )}
    </Toolbar>
  );
}

export function TableHeaderSelectAllCell() {
  const { rows, selectedRows, setSelectedRows } = useContext(TableContext);
  return (
    <TableCell>
      <Checkbox
        checked={selectedRows.length > 0 && rows.length === selectedRows.length}
        indeterminate={
          selectedRows.length > 0 && rows.length > selectedRows.length
        }
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedRows(rows.map(({ id }) => id));
          } else {
            setSelectedRows([]);
          }
        }}
      />
    </TableCell>
  );
}

export function TableSelectCell({ id: recordId }: { id: RowData['id'] }) {
  const { selectedRows, setSelectedRows } = useContext(TableContext);
  const checked = selectedRows.includes(recordId);
  return (
    <TableCell>
      <Checkbox
        checked={checked}
        onChange={() => {
          if (!checked) {
            setSelectedRows((arr) => [...arr, recordId]);
          } else {
            setSelectedRows((arr) => arr.filter((id) => id !== recordId));
          }
        }}
      />
    </TableCell>
  );
}

export function TableActiveCell({ active }: { active: boolean }) {
  return (
    <TableCell>
      {active ? (
        <CheckCircleOutline
          className="mr-1 align-top"
          color="success"
          fontSize="small"
        />
      ) : (
        <CancelOutlined
          className="mr-1 align-top"
          color="error"
          fontSize="small"
        />
      )}
      {active ? 'Yes' : 'No'}
    </TableCell>
  );
}

export function TableViewRecordLink({ href }: { href: string }) {
  return (
    <IconButton color="secondary" component={Link} href={href}>
      <Visibility />
    </IconButton>
  );
}

export function TableEditRecordLink({ href }: { href: string }) {
  return (
    <IconButton color="secondary" component={Link} href={href}>
      <EditOutlined />
    </IconButton>
  );
}

export function TableDeleteRecordButton({
  onDelete,
}: {
  onDelete: () => unknown;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <IconButton
      color="secondary"
      disabled={pending}
      type="submit"
      onClick={() => {
        startTransition(async () => {
          onDelete();
        });
      }}
    >
      <DeleteOutline />
    </IconButton>
  );
}

export function TableRecordsPagination({
  pagination,
}: {
  pagination: PaginationDto;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const getQuery = useCallback(
    (param: string, value: string) => {
      const searchParams = new URLSearchParams(sp.toString());
      searchParams.set(param, value);
      return searchParams.toString();
    },
    [sp],
  );

  return (
    <TablePagination
      count={pagination.totalItems}
      page={pagination.current - 1}
      rowsPerPage={pagination.perPage}
      rowsPerPageOptions={[5, 10, 25, 100]}
      onPageChange={(e, page) => {
        router.push(`${pathname}?${getQuery('page', (page + 1).toString())}`);
      }}
      onRowsPerPageChange={(e) => {
        router.push(
          `${pathname}?${getQuery('perPage', e.target.value.toString())}`,
        );
      }}
    />
  );
}
