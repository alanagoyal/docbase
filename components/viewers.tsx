import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Viewers({ allViews }: { allViews: any }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Icon</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Date Viewed</TableHeaderCell>
        </TableRow>
      </TableHead>
      {allViews &&
        allViews.map((view: any) => (
          <TableBody>
            <TableRow key={view.email}>
              <TableCell>
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>{view.email[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>
                {" "}
                <p className="text-sm font-medium leading-none">{view.email}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm text-muted-foreground">
                  {new Date(view.viewed_at).toLocaleString("en-US")}
                </p>
              </TableCell>
            </TableRow>
          </TableBody>
        ))}
    </Table>
  )
}

// <div className="flex items-center py-2" key={view.email}>
// <Avatar className="h-9 w-9">
//   <AvatarImage src="/avatars/01.png" alt="Avatar" />
//   <AvatarFallback>{view.email[0].toUpperCase()}</AvatarFallback>
// </Avatar>
// <div className="ml-4 space-y-1">
//   <p className="text-sm font-medium leading-none">{view.email}</p>
//   <p className="text-sm text-muted-foreground">
//     {new Date(view.viewed_at).toLocaleString("en-US")}
//   </p>
// </div>
// </div>
