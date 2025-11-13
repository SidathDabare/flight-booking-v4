import FlightsLoader from "./_components/flights-loader";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface Props {
  searchParams: SearchParams;
}

export async function generateMetadata(props: Props) {}

export default function Page(props: Props) {
  return <FlightsLoader />;
}
