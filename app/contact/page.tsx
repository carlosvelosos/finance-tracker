"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Github, Linkedin } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-green-400">
            Get in Touch
          </h1>
          <p className="text-gray-400 text-lg">
            Have questions or feedback? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Email Card */}
          <Card className="bg-[#1E1E1E] border-gray-700 hover:border-green-500 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-400">
                <Mail size={24} />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Send us an email and we&apos;ll get back to you as soon as
                possible.
              </p>
              <Link
                href="mailto:contact@financetracker.com"
                className="text-green-400 hover:text-green-300 transition-colors underline"
              >
                contact@financetracker.com
              </Link>
            </CardContent>
          </Card>

          {/* GitHub Card */}
          <Card className="bg-[#1E1E1E] border-gray-700 hover:border-green-500 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-400">
                <Github size={24} />
                GitHub
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Check out our code, report issues, or contribute to the project.
              </p>
              <Link
                href="https://github.com/carlosvelosos/finance-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 transition-colors underline"
              >
                View on GitHub
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="bg-[#1E1E1E] border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-green-400">
              Send us a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-2 bg-[#121212] border border-gray-600 rounded-lg focus:outline-none focus:border-green-500 text-white"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 bg-[#121212] border border-gray-600 rounded-lg focus:outline-none focus:border-green-500 text-white"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-2 bg-[#121212] border border-gray-600 rounded-lg focus:outline-none focus:border-green-500 text-white"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full px-4 py-2 bg-[#121212] border border-gray-600 rounded-lg focus:outline-none focus:border-green-500 text-white resize-none"
                  placeholder="Tell us what's on your mind..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Send Message
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>We typically respond within 24-48 hours during business days.</p>
        </div>
      </div>
    </div>
  );
}
