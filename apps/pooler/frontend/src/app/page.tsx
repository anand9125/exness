import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-20">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-pretty text-3xl md:text-5xl font-semibold">
              Trade smarter with a fast, intuitive platform
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Access forex, crypto, indices, and commodities with real‑time pricing, advanced charts, and lightning‑fast
              execution.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup">
                <Button size="lg" className="bg-[#f5b300] text-black hover:bg-[#dca100]">
                  Get started
                </Button>
              </Link>
              <Link href="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary/60 bg-transparent"
                >
                  Launch web terminal
                </Button>
              </Link>
            </div>
            <ul className="text-sm text-muted-foreground grid gap-2 pt-2">
              <li>• Tight spreads and deep liquidity</li>
              <li>• Real‑time market data and alerts</li>
              <li>• Advanced charts and drawing tools</li>
            </ul>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <div className="aspect-video w-full rounded-md overflow-hidden">
                <div className="h-full w-full">
                  <div className="h-10 border-b border-border bg-secondary/40 flex items-center gap-3 px-3">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-4 w-16 rounded bg-muted" />
                    <div className="ml-auto flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-[#f5b300]" />
                      <div className="h-4 w-12 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="p-3 grid grid-rows-[1fr_auto] h-[calc(100%-40px)]">
                    <div className="border border-border rounded bg-background" />
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        <span className="font-medium text-foreground">XAU/USD</span> • 1m
                      </span>
                      <span className="text-foreground">+0.84%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "150+ assets", desc: "Forex, crypto, indices, metals and energy." },
            { title: "Low latency", desc: "Fast order routing and reliable uptime." },
            { title: "Advanced charts", desc: "Candles, indicators, drawings and more." },
            { title: "Secure accounts", desc: "2FA, encryption and account controls." },
          ].map((f) => (
            <Card key={f.title} className="bg-card border-border">
              <CardContent className="p-4">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} XTrade. All rights reserved.
        </div>
      </footer>
    </main>
  )
}
