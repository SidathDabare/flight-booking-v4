import Image from "next/image";
import Link from "next/link";

import dubaiImage from "@/assets/images/dubai.jpg";
import istanbulImage from "@/assets/images/istanbul.jpg";
import moscowImage from "@/assets/images/moscow.jpg";
import londonImage from "@/assets/images/london.jpg";

export default function FeaturedDestinations() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Featured Destinations
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {`Explore the world's most popular travel destinations.`}
            </p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="#"
            className="group relative overflow-hidden rounded-lg"
            prefetch={false}
          >
            <Image
              src={dubaiImage}
              width={600}
              height={400}
              alt="Destination"
              className="aspect-[3/2] w-full object-cover transition-all group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-semibold">Dubai</h3>
              <p className="text-sm">UAE</p>
            </div>
          </Link>
          <Link
            href="#"
            className="group relative overflow-hidden rounded-lg"
            prefetch={false}
          >
            <Image
              src={istanbulImage}
              width={600}
              height={400}
              alt="Destination"
              className="aspect-[3/2] w-full object-cover transition-all group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-semibold">Istanbul</h3>
              <p className="text-sm">Turkey</p>
            </div>
          </Link>
          <Link
            href="#"
            className="group relative overflow-hidden rounded-lg"
            prefetch={false}
          >
            <Image
              src={moscowImage}
              width={600}
              height={400}
              alt="Destination"
              className="aspect-[3/2] w-full object-cover transition-all group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-semibold">Moscow</h3>
              <p className="text-sm">Russia</p>
            </div>
          </Link>
          <Link
            href="#"
            className="group relative overflow-hidden rounded-lg"
            prefetch={false}
          >
            <Image
              src={londonImage}
              width={600}
              height={400}
              alt="Destination"
              className="aspect-[3/2] w-full object-cover transition-all group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-semibold">London</h3>
              <p className="text-sm">UK</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
