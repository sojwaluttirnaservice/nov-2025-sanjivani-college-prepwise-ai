import React from 'react';
import Container from '../../components/utils/Container';

const AboutPage = () => {
    return (
        <div className="py-20">
            <Container>
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold text-slate-900 mb-6 font-sans">About PrepWise AI</h1>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                        PrepWise AI is an initiative to help engineering students bridge the gap between curriculum and exam preparation. Our system uses artificial intelligence to generate high-quality assessments that mirror actual exam standards.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h3>
                            <p className="text-slate-600">To provide every student with personalized learning insights that help them achieve academic excellence.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Why AI?</h3>
                            <p className="text-slate-600">AI allows us to generate infinite variations of questions, ensuring that testing is always fresh and tailored to the latest syllabus.</p>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default AboutPage;