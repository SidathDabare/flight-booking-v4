import ClientNavbar from "@/components/client ui/ClientNavbar";
import Footer from "@/components/client ui/Footer";
import { ClientChatPopup } from "@/components/client ui/ClientChatPopup";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex min-h-screen w-full flex-col">
        <ClientNavbar />
        <main className="relative mt-[50px]">{children}</main>
        <Footer />
        <ClientChatPopup />
      </div>
    </NextIntlClientProvider>
  );
}
