import { cn } from "@/lib/utils";
import { FileText, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PerformanceRecord {
  id: string;
  date: string;
  employee: string;
  type: "review" | "incident" | "commendation" | "warning";
  summary: string;
  status: "pending" | "reviewed" | "closed";
}

interface PerformanceTableProps {
  records: PerformanceRecord[];
}

const typeStyles = {
  review: "bg-primary/10 text-primary",
  incident: "bg-destructive/10 text-destructive",
  commendation: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

const statusStyles = {
  pending: "bg-warning/10 text-warning",
  reviewed: "bg-primary/10 text-primary",
  closed: "bg-muted text-muted-foreground",
};

export function PerformanceTable({ records }: PerformanceTableProps) {
  return (
    <div className="metric-card overflow-hidden p-0">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Performance Documentation</h3>
        </div>
        <button className="px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          Add Record
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Employee
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Type
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Summary
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-4 text-sm text-foreground whitespace-nowrap">
                  {record.date}
                </td>
                <td className="px-5 py-4 text-sm font-medium text-foreground whitespace-nowrap">
                  {record.employee}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className={cn(
                    "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                    typeStyles[record.type]
                  )}>
                    {record.type}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground max-w-xs truncate">
                  {record.summary}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className={cn(
                    "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                    statusStyles[record.status]
                  )}>
                    {record.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Eye className="w-4 h-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Edit className="w-4 h-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
