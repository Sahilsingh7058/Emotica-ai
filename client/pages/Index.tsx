import { BrowserRouter, Routes, Route } from "react-router-dom";
import Emotica from "./Emotica";
import { Link } from "react-router-dom";

const featureCards = [
  {
      title: "Talk to Emotica",
      description: "Have a private, judgment-free conversation with your AI companion anytime you need.",
      icon: "🤖"
  },
  {
      title: "Digital Journaling",
      description: "Express your thoughts and track your emotional journey with a simple, secure journal.",
      icon: "✍️"
  },
  {
      title: "Guided Activities",
      description: "Access guided breathing exercises and meditations to find calm in your day.",
      icon: "🧘"
  }
];

// Data for the footer links
const footerLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact Us", href: "#" }
];


export default function Index() {
  return (
    <>
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-neutral-300">
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

          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap pt-10">
          
          <Link
              to="/emotica"
              className="rounded-full border border-white/25 bg-black/40 px-6 py-3 text-sm md:text-base font-semibold tracking-widest uppercase text-white backdrop-blur-md hover:bg-black/50 transition-colors"
            >
              Ask Emotica
            </Link>
            
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

    <main className="py-16 px-4 sm:px-6 lg:px-8 bg-[#4F6483]">
                <div className="container mx-auto max-w-7xl">
                    <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-12">How It Works</h2>
                    
                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {featureCards.map((card, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
                                <div className="text-5xl mb-4">{card.icon}</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{card.title}</h3>
                                <p className="text-gray-600">
                                    {card.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Call to Action Section */}
                    <section className="mt-20 bg-purple-50 rounded-2xl p-10 sm:p-16 text-center shadow-lg">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-purple-900 mb-4">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="text-purple-700 max-w-2xl mx-auto mb-8">
                            Join thousands of people who are finding clarity and peace with Emotica AI. It's free to get started.
                        </p>
                        <button className="px-8 py-4 bg-purple-600 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:bg-purple-700">
                            Sign Up Now
                        </button>
                    </section>
                </div>
            </main>

            {/* Footer Section */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0">
                    {/* Copyright & Logo */}
                    <div className="flex items-center space-x-4">
                        <span className="text-xl font-bold text-white">Emotica</span>
                        <p className="text-sm">&copy; 2025 Emotica AI. All rights reserved.</p>
                    </div>
                    
                    {/* Footer Links */}
                    <div className="flex flex-wrap justify-center space-x-6 sm:space-x-8">
                        {footerLinks.map((link, index) => (
                            <a key={index} href={link.href} className="text-sm hover:text-white transition-colors">
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Social Media Icons (placeholders) */}
                    
                </div>
            </footer>
  
    
    </>
  );
}
