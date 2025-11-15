import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ConditionalLayout } from '@/components/layouts/conditional-layout';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ConditionalLayout>
        {children}
      </ConditionalLayout>
    </NextIntlClientProvider>
  );
}
