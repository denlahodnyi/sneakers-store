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
  Toolbar,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import {
  createContext,
  useContext,
  useState,
  useTransition,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';

export const TableContext = createContext<{
  rows: { id: string }[];
  selectedRows: string[];
  setSelectedRows: Dispatch<SetStateAction<string[]>>;
}>({
  rows: [],
  selectedRows: [],
  setSelectedRows: () => null,
});

export function TableProvider({
  children,
  rows,
}: PropsWithChildren & { rows: { id: string }[] }) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  return (
    <TableContext.Provider value={{ rows, selectedRows, setSelectedRows }}>
      {children}
    </TableContext.Provider>
  );
}

export function TableToolbar({
  onDelete,
}: {
  onDelete: (ids: string[]) => unknown;
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

export function TableSelectCell({ id: recordId }: { id: string }) {
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
    <IconButton component={Link} href={href}>
      <Visibility />
    </IconButton>
  );
}

export function TableEditRecordLink({ href }: { href: string }) {
  return (
    <IconButton component={Link} href={href}>
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
