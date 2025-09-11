import React from 'react';

// Data for the Frequently Asked Questions (FAQ)
const faqs = [
  {
    question: "What is Emotica AI?",
    answer: "Emotica AI is a voice-based mental wellness assistant designed to provide emotional support and guidance through private, non-judgmental conversations. It offers features like digital journaling, guided meditations, and a community forum.",
  },
  {
    question: "Is my data private and secure?",
    answer: "Yes, we take your privacy very seriously. All conversations and journal entries are securely stored and encrypted. We do not share your personal data with any third parties.",
  },
  {
    question: "Is this a substitute for a therapist?",
    answer: "No, Emotica AI is not a substitute for professional mental health care. It is an AI tool for general support and self-care. If you are experiencing a mental health crisis, please contact a professional.",
  },
  {
    question: "How can I get started?",
    answer: "You can start by clicking on the 'Talk to Emotica' button on the homepage. You can also explore our Small Apps section to try out features like journaling and guided breathing exercises.",
  },
  {
    question: "What languages does Emotica AI support?",
    answer: "Currently, Emotica AI primarily supports English, with plans to add more languages in the future. We are continuously working to expand our language capabilities.",
  },
];

export default function Support() {
  return (
    <div className="bg-[#4F6483] min-h-screen py-16 px-4 sm:px-6 lg:px-8 pt-[100px]">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-sm">
          Support
        </h1>
        <p className="mt-4 text-lg text-gray-200">
          We are here to help you on your wellness journey. Find answers to your questions or get in touch.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="bg-white/85 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="pb-4 border-b border-gray-200 last:border-b-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Contact Us
          </h2>
          <div className="bg-white/85 backdrop-blur-lg rounded-2xl shadow-xl p-8">
            <p className="text-center text-gray-600 mb-6">
              Didn't find what you were looking for? Send us a message and we'll get back to you.
            </p>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="sr-only">Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Your Name"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Your Email"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">Message</label>
                <textarea
                  id="message"
                  placeholder="Your Message"
                  rows={4}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-full shadow-md transition-all hover:bg-purple-700"
              >
                Send Message
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
