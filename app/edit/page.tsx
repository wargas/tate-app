import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { elastic } from "@/lib/elastic"
import { Decisao } from "@/types"
import { refresh, revalidatePath } from "next/cache"
import Form from "next/form"
import { redirect } from "next/navigation"

export default async function PageEdit(props: PageProps<"/edit">) {

    const sp = await props.searchParams

    const id = String(sp.id)

    const item = await elastic.get<Decisao>({
        index: 'decisoes-tate', id
    })

    const text = item._source?.text.replace(/\n/g, " ").replace(/\s+/g, " ") ?? ""
    //2016.000003466310
    const prevAi = text.match(/ (\d{4}\.\d{12}-\d{2})/)?.at(1) ?? ""
    const prevTATE = text.match(/ (\d{2}\.\d{3}\/\d{2}-\d)/)?.at(1) ?? ""
    const prevCacepe = text.match(/ (\d{6,7}-\d{2})/)?.at(1) ?? ""
    const prevContribuinte = text.replace(/\n/g, " ").match(/(AUTUAD[AO]|INTERESSAD[AO]|RECORRENTE):? (.*?)\./)?.at(2) ?? ""
    

    async function updateItem(data: FormData) {
        'use server'

        const input = {
            text: data.get("text")?.toString(),
            ai: data.get("ai")?.toString(),
            tate: data.get("tate")?.toString(),
            cacepe: data.get("cacepe")?.toString(),
            contribuinte: data.get("contribuinte")?.toString(),
            url: item._source?.url
        }

       const insert = await elastic.index({
            index: 'decisoes-tate',
            id,
            document: input
        })

        revalidatePath("/")

        redirect(`/?t=${crypto.randomUUID()}`)

    }

    return <div className="p-4 max-w-4xl w-full mx-auto ">
        <Form action={updateItem} className="flex flex-col gap-4">
            <div className="flex gap-2">

                <Field className="flex-2">
                    <FieldLabel>Numero AI</FieldLabel>
                    <Input defaultValue={item._source?.ai ?? prevAi} name="ai" />
                </Field>

                <Field className="flex-1">
                    <FieldLabel>Numero TATE:</FieldLabel>
                    <Input defaultValue={item._source?.tate ?? prevTATE} name="tate" />
                </Field>
            </div>
            <div className="flex gap-2">

                <Field className="flex-4">
                    <FieldLabel>Contribuinte:</FieldLabel>
                    <Input defaultValue={item._source?.contribuinte ?? prevContribuinte.trim() } name="contribuinte" />
                </Field>

                <Field className="flex-1">
                    <FieldLabel>CACEPE:</FieldLabel>
                    <Input defaultValue={item._source?.cacepe ?? prevCacepe} name="cacepe" />
                </Field>
            </div>

            <Textarea name="text" className="max-h-90" defaultValue={item._source?.text} />

            <input type="hidden" name="url" defaultValue={item._source?.url} />
            <div>
                <Button>Salvar Dados</Button>
            </div>
        </Form>
    </div>
}