import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Phone, Clock, MapPin, MessageCircle, Heart } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const contactMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    contactMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-ivory">
      {/* Hero Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold wine mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Have questions about our products or need a custom arrangement? We'd love to hear from you! 
              Our team is here to help make your crochet flower dreams come true.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: <Mail className="h-6 w-6" />,
                title: "Email Us",
                details: "hello@glintshades.com",
                description: "Send us a message anytime"
              },
              {
                icon: <Phone className="h-6 w-6" />,
                title: "Call Us",
                details: "+1 (555) 123-4567",
                description: "Speak with our team"
              },
              {
                icon: <Clock className="h-6 w-6" />,
                title: "Business Hours",
                details: "Mon-Fri: 9AM-6PM EST",
                description: "We're here to help"
              },
              {
                icon: <MessageCircle className="h-6 w-6" />,
                title: "Response Time",
                details: "Within 24 hours",
                description: "Quick and friendly service"
              }
            ].map((contact, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="wine mb-4 flex justify-center">{contact.icon}</div>
                  <h3 className="font-playfair text-lg font-semibold wine mb-2">{contact.title}</h3>
                  <p className="font-medium text-gray-800 mb-1">{contact.details}</p>
                  <p className="text-sm text-gray-600">{contact.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gradient-to-br from-soft-pink to-blush">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <Card className="bg-white shadow-xl">
              <CardHeader>
                <CardTitle className="font-playfair text-2xl wine">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="wine font-semibold">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your full name"
                        required
                        className="focus:ring-wine focus:border-wine"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="wine font-semibold">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        className="focus:ring-wine focus:border-wine"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="wine font-semibold">
                      Subject
                    </Label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                      <SelectTrigger className="focus:ring-wine focus:border-wine">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="custom">Custom Order Request</SelectItem>
                        <SelectItem value="product">Product Question</SelectItem>
                        <SelectItem value="wholesale">Wholesale Inquiry</SelectItem>
                        <SelectItem value="shipping">Shipping Question</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message" className="wine font-semibold">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us about your inquiry or custom order requirements..."
                      rows={5}
                      required
                      className="focus:ring-wine focus:border-wine"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full wine-gradient text-white py-3 font-semibold hover:opacity-90 transition-opacity"
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Panel */}
            <div className="space-y-8">
              <div>
                <h2 className="font-playfair text-3xl font-bold wine mb-6">
                  We're Here to Help
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Whether you're looking for the perfect bouquet, need help with a custom order, 
                  or have questions about care instructions, our friendly team is ready to assist you.
                </p>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <Heart className="h-6 w-6 wine" />
                    <h3 className="font-playfair text-xl font-semibold wine">Why Contact Us?</h3>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-2">
                      <span className="wine">•</span>
                      <span>Get personalized product recommendations</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="wine">•</span>
                      <span>Discuss custom color combinations</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="wine">•</span>
                      <span>Learn about bulk order discounts</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="wine">•</span>
                      <span>Get care and maintenance tips</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="wine">•</span>
                      <span>Request custom arrangements</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="font-playfair text-xl font-semibold wine mb-4">Custom Orders</h3>
                <p className="text-gray-700 mb-4">
                  Looking for something special? We work with our artisan partners to create 
                  custom arrangements tailored to your specific needs.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Custom color combinations</p>
                  <p>• Specific flower types</p>
                  <p>• Different sizes and arrangements</p>
                  <p>• Special occasion pieces</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="font-playfair text-xl font-semibold wine mb-4">Wholesale Inquiries</h3>
                <p className="text-gray-700">
                  Interested in stocking our products in your store or need items for events? 
                  Contact us for wholesale pricing and availability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl font-bold wine mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions about our products and services
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: "How long do the flowers last?",
                answer: "Our crochet flowers are designed to last for years with proper care. Unlike fresh flowers, they won't wilt or fade with time."
              },
              {
                question: "Can I customize the colors?",
                answer: "Many of our products offer multiple color options. For custom color combinations, please contact us for availability."
              },
              {
                question: "What materials are used?",
                answer: "We use premium soft cotton yarns that are durable, colorfast, and maintain their shape over time."
              },
              {
                question: "How do I care for my crochet flowers?",
                answer: "Simply dust them regularly with a soft brush. For deeper cleaning, hand wash gently in cool water and lay flat to dry."
              },
              {
                question: "Do you offer international shipping?",
                answer: "Shipping availability depends on our artisan partners. Contact us with your location for specific shipping information."
              },
              {
                question: "What's your return policy?",
                answer: "We want you to love your purchase! Contact us within 14 days if you're not completely satisfied with your order."
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h4 className="font-playfair text-lg font-semibold wine mb-3">{faq.question}</h4>
                  <p className="text-gray-700 text-sm">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
