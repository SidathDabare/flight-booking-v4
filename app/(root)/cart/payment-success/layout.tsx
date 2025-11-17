// This layout makes the payment-success route dynamic
export const dynamic = 'force-dynamic';

export default function PaymentSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
