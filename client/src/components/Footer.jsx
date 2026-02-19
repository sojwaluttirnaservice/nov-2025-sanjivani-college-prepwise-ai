import clientConfig from '../config/clientConfig'
import { Link } from 'react-router-dom'
import Container from './utils/Container'

const Footer = () => {
    const appNameParts = clientConfig.APP_NAME.split(' ')
    const firstPart = appNameParts.slice(0, -1).join(' ') || appNameParts[0]
    const lastPart = appNameParts.length > 1 ? appNameParts[appNameParts.length - 1] : ''

    return (
        <footer className="mt-auto bg-gray-50 border-t border-gray-100 pt-16 pb-8">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link to={'/'} className="flex items-center gap-2 group">
                            <div className="bg-indigo-600 text-white p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">
                                {firstPart} {lastPart && <span className="text-indigo-600">{lastPart}</span>}
                            </span>
                        </Link>
                        <p className="text-gray-500 leading-relaxed">
                            Empowering engineering students with personalized AI-based assessments for excellence in semester preparation.
                        </p>
                        <div className="flex gap-4 pt-2">
                            {/* Social Placeholders */}
                            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-400 shadow-sm border border-gray-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                            </a>
                            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-400 shadow-sm border border-gray-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-gray-900 font-bold mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            {['Home', 'About Us', 'Curriculum', 'Assessments'].map((item) => (
                                <li key={item}>
                                    <Link to="/" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Features */}
                    <div>
                        <h3 className="text-gray-900 font-bold mb-6">Key Features</h3>
                        <ul className="space-y-3">
                            {['AI Assessments', 'Weak Topic Analysis', 'Performance Tracking', 'Academic Insights'].map((item) => (
                                <li key={item}>
                                    <Link to="/" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-gray-900 font-bold mb-6">Support</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-500">
                                <svg className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                <span>Kopargaon, Maharashtra</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500">
                                <svg className="w-5 h-5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                <span>support@prepwiseai.edu</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} {clientConfig.APP_NAME}. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-400">
                        <Link to="/" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
                        <Link to="/" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </Container>
        </footer>
    )
}

export default Footer