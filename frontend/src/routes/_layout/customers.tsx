import { useMemo, useState, type ReactNode } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import {
  AlertCircle,
  ArrowDownUp,
  BriefcaseBusiness,
  CheckCircle2,
  MessageCircle,
  ChevronRight,
  Clock3,
  FilePlus2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  UserRound,
  Users,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const customerSearchSchema = z.object({ customerId: z.string().optional(), newCase: z.enum(["true"]).optional() })

export const Route = createFileRoute("/_layout/customers")({
  component: CustomersWireframe,
  validateSearch: customerSearchSchema,
  head: () => ({ meta: [{ title: "Klanten - VoyageVista Support" }] }),
})

type CaseStatus = "Open" | "In behandeling" | "Gesloten"
type CustomerCase = { id: string; subject: string; date: string; status: CaseStatus; channel: string }
type Customer = {
  id: string
  name: string
  email: string
  phone: string
  initials: string
  since: string
  cases: CustomerCase[]
}

const customers: Customer[] = [
  {
    id: "VV-10482",
    name: "Sophie van Dijk",
    email: "sophie.vandijk@example.com",
    phone: "+31 6 1234 5678",
    initials: "SV",
    since: "Klant sinds maart 2022",
    cases: [
      { id: "CS-24081", subject: "Wijziging van de terugvlucht", date: "Vandaag, 09:42", status: "Open", channel: "E-mail" },
      { id: "CS-23890", subject: "Vraag over bagagevoorwaarden", date: "12 okt 2026", status: "In behandeling", channel: "Telefoon" },
      { id: "CS-23174", subject: "Reisdocumenten Curaçao", date: "18 aug 2026", status: "Gesloten", channel: "E-mail" },
    ],
  },
  {
    id: "VV-10319",
    name: "Samir de Vries",
    email: "samir.devries@example.com",
    phone: "+31 6 8765 4321",
    initials: "SD",
    since: "Klant sinds juni 2023",
    cases: [
      { id: "CS-23945", subject: "Informatie over hotelboeking", date: "Gisteren, 15:18", status: "In behandeling", channel: "Chat" },
      { id: "CS-22307", subject: "Betaalbewijs opvragen", date: "4 sep 2026", status: "Gesloten", channel: "E-mail" },
    ],
  },
  {
    id: "VV-09866",
    name: "Nora Bakker",
    email: "nora.bakker@example.com",
    phone: "+31 6 2468 1357",
    initials: "NB",
    since: "Klant sinds januari 2021",
    cases: [
      { id: "CS-24002", subject: "Klacht over transfer op bestemming", date: "16 okt 2026", status: "Open", channel: "Telefoon" },
    ],
  },
  {
    id: "VV-09531",
    name: "Lars Meijer",
    email: "lars.meijer@example.com",
    phone: "+31 6 9753 0864",
    initials: "LM",
    since: "Klant sinds november 2020",
    cases: [],
  },
]

function statusStyle(status: CaseStatus) {
  if (status === "Open") return "border-amber-200 bg-amber-50 text-amber-800"
  if (status === "In behandeling") return "border-blue-200 bg-blue-50 text-blue-800"
  return "border-emerald-200 bg-emerald-50 text-emerald-800"
}

function CustomersWireframe() {
  const { customerId, newCase } = Route.useSearch()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState(customerId ?? customers[0].id)
  const [caseDialogOpen, setCaseDialogOpen] = useState(newCase === "true")
  const [caseCreated, setCaseCreated] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [contactSent, setContactSent] = useState(false)

  const filteredCustomers = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("nl")
    if (!search) return customers
    return customers.filter((customer) =>
      [customer.name, customer.email, customer.id, customer.phone].some((value) =>
        value.toLocaleLowerCase("nl").includes(search),
      ),
    )
  }, [query])
  const selectedCustomer =
    filteredCustomers.find((customer) => customer.id === selectedId) ?? filteredCustomers[0]

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Klantenservice & support</div>
          <h1 className="text-3xl font-semibold tracking-tight">Klanten</h1>
          <p className="text-sm text-muted-foreground">Zoek een klant en bekijk contactgegevens en eerdere dossiers.</p>
        </div>
        <Dialog open={caseDialogOpen} onOpenChange={(open) => { setCaseDialogOpen(open); if (open) setCaseCreated(false) }}>
          <DialogTrigger asChild>
            <Button><Plus /> Nieuw dossier</Button>
          </DialogTrigger>
          <DialogContent>
            {caseCreated ? (
              <div className="space-y-4 py-2">
                <DialogHeader>
                  <DialogTitle>Dossier aangemaakt</DialogTitle>
                  <DialogDescription>Het conceptdossier is gekoppeld aan {selectedCustomer?.name}.</DialogDescription>
                </DialogHeader>
                <DialogFooter><Button onClick={() => setCaseDialogOpen(false)}>Terug naar klant</Button></DialogFooter>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setCaseCreated(true) }}>
                <DialogHeader>
                  <DialogTitle>Nieuw dossier</DialogTitle>
                  <DialogDescription>Gekoppeld aan {selectedCustomer?.name ?? "een klant"}. De gegevens zijn alleen voor dit wireframe.</DialogDescription>
                </DialogHeader>
                <label className="grid gap-2 text-sm font-medium">Onderwerp<Input required placeholder="Waar gaat het dossier over?" /></label>
                <label className="grid gap-2 text-sm font-medium">Type<select className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option>Vraag</option><option>Klacht</option><option>Wijziging</option><option>Compensatie</option></select></label>
                <label className="grid gap-2 text-sm font-medium">Beschrijving<textarea className="min-h-24 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Voeg een korte omschrijving toe…" /></label>
                <DialogFooter><Button type="button" variant="outline" onClick={() => setCaseDialogOpen(false)}>Annuleren</Button><Button type="submit"><Plus /> Dossier aanmaken</Button></DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          {contactSent ? (
            <><DialogHeader><DialogTitle>Contactmoment vastgelegd</DialogTitle><DialogDescription>De conceptnotitie is gekoppeld aan {selectedCustomer?.name}.</DialogDescription></DialogHeader><DialogFooter><Button onClick={() => setContactDialogOpen(false)}>Terug naar klant</Button></DialogFooter></>
          ) : (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setContactSent(true) }}>
              <DialogHeader><DialogTitle>Contact opnemen</DialogTitle><DialogDescription>Leg een contactmoment met {selectedCustomer?.name} vast. Dit is een wireframe; er wordt geen bericht verstuurd.</DialogDescription></DialogHeader>
              <label className="grid gap-2 text-sm font-medium">Kanaal<select className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option>E-mail · {selectedCustomer?.email}</option><option>Telefoon · {selectedCustomer?.phone}</option></select></label>
              <label className="grid gap-2 text-sm font-medium">Notitie<textarea required className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Vat het contactmoment samen…" /></label>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setContactDialogOpen(false)}>Annuleren</Button><Button type="submit"><MessageCircle /> Contact vastleggen</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={<Users />} value="1.284" label="Klanten totaal" note="Alle klanten" />
        <SummaryCard icon={<Clock3 />} value="18" label="Open dossiers" note="+3 deze week" tone="amber" />
        <SummaryCard icon={<CheckCircle2 />} value="92%" label="Opgelost binnen SLA" note="Deze maand" tone="green" />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(300px,0.78fr)_minmax(0,1.35fr)]">
        <Card className="gap-0 py-0">
          <CardHeader className="gap-1 border-b px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Klanten zoeken</CardTitle>
              <Button variant="ghost" size="icon-sm" aria-label="Meer zoekopties"><MoreHorizontal /></Button>
            </div>
            <CardDescription>Zoek op naam, e-mailadres of klantnummer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-4 py-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Bijv. Sophie van Dijk of VV-10482" aria-label="Zoek klanten" />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{filteredCustomers.length} klanten gevonden</span>
              <Button variant="ghost" size="sm" className="h-7 px-2"><ArrowDownUp /> Meest recent</Button>
            </div>
            <div className="-mx-4 divide-y">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => setSelectedId(customer.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${selectedCustomer?.id === customer.id ? "bg-primary/5" : "bg-background"}`}
                >
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{customer.initials}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{customer.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{customer.email}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">{customer.cases.length} dossiers <ChevronRight className="size-4" /></span>
                </button>
              ))}
              {filteredCustomers.length === 0 && (
                <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-5 text-center text-sm text-muted-foreground">
                  <Search className="size-5" />
                  <strong className="font-medium text-foreground">Geen klant gevonden</strong>
                  <span className="text-xs">Controleer de zoekterm of probeer een e-mailadres.</span>
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full justify-between text-primary" onClick={() => { setQuery(""); setSelectedId(customers[0].id) }}>Toon alle klanten <ChevronRight /></Button>
          </CardContent>
        </Card>

        {selectedCustomer ? (
          <Card className="gap-0 overflow-hidden py-0">
            <div className="flex h-20 items-start justify-between bg-gradient-to-r from-primary/10 via-primary/5 to-amber-50 px-5 py-3">
              <Badge variant="outline" className="gap-1.5 border-primary/15 bg-background/80 text-primary"><span className="size-1.5 rounded-full bg-emerald-500" /> Actieve klant</Badge>
              <Button variant="ghost" size="icon-sm" aria-label="Meer klantacties"><MoreHorizontal /></Button>
            </div>
            <CardContent className="space-y-5 px-5 pb-5">
              <div className="-mt-8">
                <Avatar className="size-14 border-4 border-background">
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">{selectedCustomer.initials}</AvatarFallback>
                </Avatar>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">{selectedCustomer.name}</h2>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><span>{selectedCustomer.id}</span><span>·</span><span>{selectedCustomer.since}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => { setContactSent(false); setContactDialogOpen(true) }}><MessageCircle /> Contact opnemen</Button><Button variant="outline" size="sm">Profiel bewerken</Button></div>
                </div>
              </div>

              <div className="grid gap-3 border-y py-4 sm:grid-cols-2">
                <ContactDetail icon={<Mail />} label="E-mailadres" value={selectedCustomer.email} />
                <ContactDetail icon={<Phone />} label="Telefoonnummer" value={selectedCustomer.phone} />
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><h3 className="text-sm font-semibold">Recente dossiers</h3><p className="mt-1 text-xs text-muted-foreground">{selectedCustomer.cases.length} gekoppeld aan deze klant</p></div>
                  <Button variant="link" size="sm" className="h-8 px-1" onClick={() => navigate({ to: "/cases" })}>Alle dossiers <ChevronRight /></Button>
                </div>
                <div className="overflow-hidden rounded-lg border">
                  {selectedCustomer.cases.map((customerCase) => (
                    <button key={customerCase.id} type="button" onClick={() => navigate({ to: "/cases", search: { caseId: customerCase.id } })} className="flex w-full items-center gap-3 border-b p-3 text-left last:border-b-0 hover:bg-muted/40">
                      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground"><BriefcaseBusiness className="size-4" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{customerCase.subject}</span>
                        <span className="mt-1 block truncate text-xs text-muted-foreground">{customerCase.id} · {customerCase.date} · {customerCase.channel}</span>
                      </span>
                      <Badge variant="outline" className={statusStyle(customerCase.status)}>{customerCase.status}</Badge>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                  {selectedCustomer.cases.length === 0 && <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground"><FilePlus2 className="size-4" />Nog geen dossiers voor deze klant.</div>}
                </div>
                <Button variant="outline" className="w-full border-dashed text-primary" onClick={() => setCaseDialogOpen(true)}><Plus /> Nieuw dossier voor {selectedCustomer.name.split(" ")[0]}</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex min-h-[430px] items-center justify-center p-8 text-center">
            <div className="max-w-xs space-y-3"><AlertCircle className="mx-auto size-7 text-muted-foreground" /><h2 className="font-semibold">Selecteer een klant</h2><p className="text-sm text-muted-foreground">Kies een klant uit de zoekresultaten om contactgegevens en dossiers te bekijken.</p></div>
          </Card>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground"><span className="font-semibold uppercase tracking-[0.12em] text-primary">Wireframe 01</span><span>Zoeken → selecteren → dossier bekijken of starten</span><span>Conceptgegevens voor review</span></div>
    </div>
  )
}

function SummaryCard({
  icon,
  value,
  label,
  note,
  tone = "primary",
}: {
  icon: ReactNode
  value: string
  label: string
  note: string
  tone?: "primary" | "amber" | "green"
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-emerald-100 text-emerald-800",
  }
  return (
    <Card className="flex-row items-center gap-3 px-4 py-4">
      <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${toneClasses[tone]}`}>{icon}</span>
      <div className="min-w-0 flex-1"><div className="text-xl font-semibold leading-none tracking-tight">{value}</div><div className="mt-1.5 text-xs text-muted-foreground">{label}</div></div>
      <span className="text-[11px] text-muted-foreground max-sm:hidden">{note}</span>
    </Card>
  )
}

function ContactDetail({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">{icon}</span>
      <span className="min-w-0"><span className="block text-xs text-muted-foreground">{label}</span><span className="mt-1 block truncate text-sm font-medium">{value}</span></span>
      <UserRound className="ml-auto size-4 shrink-0 text-muted-foreground/60" />
    </div>
  )
}
