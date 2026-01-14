import Container from '../../components/utils/Container'
import { BookOpen, Target, Brain, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import clientConfig from '../../config/clientConfig'

const FeatureCard = ({ icon: Icon, title, description, color }) => {
    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className={`w-12 h-12 bg-${color}-50 text-${color}-600 rounded-xl flex items-center justify-center mb-6`}>
                <Icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>
    );
};

const HomePage = () => {
    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-slate-50 py-20 lg:py-32 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-3xl opacity-30 z-0"></div>

                <Container className="relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            AI-Powered Semester Prep
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight leading-tight">
                            Master Your Exams with <span className="text-indigo-600">Smart AI Insights</span>
                        </h1>

                        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                            Personalized assessments, weak area analysis, and curriculum-mapped questions designed for Sanjivani engineering students.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/auth/register" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                                Get Started Free
                                <ArrowRight size={20} />
                            </Link>
                            <Link to="/about" className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl border border-slate-200 transition-all">
                                Explore Curriculum
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why {clientConfig.APP_NAME}?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">We use advanced AI to help you focus on what really matters for your exams.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Brain}
                            title="AI Question Generation"
                            description="Dynamically generated MCQs based on specific units and subjects in your curriculum."
                            color="indigo"
                        />
                        <FeatureCard
                            icon={Target}
                            title="Weak Topic Analysis"
                            description="Identify exactly where you need more practice with our detailed performance insights."
                            color="indigo"
                        />
                        <FeatureCard
                            icon={BookOpen}
                            title="Academic Structure"
                            description="Fully mapped to your college branch, semester, and individual subjects."
                            color="indigo"
                        />
                    </div>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-slate-900 text-white">
                <Container>
                    <div className="bg-indigo-600 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-indigo-900/20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Stop guessing. <br className="hidden md:block" /> Start preparing smartly.</h2>
                        <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto relative z-10">
                            Join your fellow engineering students and elevate your preparation today.
                        </p>
                        <Link to="/auth/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-slate-50 transition-all relative z-10 uppercase tracking-wide">
                            Join Now
                        </Link>
                    </div>
                </Container>
            </section>
        </>
    );
};

export default HomePage;