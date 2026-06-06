'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, flexRender,
  type ColumnDef, type SortingState, type ColumnFiltersState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
  Search, SlidersHorizontal, Eye,
} from 'lucide-react';
import { cn, formatDate, calculateLeaveDays } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge, LeaveTypeBadge } from '@/components/dashboard/status-badge';
import { ReviewLeaveDialog } from '@/components/forms/review-leave-dialog';
import type { LeaveWithProfile, UserRole } from '@/types';

interface LeavesTableProps {
  leaves: LeaveWithProfile[];
  loading?: boolean;
  role: UserRole;
  currentUserId: string;
  showStudent?: boolean;
  onRefresh?: () => void;
}

export function LeavesTable({
  leaves, loading, role, currentUserId, showStudent = false, onRefresh,
}: LeavesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<LeaveWithProfile | null>(null);

  const columns = useMemo<ColumnDef<LeaveWithProfile>[]>(() => {
    const cols: ColumnDef<LeaveWithProfile>[] = [];

    if (showStudent) {
      cols.push({
        id: 'student',
        header: 'Student',
        accessorFn: (row) => row.profiles?.full_name || '',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-sm">{row.original.profiles?.full_name || '—'}</p>
            <p className="text-xs text-muted-foreground">{row.original.profiles?.email || ''}</p>
          </div>
        ),
      });
    }

    cols.push(
      {
        accessorKey: 'leave_type',
        header: 'Type',
        cell: ({ getValue }) => <LeaveTypeBadge type={getValue() as any} />,
      },
      {
        accessorKey: 'start_date',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Start Date
            {column.getIsSorted() === 'asc' ? <ChevronUp className="h-3 w-3" /> :
             column.getIsSorted() === 'desc' ? <ChevronDown className="h-3 w-3" /> :
             <ChevronsUpDown className="h-3 w-3 opacity-40" />}
          </button>
        ),
        cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue() as string)}</span>,
      },
      {
        accessorKey: 'end_date',
        header: 'End Date',
        cell: ({ row }) => {
          const days = calculateLeaveDays(row.original.start_date, row.original.end_date);
          return (
            <div>
              <p className="text-sm">{formatDate(row.original.end_date)}</p>
              <p className="text-xs text-muted-foreground">{days} day{days > 1 ? 's' : ''}</p>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as any} />,
        filterFn: (row, id, filterValue) => {
          if (!filterValue || filterValue === 'all') return true;
          return row.getValue(id) === filterValue;
        },
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Applied
            {column.getIsSorted() === 'asc' ? <ChevronUp className="h-3 w-3" /> :
             column.getIsSorted() === 'desc' ? <ChevronDown className="h-3 w-3" /> :
             <ChevronsUpDown className="h-3 w-3 opacity-40" />}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(getValue() as string, 'MMM dd, yyyy')}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            {(role === 'faculty' || role === 'admin') ? (
              <Button
                size="sm"
                variant={row.original.status === 'pending' ? 'default' : 'outline'}
                onClick={() => setSelectedLeave(row.original)}
                className="h-7 text-xs"
              >
                {row.original.status === 'pending' ? 'Review' : <Eye className="h-3.5 w-3.5" />}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedLeave(row.original)}
                className="h-7 text-xs"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ),
      }
    );

    return cols;
  }, [showStudent, role]);

  const table = useReactTable({
    data: leaves,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leaves..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map((f) => {
            const current = (table.getColumn('status')?.getFilterValue() as string) || 'all';
            return (
              <button
                key={f.value}
                onClick={() => table.getColumn('status')?.setFilterValue(f.value === 'all' ? undefined : f.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
                  (f.value === 'all' && current === 'all') || current === f.value
                    ? 'border-primary bg-primary/10 text-primary dark:bg-primary/15'
                    : 'border-border hover:border-primary/50 hover:bg-accent'
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border bg-muted/30">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      {header.isPlaceholder ? null :
                        flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-muted-foreground">No results found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors duration-100"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )} of {table.getFilteredRowModel().rows.length} results
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Review Dialog */}
      {selectedLeave && (
        <ReviewLeaveDialog
          leave={selectedLeave}
          reviewerId={currentUserId}
          onClose={() => setSelectedLeave(null)}
          onSuccess={() => {
            setSelectedLeave(null);
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
}
