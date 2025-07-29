import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Users, Mail, Smartphone } from "lucide-react";
import { useEffect } from "react";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-ivory min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-5xl font-bold wine mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: January 25, 2025
          </p>
        </div>

        <div className="space-y-8">
          {/* Information We Collect */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-wine/10 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-wine" />
                </div>
                <CardTitle className="text-2xl font-playfair wine">Information We Collect</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Name and contact information (email, phone, address)</li>
                  <li>• Payment information (processed securely through our payment providers)</li>
                  <li>• Order history and preferences</li>
                  <li>• Account credentials and profile information</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Automatically Collected Information</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• IP address and device information</li>
                  <li>• Browser type and operating system</li>
                  <li>• Pages visited and time spent on our site</li>
                  <li>• Referring website and search terms used</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-wine/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-wine" />
                </div>
                <CardTitle className="text-2xl font-playfair wine">How We Use Your Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>Process and fulfill your orders</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>Communicate with you about your orders and account</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>Send promotional emails (with your consent)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>Improve our website and customer service</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>Comply with legal obligations and prevent fraud</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-wine/10 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-wine" />
                </div>
                <CardTitle className="text-2xl font-playfair wine">Information Sharing</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>With service providers who help us operate our business (payment processors, shipping companies)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>When required by law or to protect our rights</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>In connection with a business transfer or merger</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-wine/10 rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 text-wine" />
                </div>
                <CardTitle className="text-2xl font-playfair wine">Data Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>SSL encryption for data transmission</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>Secure servers and databases</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>Regular security audits and updates</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>Restricted access to personal information</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-wine/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-wine" />
                </div>
                <CardTitle className="text-2xl font-playfair wine">Your Rights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 mb-4">You have the following rights regarding your personal information:</p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>Access and review your personal information</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>Update or correct your information</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>Delete your account and personal information</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>Opt out of marketing communications</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-wine rounded-full mt-2 flex-shrink-0"></span>
                  <span>Request a copy of your data</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-wine/10 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-wine" />
                </div>
                <CardTitle className="text-2xl font-playfair wine">Cookies and Tracking</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.
              </p>
              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold text-wine mb-2">Types of Cookies We Use:</h4>
                <ul className="text-gray-700 space-y-1">
                  <li>• Essential cookies for site functionality</li>
                  <li>• Analytics cookies to understand site usage</li>
                  <li>• Preference cookies to remember your settings</li>
                  <li>• Marketing cookies for personalized ads (with consent)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-wine/10 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-wine" />
                </div>
                <CardTitle className="text-2xl font-playfair wine">Contact Us</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have questions about this Privacy Policy or want to exercise your rights, please contact us:
              </p>
              <div className="bg-pink-50 p-4 rounded-lg">
                <p className="text-gray-700 font-semibold">GlintShades Privacy Team</p>
                <p className="text-gray-700">Email: privacy@glintshades.com</p>
                <p className="text-gray-700">Phone: 1-800-GLINT-SH (454-6874)</p>
                <p className="text-gray-700">Response time: Within 5 business days</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 p-6 bg-pink-50 rounded-lg">
          <p className="text-gray-600">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by email or through our website.
          </p>
        </div>
      </div>
    </div>
  );
}