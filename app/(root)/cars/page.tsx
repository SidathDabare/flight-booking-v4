import CarsLoader from "./_components/cars-loader";

// Make this page dynamic since it uses search params
export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface Props {
  searchParams: SearchParams;
}

export async function generateMetadata(props: Props) {
  return {
    title: "Car Rental Search Results",
    description: "Find and book the perfect rental car for your trip",
  };
}

export default function Page(props: Props) {
  return <CarsLoader />;
}
