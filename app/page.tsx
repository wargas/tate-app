import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { elastic } from "@/lib/elastic";
import { Decisao } from "@/types";
import { ChevronLeft, ChevronRight, FileTextIcon, PenBox } from "lucide-react";
import Form from "next/form"
import Link from "next/link";
import _ from "lodash"
import { estypes } from "@elastic/elasticsearch"
import qs from 'querystring'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const dynamic = "force-dynamic";

export default async function Home(props: PageProps<"/">) {

  const params = await props.searchParams;
  const { q = "", p = "1" } = params;

  const page = parseInt(p.toString()) ?? 1
  const perPage = 10

  const term = String(q)

  const filter: estypes.QueryDslQueryContainer = {
    bool: {
      // filter: [
      //   {

      //   }
      // ]
      // must_not: [
      //   {
      //     exists: { field: "ai" }
      //   }
      // ],
      // must: [
      //   {
      //     exists: { field: "url" }
      //   }
      // ]
    }
  }

  const count = await elastic.count({ index: "decisoes-tate", query: filter })

  const pages = Array(Math.ceil(count.count / perPage)).fill(1).map((_, i) => i + 1)

  const items = await elastic.search<Decisao>({
    index: "decisoes-tate",
    query: filter,
    from: (page-1) * perPage,
    size: 10
  })

  const hits = items.hits.hits

  function generateSearchParams(newParams: any) {
    const search = { ...params, ...newParams }

    return "?" + qs.stringify(search)
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <Form action={""} className="flex gap-4">
            <Input name="q" defaultValue={term} />
            <Button variant={'outline'}>Filtrar Resultado</Button>
          </Form>

          {count.count} registros
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>AI</TableHead>
                <TableHead>TATE</TableHead>
                <TableHead>Contribuinte</TableHead>
                <TableHead>TATE</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hits.map(h => (
                <TableRow key={h._id}>
                  <TableCell>{_.last(h._source?.url?.split("/"))}</TableCell>
                  <TableCell>{h._source?.ai}</TableCell>
                  <TableCell>{h._source?.tate}</TableCell>
                  <TableCell>{h._source?.contribuinte}</TableCell>
                  <TableCell>{h._source?.cacepe}</TableCell>

                  <TableCell>
                    <div className="flex gap-1">
                      <Button size={'icon-xs'} variant={'ghost'} asChild>
                        <Link href={`/edit?id=${h._id}`}>
                          <PenBox />
                        </Link>
                      </Button>
                      <Button size={'icon-xs'} variant={'ghost'} asChild>
                        <a href={h._source?.url} target="_blank"><FileTextIcon /></a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="gap-1">
          <div className="ml-auto"></div>
          <Button variant={'ghost'} asChild>
            <Link href={generateSearchParams({ p: Math.max(1, page - 1) })}>
              <ChevronLeft />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              {page}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {pages.map(p => (
                <DropdownMenuItem key={p} asChild>
                  <Link href={generateSearchParams({ p })}>{p}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant={'ghost'} asChild>
            <Link href={generateSearchParams({ p: Math.min(pages.length, page + 1) })}>
              <ChevronRight />
            </Link>
          </Button>

        </CardFooter>
      </Card>

      <div className="absolute right-1 bottom-1 text-xs">
        BUILD: {process.env.NEXT_PUBLIC_BUILD_DATE!}
      </div>
    </div>
  );
}
