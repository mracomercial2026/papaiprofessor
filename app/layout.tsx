import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

const APP_URL = "https://papaiprofessor.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Papai Professor — Ajude seu filho nas tarefas com IA",
    template: "%s | Papai Professor",
  },
  description:
    "Não sabe explicar a tarefa do seu filho? Em 5 minutos o Papai Professor te ensina o conteúdo — sem jargão — e transforma a revisão em um jogo que vocês jogam juntos. Grátis para começar.",
  keywords: [
    "ajudar filho na tarefa",
    "app para pais",
    "ensino fundamental 1",
    "tabuada criança",
    "matemática para pais",
    "papai professor",
    "educação gamificada",
    "IA educação",
  ],
  authors: [{ name: "Papai Professor" }],
  creator: "Papai Professor",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: APP_URL,
    siteName: "Papai Professor",
    title: "Papai Professor — Ajude seu filho nas tarefas com IA",
    description:
      "Aprenda o conteúdo em 5 minutos e depois jogue junto com seu filho pra fixar. Do 1º ao 5º ano do EF1.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Papai Professor — Aprender com o filho nunca foi tão fácil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Papai Professor — Ajude seu filho nas tarefas com IA",
    description:
      "Aprenda o conteúdo em 5 minutos e depois jogue junto com seu filho pra fixar.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Papai Professor",
  url: APP_URL,
  description:
    "App educativo gamificado que ajuda pais a ensinar os filhos do Ensino Fundamental 1 com apoio de IA.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BRL",
  },
  audience: {
    "@type": "Audience",
    audienceType: "Pais de alunos do Ensino Fundamental 1",
  },
  inLanguage: "pt-BR",
  author: {
    "@type": "Organization",
    name: "Papai Professor",
    url: APP_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col scanlines">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
