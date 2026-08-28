import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-background px-6 pb-0 pt-8 sm:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="relative aspect-[3/2] overflow-hidden rounded-t-[30px] border border-b-0 border-border shadow-[0_16px_45px_rgba(31,53,28,0.07)]">
          <Image
            src="/images/home/home-hero-products.jpeg"
            alt="AMİRZAK bitkileri ve bitki bakım ürünleri"
            fill
            priority
            className="object-contain object-center"
            sizes="100vw"
          />

          <div className="pointer-events-none absolute inset-y-0 left-0 w-[64%] bg-gradient-to-r from-black/30 via-black/15 to-transparent" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-b from-transparent via-[#f4eee3]/10 to-[#eef1e7]/55" />

          <div className="absolute left-[5%] top-[8%] z-10">
            <div className="flex items-center justify-center gap-8 lg:gap-12">
              <div className="flex shrink-0 items-center justify-center">
                <Image
                  src="/brand/amirzak-mark.png"
                  alt="AMİRZAK"
                  width={320}
                  height={320}
                  priority
                  className="h-auto w-[185px] object-contain drop-shadow-[0_3px_8px_rgba(255,255,255,0.35)] sm:w-[215px] lg:w-[245px]"
                />
              </div>

              <h1 className="max-w-[390px] font-serif text-4xl font-bold leading-[1.06] tracking-[-0.035em] text-white [text-shadow:0_3px_10px_rgba(0,0,0,0.85)] sm:text-5xl lg:text-[54px]">
                Yaşam alanınıza
                <br />
                doğadan bir
                <br />
                parça katın
              </h1>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}