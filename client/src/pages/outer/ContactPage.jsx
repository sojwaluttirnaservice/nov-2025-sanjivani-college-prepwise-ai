import React from 'react';
import Container from '../../components/utils/Container';
import clientConfig from '../../config/clientConfig';
import { Mail, MapPin } from 'lucide-react';

const ContactPage = () => {
    return (
        <div className="py-20 bg-slate-50 min-h-[70vh]">
            <Container>
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="grid md:grid-cols-2">
                        <div className="p-8 md:p-12 bg-indigo-600 text-white">
                            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
                            <p className="text-indigo-100 mb-8">
                                Have questions about {clientConfig.APP_NAME}? We're here to help you succeed.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-500 p-2 rounded-lg">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <span>support@prepwiseai.edu</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-500 p-2 rounded-lg">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <span>Kopargaon, Maharashtra</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 md:p-12">
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Full Name</label>
                                    <input type="text" className="mt-1 block w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Email Address</label>
                                    <input type="email" className="mt-1 block w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Message</label>
                                    <textarea rows="4" className="mt-1 block w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                                </div>
                                <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-all">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default ContactPage;