import HotelsLoader from "./_components/hotels-loader";

// Make this page dynamic since it uses search params
export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface Props {
  searchParams: SearchParams;
}

export async function generateMetadata(props: Props) {
  return {
    title: "Hotel Search Results",
    description: "Find and book the perfect hotel for your stay",
  };
}

export default function Page(props: Props) {
  return <HotelsLoader />;
}
