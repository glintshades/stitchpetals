import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, RotateCcw, Clock, Shield, Package, CreditCard } from "lucide-react";

export default function ShippingReturns() {
  return (
    <div className="bg-ivory min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-5xl font-bold wine mb-4">
            Shipping & Returns
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about delivering our handcrafted crochet flowers to your doorstep
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Shipping Information */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-wine/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-wine" />
              </div>
              <CardTitle className="text-2xl font-playfair wine">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-wine mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Processing Time</h3>
                  <p className="text-gray-600">3-5 business days for handcrafted items</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-wine mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Shipping Methods</h3>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Standard Shipping (5-7 days): $5.99</li>
                    <li>• Express Shipping (2-3 days): $12.99</li>
                    <li>• Overnight Shipping: $24.99</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-wine mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Free Shipping</h3>
                  <p className="text-gray-600">Free standard shipping on orders over $75</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Returns Information */}
          <Card className="border-wine/20 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-wine/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-wine" />
              </div>
              <CardTitle className="text-2xl font-playfair wine">Returns & Exchanges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-wine mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Return Policy</h3>
                  <p className="text-gray-600">30-day return window for unused items in original condition</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-wine mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Return Process</h3>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Contact us for return authorization</li>
                    <li>• Package items securely</li>
                    <li>• Include original receipt</li>
                    <li>• Ship to provided address</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-wine mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Refund Timeline</h3>
                  <p className="text-gray-600">3-5 business days after we receive your return</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card className="border-wine/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-playfair wine text-center">Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="font-semibold text-wine mb-2">Handcrafted Items</h3>
              <p className="text-gray-700">
                Each item is lovingly handcrafted to order. Slight variations in color and design are natural 
                characteristics that make each piece unique and special.
              </p>
            </div>
            
            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="font-semibold text-wine mb-2">Care Instructions</h3>
              <p className="text-gray-700">
                Our crochet flowers are made with premium cotton yarn. Spot clean gently with mild soap and 
                water. Avoid machine washing. Store in a cool, dry place away from direct sunlight.
              </p>
            </div>

            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="font-semibold text-wine mb-2">International Shipping</h3>
              <p className="text-gray-700">
                We currently ship within the United States only. International shipping options are coming soon. 
                Please contact us for special requests.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Have questions about shipping or returns?
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center px-6 py-3 bg-wine text-white rounded-lg hover:bg-dark-wine transition-colors"
          >
            Contact Our Support Team
          </a>
        </div>
      </div>
    </div>
  );
}