import { TableCell, TableRow } from "@/components/ui/table";

export default function UserRowSkeleton() {
  return (
    <TableRow className="animate-pulse hover:bg-gray-50">
      <TableCell className="font-medium">
        <div className="h-4 bg-gray-200 rounded w-4" />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="h-4 bg-gray-200 rounded w-28" />
        </div>
      </TableCell>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded w-full" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded w-16" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded w-20" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded w-20" />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-gray-200 rounded-md" />
        </div>
      </TableCell>
    </TableRow>
  );

}