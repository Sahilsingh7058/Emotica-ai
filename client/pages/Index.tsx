import { Link } from "react-router-dom";
import { useState } from "react";
import AuthPage from './AuthPage';

// --- TypeScript Interfaces ---
interface Option { text: string }
interface Question { id: number; question: string; options: Option[] }
// ✅ FIX 1: ADD 'suggestion' TO THE RESULT INTERFACE
interface Result {
  mood: string;
  description: string;
  suggestion: string;
}

// --- Component Data ---
const featureCards = [
    { title: "Talk to Emotica", description: "Have a private, judgment-free conversation...", icon: "🤖" },
    { title: "Digital Journaling", description: "Express your thoughts and track your emotional journey...", icon: "✍️" },
    { title: "Guided Activities", description: "Access guided breathing exercises and meditations...", icon: "🧘" }
];
const footerLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Contact Us", href: "#" }
];

export default function Index() {
    const [showAuthModal, setShowAuthModal] = useState(false);
    
    // --- State for the entire assessment flow ---
    const [assessmentState, setAssessmentState] = useState<'idle' | 'fetching' | 'active' | 'submitting' | 'complete'>('idle');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [result, setResult] = useState<Result | null>(null);
    const [error, setError] = useState<string | null>(null);

    // --- All your functions (startAssessment, handleAnswerSelect, etc.) remain the same ---
    const startAssessment = async () => {
        setAssessmentState('fetching');
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/assessment/questions');
            if (!response.ok) throw new Error('Could not start the assessment. Please try again.');
            const data: Question[] = await response.json();
            setQuestions(data);
            setCurrentQuestionIndex(0);
            setUserAnswers([]);
            setResult(null);
            setAssessmentState('active');
        } catch (err: any) {
            setError(err.message);
            setAssessmentState('idle');
        }
    };

    const handleAnswerSelect = (answer: string) => {
        const newAnswers = [...userAnswers, answer];
        setUserAnswers(newAnswers);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            submitAssessment(newAnswers);
        }
    };

    const submitAssessment = async (finalAnswers: string[]) => {
        setAssessmentState('submitting');
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/assessment/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: finalAnswers }),
            });
            if (!response.ok) throw new Error('Could not process your results.');
            const data: Result = await response.json();
            setResult(data);
            setAssessmentState('complete');
        } catch (err: any) {
            setError(err.message);
            setAssessmentState('active');
        }
    };

    const resetAssessment = () => {
        setAssessmentState('idle');
        setQuestions([]);
        setCurrentQuestionIndex(0);
    };


    // --- RENDER DIFFERENT VIEWS BASED ON STATE ---

    if (assessmentState === 'active' && questions.length > 0) {
        const currentQuestion = questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        return (
            <main className="py-10 px-4 bg-[#4F6483] min-h-screen flex flex-col items-center justify-center">
                <div className="w-full max-w-2xl">
                    <div className="w-full bg-gray-600 rounded-full h-2.5 mb-6"><div className="bg-purple-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{currentQuestion.question}</h2>
                        <div className="space-y-4">
                            {currentQuestion.options.map((opt) => (
                                <button key={opt.text} onClick={() => handleAnswerSelect(opt.text)} className="w-full text-left p-4 rounded-lg border border-gray-300 hover:bg-purple-100 hover:border-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500">{opt.text}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        );
    }
    
    // ✅ FIX 2: UPDATE THE RESULT SCREEN JSX
    if (assessmentState === 'complete' && result) {
       return (
          <main className="py-16 px-4 bg-[#4F6483] min-h-screen flex items-center justify-center">
              <div className="container mx-auto max-w-2xl bg-white p-10 rounded-xl shadow-lg text-center">
                  <h2 className="text-2xl font-bold text-gray-600 mb-2">Your Check-in Result</h2>
                  <p className="text-5xl font-extrabold text-purple-700 mb-4">{result.mood}</p>
                  <p className="text-gray-600 mb-6">{result.description}</p>
                  
                  {/* NEW SUGGESTION BOX */}
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg text-left border-l-4 border-purple-400">
                      <p className="font-semibold text-purple-800">Here's a small suggestion:</p>
                      <p className="text-purple-700 mt-1">{result.suggestion}</p>
                  </div>

                  <button onClick={resetAssessment} className="mt-8 px-8 py-3 bg-purple-600 text-white font-bold rounded-full shadow-lg transition-all hover:bg-purple-700">
                      Done
                  </button>
              </div>
          </main>
      );
    }

    // --- RENDER THE FULL LANDING PAGE WHEN 'idle', 'fetching', or 'submitting' ---
    return (
        <>
            <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-neutral-300">
                <div className="">
                    <img src="https://cdn.builder.io/api/v1/image/assets%2F6633200b88854ecb85d819712761f1b4%2F7454e5b05c4045b5891a0d2796ffad2f?format=webp&width=800" alt="Hands reaching towards the sky" className="absolute inset-0 h-full w-full object-cover" loading="eager"/>
                    <div className="absolute inset-x-0 bottom-0 h-[90px] bg-gradient-to-t from-[#4F6483] to-transparent"></div>
                </div>
                <div className="relative z-10 px-6 w-full text-center">
                    <h1 className="text-white font-extrabold tracking-tight drop-shadow-xl leading-[0.95] text-4xl sm:text-6xl md:text-7xl lg:text-8xl">
                        Uncover Complete<br className="hidden sm:block" /> Wellness and Healing
                    </h1>
                    <div className="mt-10 flex items-center justify-center gap-4 flex-wrap pt-10">
                        <Link to="/emotica" className="rounded-full border border-white/25 bg-black/40 px-6 py-3 text-sm md:text-base font-semibold tracking-widest uppercase text-white backdrop-blur-md hover:bg-black/50 transition-colors">Ask Emotica</Link>
                        <button onClick={startAssessment} disabled={assessmentState === 'fetching'} className="rounded-full border border-white/25 bg-black/40 px-6 py-3 text-sm md:text-base font-semibold tracking-widest uppercase text-white backdrop-blur-md hover:bg-black/50 transition-colors disabled:bg-gray-500">
                            {assessmentState === 'fetching' ? 'LOADING...' : 'Take Assessment'}
                        </button>
                    </div>
                    {error && <p className="mt-4 text-red-300 bg-black/50 rounded-md p-2">{error}</p>}
                </div>
            </section>
            
            <main className="py-16 px-4 sm:px-6 lg:px-8 bg-[#4F6483]">
                <div className="container mx-auto max-w-7xl">
                    <h2 className="text-4xl font-extrabold text-center text-gray-100 mb-12">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {featureCards.map((card, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
                                <div className="text-5xl mb-4">{card.icon}</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{card.title}</h3>
                                <p className="text-gray-600">{card.description}</p>
                            </div>
                        ))}
                    </div>
                    <section className="mt-20 bg-purple-50 rounded-2xl p-10 sm:p-16 text-center shadow-lg">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-purple-900 mb-4">Ready to Start Your Journey?</h2>
                        <p className="text-purple-700 max-w-2xl mx-auto mb-8">Join thousands of people who are finding clarity and peace with Emotica AI. It's free to get started.</p>
                        <button onClick={() => setShowAuthModal(true)} className="px-8 py-4 bg-purple-600 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:bg-purple-700">
                            Sign Up Now
                        </button>
                    </section>
                </div>
            </main>
            <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <span className="text-xl font-bold text-white">Emotica</span>
                        <p className="text-sm">&copy; 2025 Emotica AI. All rights reserved.</p>
                    </div>
                    <div className="flex flex-wrap justify-center space-x-6 sm:space-x-8">
                        {footerLinks.map((link, index) => (<a key={index} href={link.href} className="text-sm hover:text-white transition-colors">{link.label}</a>))}
                    </div>
                </div>
            </footer>
            <AuthPage isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}