import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Menu, X, Rocket, Palette, Sparkles, Smartphone, ShieldCheck, Mail } from "lucide-react";

export default function NandDesignLanding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { label: "Serviços", href: "#servicos" },
    { label: "Diferenciais", href: "#diferenciais" },
    { label: "Portfólio", href: "#portfolio" },
    { label: "Depoimentos", href: "#depoimentos" },
    { label: "Contato", href: "#contato" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gray-900 text-white grid place-items-center font-bold">N</div>
            <span className="font-semibold">Nand Design</span>
          </a>
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((it) => (
              <a key={it.href} href={it.href} className="hover:text-gray-600 transition">{it.label}</a>
            ))}
            <a href="#contato" className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 hover:bg-gray-50">
              Briefing <ArrowRight className="w-4 h-4" />
            </a>
          </nav>
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-xl border">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="lg:hidden border-t">
            <div className="max-w-7xl mx-auto px-4 py-4 grid gap-3">
              {navItems.map((it) => (
                <a key={it.href} href={it.href} onClick={() => setOpen(false)} className="py-2">{it.label}</a>
              ))}
              <a href="#contato" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 w-max">Briefing <ArrowRight className="w-4 h-4" /></a>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#e5e7eb,transparent_40%),radial-gradient(circle_at_80%_0%,#f3f4f6,transparent_35%)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-xs tracking-widest uppercase text-gray-500">Design que vende</span>
            <h1 className="mt-3 text-4xl lg:text-6xl font-extrabold leading-[1.05]">Sites e marcas que <span className="bg-yellow-300 px-2 rounded">falam por você</span></h1>
            <p className="mt-4 text-gray-600 text-lg">Eu uno estética e estratégia pra transformar seu posicionamento em resultados reais. Simplicidade é a máxima sofisticação.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#contato" className="rounded-2xl bg-gray-900 text-white px-5 py-3 inline-flex items-center gap-2">Começar um projeto <ArrowRight className="w-4 h-4" /></a>
              <a href="#portfolio" className="rounded-2xl border px-5 py-3">Ver cases</a>
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4"/>+35 projetos entregues</div>
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4"/>Prazo e qualidade</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
            <div className="aspect-[4/3] rounded-3xl border shadow-sm bg-white overflow-hidden grid lg:grid-cols-2">
              <div className="p-6 lg:p-8 flex flex-col justify-center gap-4">
                <h3 className="font-semibold text-xl">Layout limpo, navegação fluida</h3>
                <p className="text-gray-600">Inspirado em e-commerces de alta conversão (ex: GSuplementos): header fixo, CTAs visíveis, grid modular responsivo.</p>
                <ul className="text-gray-600 list-disc pl-5 grid gap-1">
                  <li>Performance e SEO</li>
                  <li>Componentes reutilizáveis</li>
                  <li>Motion sutil para destacar CTAs</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 lg:p-8 grid place-items-center">
                <div className="w-full h-48 rounded-2xl border bg-white shadow-inner grid place-items-center">Mock de Projeto</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="servicos" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between gap-6 mb-10">
            <h2 className="text-2xl lg:text-4xl font-bold">Serviços</h2>
            <a href="#contato" className="hidden md:inline-flex items-center gap-2 text-sm rounded-2xl border px-4 py-2">Briefing rápido <ArrowRight className="w-4 h-4"/></a>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Palette className="w-6 h-6"/>, title: "Identidade Visual", desc: "Logo, paleta, tipografia e guias de uso." },
              { icon: <Smartphone className="w-6 h-6"/>, title: "Sites & Landing Pages", desc: "UI/UX, responsivo, SEO on-page e velocidade." },
              { icon: <Rocket className="w-6 h-6"/>, title: "Performance & Anúncios", desc: "Páginas que convertem + integrações." },
            ].map((c,i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i*0.05 }} className="rounded-3xl border p-6 hover:shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-gray-100 grid place-items-center mb-3">{c.icon}</div>
                <h3 className="font-semibold text-lg">{c.title}</h3>
                <p className="text-gray-600 mt-1">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFFERENTIALS (inspired by ecommerce trust bars) */}
      <section id="diferenciais" className="py-10 bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          {[
            { title: "Prazo cumprido", desc: "Cronograma claro e checkpoints semanais." },
            { title: "Código limpo", desc: "Componentes reutilizáveis, acessibilidade e SEO." },
            { title: "Suporte próximo", desc: "Acompanhamento em tempo real nas revisões." },
          ].map((d, i) => (
            <div key={i} className="rounded-3xl border bg-white p-6">
              <h4 className="font-semibold">{d.title}</h4>
              <p className="text-gray-600 mt-1">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PORTFOLIO GRID */}
      <section id="portfolio" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between gap-6 mb-10">
            <h2 className="text-2xl lg:text-4xl font-bold">Projetos</h2>
            <a href="#contato" className="hidden md:inline-flex items-center gap-2 text-sm rounded-2xl border px-4 py-2">Solicitar orçamento <ArrowRight className="w-4 h-4"/></a>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((n) => (
              <div key={n} className="group rounded-3xl overflow-hidden border bg-white">
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Case {n}</h3>
                    <p className="text-gray-600 text-sm">UI/UX · Landing Page</p>
                  </div>
                  <a href="#" className="text-sm font-medium opacity-0 group-hover:opacity-100 transition">ver</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="depoimentos" className="py-16 bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl lg:text-4xl font-bold mb-8">Nossos aventureiros dizem tudo</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {["Fechamos 30% mais leads", "Site ficou rápido e lindo", "Processo leve e organizado"].map((q, i) => (
              <div key={i} className="rounded-3xl border bg-white p-6">
                <p className="text-gray-800">“{q}.”</p>
                <div className="mt-4 text-sm text-gray-600">— Cliente {i+1}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contato" className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl lg:text-4xl font-bold">Vamos construir algo forte?</h2>
          <p className="text-gray-600 mt-2">Me conte sobre o projeto e eu retorno ainda hoje com os próximos passos.</p>
          <form onSubmit={(e) => e.preventDefault()} className="mt-8 grid gap-3 text-left">
            <div className="grid md:grid-cols-2 gap-3">
              <input className="rounded-2xl border px-4 py-3" placeholder="Seu nome" />
              <input type="email" className="rounded-2xl border px-4 py-3" placeholder="Seu e-mail" />
            </div>
            <input className="rounded-2xl border px-4 py-3" placeholder="Empresa / Marca" />
            <textarea className="rounded-2xl border px-4 py-3 min-h-[120px]" placeholder="Fale do projeto (objetivo, prazo, referências)" />
            <button className="mt-2 rounded-2xl bg-gray-900 text-white px-5 py-3 inline-flex items-center gap-2 mx-auto">
              Enviar <Mail className="w-4 h-4"/>
            </button>
          </form>
          <div className="mt-6 text-sm text-gray-500">Ou se preferir: <a className="underline" href="https://wa.me/5521999999999">WhatsApp</a></div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">© {new Date().getFullYear()} Nand Design. Todos os direitos reservados.</div>
          <div className="text-sm text-gray-500">Feito com estratégia + design.</div>
        </div>
      </footer>
    </div>
  );
}
