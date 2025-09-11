export default function Index() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F6633200b88854ecb85d819712761f1b4%2F7454e5b05c4045b5891a0d2796ffad2f?format=webp&width=800"
        alt="Hands reaching towards the sky"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />

      {/* Content */}
      <div className="relative z-10 px-6 w-full">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-white font-extrabold tracking-tight drop-shadow-xl leading-[0.95] text-4xl sm:text-6xl md:text-7xl lg:text-8xl">
            Uncover Complete
            <br className="hidden sm:block" /> Wellness and Healing
          </h1>

          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <a
              href="#ask-emotica"
              className="rounded-full border border-white/25 bg-black/40 px-6 py-3 text-sm md:text-base font-semibold tracking-widest uppercase text-white backdrop-blur-md hover:bg-black/50 transition-colors"
            >
              Ask Emotica
            </a>
            <a
              href="#take-assessment"
              className="rounded-full border border-white/25 bg-black/40 px-6 py-3 text-sm md:text-base font-semibold tracking-widest uppercase text-white backdrop-blur-md hover:bg-black/50 transition-colors"
            >
              Take Assement
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
