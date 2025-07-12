'use client';

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Form } from "@/lib/types";

export const columns: ColumnDef<Form>[] = [
  {
    accessorKey: "title",
    header: "Form Title",
  },
  {
    accessorKey: "submissions",
    header: "Submissions",
    cell: ({ row }) => row.original.submissions?.length
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/${row.original.id}`}>Edit</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/submit/${row.original.id}`}>View</Link>
        </Button>
      </div>
    )
  }
];