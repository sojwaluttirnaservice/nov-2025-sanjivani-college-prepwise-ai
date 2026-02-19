import clientConfig from '../config/clientConfig'
import { Link } from 'react-router-dom'
import Container from './utils/Container'
import { GraduationCap, Linkedin, Twitter, MapPin, Mail } from 'lucide-react'

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
                                <GraduationCap className="w-6 h-6" />
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
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-400 shadow-sm border border-gray-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300">
                                <Twitter className="w-5 h-5" />
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
                                <MapPin className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                                <span>Kopargaon, Maharashtra</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500">
                                <Mail className="w-5 h-5 text-indigo-600 shrink-0" />
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