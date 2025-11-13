// TEST

// import Link from "next/link";

// export default async function PaymentSuccess({
//   searchParams,
// }: {
//   searchParams: { amount: string };
// }) {
//   const { amount } = await searchParams;
//   console.log(amount);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-500 to-purple-500">
//       <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
//         <div className="mb-6">
//           <svg
//             className="mx-auto h-16 w-16 text-green-500"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M5 13l4 4L19 7"
//             />
//           </svg>
//         </div>
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">
//           Payment Successful!
//         </h1>
//         <p className="text-gray-600 mb-6">
//           Thank you for your payment of ${amount}. Your transaction has been
//           completed successfully.
//         </p>
//         <Link
//           href="/"
//           className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           Return to Home
//         </Link>
//       </div>
//     </div>
//   );
// }
"use client";

// import useCart from "@/hooks/useCart";
import Link from "next/link";
import { useEffect } from "react";

const SuccessfulPayment = () => {
  // const cart = useCart();

  // useEffect(() => {
  //   cart.clearCart();
  // }, []);

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-5 w-11/12 mx-auto">
      <div className="text-center space-y-4">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-heading4-bold text-green-600">Payment Successful!</p>
        <p className="text-lg">Thank you for your booking</p>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 max-w-md mx-auto">
          <p className="text-blue-800 font-medium">📧 Ticket Delivery</p>
          <p className="text-blue-700 text-sm mt-2">
            Your flight ticket has been generated and will be sent to your email address within the next few minutes. 
            Please check your inbox and spam folder.
          </p>
        </div>
      </div>
      <Link
        href="/"
        className="p-4 border text-base-bold bg-gray-700 text-white hover:bg-black hover:text-white rounded-lg"
      >
        RETURN TO HOME
      </Link>
    </div>
  );
};

export default SuccessfulPayment;
