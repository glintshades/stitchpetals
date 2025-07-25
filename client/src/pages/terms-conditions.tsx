import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Scale, AlertTriangle, CreditCard, Package, Shield } from "lucide-react";
import { useEffect } from "react";

export default function TermsConditions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-ivory min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-5xl font-bold wine mb-4">
            Terms & Conditions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using our website and services.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: January 25, 2025
          </p>
        </div>

        <div className="space-y-8">
          {/* Acceptance of Terms */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-wine/10 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-wine" />
                </div>
                <CardTitle className="text-2xl font-playfair wine">Acceptance of Terms</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                By accessing and using the Stitched Petals website and services, you accept and agree to be bound by the terms and provision of this agreement. These terms apply to all visitors, users, and others who access or use our service.
              </p>
              <p className="text-gray-600">
                If you do not agree to abide by the above, please do not use this service. We reserve the right to change these terms at any time without prior notice.
              </p>
            </CardContent>
          </Card>

          {/* Use of Website */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-wine/10 rounded-full flex items-center justify-center">
                  <Scale className="w-6 h-6 text-wine" />
                </div>
                <CardTitle className="text-2xl font-playfair wine">Use of Website</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Permitted Use</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Browse and purchase our handcrafted crochet products</li>
                  <li>• Create an account to manage your orders and preferences</li>
                  <li>• Contact us with questions or concerns</li>
                  <li>• Share product pages on social media</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Prohibited Use</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Using our content for commercial purposes without permission</li>
                  <li>• Attempting to hack, disrupt, or damage our website</li>
                  <li>• Posting false or misleading information</li>
                  <li>• Violating any applicable laws or regulations</li>
                  <li>• Infringing on intellectual property rights</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-wine/10 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-wine" />
                </div>
                <CardTitle className="text-2xl font-playfair wine">Product Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We strive to provide accurate product descriptions, images, and pricing information. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
              </p>
              
              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold text-wine mb-2">Handcrafted Nature</h4>
                <p className="text-gray-700">
                  All our products are handcrafted and made to order. Slight variations in color, size, and design are natural characteristics that make each piece unique. These variations are not considered defects.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Pricing</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• All prices are in USD and subject to change without notice</li>
                  <li>• Pricing errors will be corrected, and affected orders may be cancelled</li>
                  <li>• Shipping costs and taxes are additional unless stated otherwise</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Orders and Payment */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-wine/10 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-wine" />
                </div>
                <CardTitle className="text-2xl font-playfair wine">Orders and Payment</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Order Acceptance</h3>
                <p className="text-gray-600">
                  Your receipt of an order confirmation does not signify our acceptance of your order. We reserve the right to accept or decline your order for any reason, including availability, errors in product or pricing information, or problems with your payment method.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Payment Terms</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Payment is required at the time of order placement</li>
                  <li>• We accept major credit cards and PayPal</li>
                  <li>• All payments are processed securely through encrypted channels</li>
                  <li>• Orders will not be processed until payment is verified</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Cancellation Policy</h3>
                <p className="text-gray-600">
                  Orders can be cancelled within 24 hours of placement. Once production begins, orders cannot be cancelled due to the custom nature of our handcrafted items.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-wine/10 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-wine" />
                </div>
                <CardTitle className="text-2xl font-playfair wine">Intellectual Property</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                The service and its original content, features, and functionality are and will remain the exclusive property of Stitched Petals and its licensors. The service is protected by copyright, trademark, and other laws.
              </p>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Our Rights</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• All product designs, patterns, and images are our property</li>
                  <li>• The Stitched Petals name and logo are our trademarks</li>
                  <li>• Website content, including text and graphics, is copyrighted</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Your Rights</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Personal, non-commercial use of our website</li>
                  <li>• Sharing product pages on social media with proper attribution</li>
                  <li>• Photographing purchased items for personal use</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-wine/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-wine" />
                </div>
                <CardTitle className="text-2xl font-playfair wine">Limitation of Liability</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                In no event shall Stitched Petals, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
              </p>
              
              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold text-wine mb-2">Maximum Liability</h4>
                <p className="text-gray-700">
                  Our total liability to you for any claim arising from or relating to these terms or our service shall not exceed the amount you paid us for the specific product or service that is the subject of the claim.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-wine/10 rounded-full flex items-center justify-center">
                  <Scale className="w-6 h-6 text-wine" />
                </div>
                <CardTitle className="text-2xl font-playfair wine">Governing Law</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                These terms shall be interpreted and governed by the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these terms will not be considered a waiver of those rights.
              </p>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Dispute Resolution</h3>
                <p className="text-gray-600">
                  Any disputes arising from these terms or your use of our service will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-wine/10 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-wine" />
                </div>
                <CardTitle className="text-2xl font-playfair wine">Changes to Terms</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We reserve the right, at our sole discretion, to modify or replace these terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
              </p>
              
              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold text-wine mb-2">Your Responsibility</h4>
                <p className="text-gray-700">
                  It is your responsibility to check these terms periodically for changes. Your continued use of our service following the posting of any changes constitutes acceptance of those changes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Questions about our Terms & Conditions?
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center px-6 py-3 bg-wine text-white rounded-lg hover:bg-dark-wine transition-colors"
          >
            Contact Our Legal Team
          </a>
        </div>
      </div>
    </div>
  );
}