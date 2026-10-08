import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { elastic } from "@/lib/elastic";
import { Decisao } from "@/types";
import { FileTextIcon, PenBox } from "lucide-react";
import Form from "next/form"
import Link from "next/link";
import _ from "lodash"
import { estypes } from "@elastic/elasticsearch"

export const dynamic = "force-dynamic";

export default async function Home(props: PageProps<"/">) {

  const { q = "", t = "" } = await props.searchParams

  const term = String(q)

  const filter: estypes.QueryDslQueryContainer = {
    bool: {
      must_not: [
        {
          exists: { field: "ai" }
        }
      ],
      must: [
        {
          exists: { field: "url" }
        }
      ]
    }
  }

  const count = await elastic.count({ query: filter })

  const items = await elastic.search<Decisao>({
    index: "decisoes-tate",
    query: filter,
    size: 10
  })

  console.log("REFETCH#############")

  const hits = items.hits.hits

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <Form action={""} className="flex gap-4">
            <Input name="q" defaultValue={term} />
            <Button variant={'outline'}>Filtrar Resultado</Button>
          </Form>

          {count.count} registros <span className="hidden">{t}</span>
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
      </Card>

      <div className="absolute right-1 bottom-1 text-xs">
        BUILD: {process.env.NEXT_PUBLIC_BUILD_DATE!}
      </div>
    </div>
  );
}
