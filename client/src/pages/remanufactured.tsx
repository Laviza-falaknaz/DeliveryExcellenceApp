import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";

export default function Remanufactured() {
  const [currentTip, setCurrentTip] = useState(0);
  
  const tips = [
    {
      title: "Battery Calibration",
      content: "Your remanufactured laptop may have a new battery. Run a full discharge and charge cycle 2-3 times to calibrate the battery indicator for accurate readings.",
      icon: "ri-battery-charge-line",
      category: "Setup"
    },
    {
      title: "Driver Updates",
      content: "Check for the latest drivers from the manufacturer's website. Remanufactured devices may need specific driver versions for optimal performance.",
      icon: "ri-download-line",
      category: "Configuration"
    },
    {
      title: "Storage Optimization",
      content: "Your device comes with a fresh SSD. Use built-in disk cleanup tools and avoid unnecessary software to maintain peak performance for years to come.",
      icon: "ri-hard-drive-line",
      category: "Maintenance"
    },
    {
      title: "Warranty Registration",
      content: "Register your device immediately to activate warranty coverage. Keep your proof of purchase safe - it's essential for any future support needs.",
      icon: "ri-shield-check-line",
      category: "Important"
    },
    {
      title: "Performance Testing",
      content: "Run stress tests and benchmarks during your first week. This ensures all components are functioning correctly within the return period.",
      icon: "ri-speed-up-line",
      category: "Verification"
    },
    {
      title: "Thermal Management",
      content: "Clean air vents regularly and use on hard surfaces. Remanufactured laptops have optimized cooling, but proper ventilation extends lifespan.",
      icon: "ri-temp-hot-line",
      category: "Care"
    }
  ];

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);
  };

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-neutral-900">Remanufactured Explained</h1>
          <p className="text-neutral-600">Understanding the circular economy approach to sustainable computing</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => window.open('https://circularcomputing.com/contact/', '_blank')}
            variant="outline"
            className="bg-white border-neutral-300 text-neutral-900 hover:bg-[#08ABAB] hover:text-white hover:border-[#08ABAB] transition-colors"
          >
            <i className="ri-phone-line mr-2"></i>
            <span>Contact Us</span>
          </Button>
        </div>
      </div>

      <div className="space-y-6">

        <Card>
          <CardHeader>
            <CardTitle>Our Remanufacturing Process</CardTitle>
            <CardDescription>
              How we transform used laptops into sustainable, high-performance devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-tools-line text-xl"></i>
                </div>
                <h4 className="font-medium mb-2">1. Disassembly</h4>
                <p className="text-sm text-neutral-600">Complete breakdown into individual components for thorough inspection</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-search-line text-xl"></i>
                </div>
                <h4 className="font-medium mb-2">2. Inspection</h4>
                <p className="text-sm text-neutral-600">Detailed analysis of every component using advanced diagnostic tools</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-refresh-line text-xl"></i>
                </div>
                <h4 className="font-medium mb-2">3. Restoration</h4>
                <p className="text-sm text-neutral-600">Replacement of worn parts and upgrade to latest specifications</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-shield-check-line text-xl"></i>
                </div>
                <h4 className="font-medium mb-2">4. Testing</h4>
                <p className="text-sm text-neutral-600">Comprehensive quality assurance testing before certification</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Benefits of Choosing Remanufactured</CardTitle>
            <CardDescription>
              Why remanufactured laptops are the smart choice for businesses and individuals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="cost-savings">
                <AccordionTrigger>Cost Savings & Value</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-neutral-700">
                    <p>Remanufactured laptops offer exceptional value while maintaining premium quality:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>40-60% cost savings compared to new equivalent models</li>
                      <li>Same performance specifications as original new devices</li>
                      <li>Lower total cost of ownership over device lifecycle</li>
                      <li>Predictable budgeting with transparent pricing</li>
                      <li>Higher return on investment for business deployments</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="sustainability">
                <AccordionTrigger>Environmental Sustainability</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-neutral-700">
                    <p>Every remanufactured laptop creates significant positive environmental impact:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Prevents electronic waste from entering landfills</li>
                      <li>Reduces demand for new raw material extraction</li>
                      <li>Minimizes manufacturing-related carbon emissions</li>
                      <li>Supports circular economy principles</li>
                      <li>Contributes to UN Sustainable Development Goals</li>
                      <li>Partnership with charity: water provides clean water access</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="reliability">
                <AccordionTrigger>Reliability & Performance</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-neutral-700">
                    <p>Our remanufacturing process ensures optimal reliability:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Comprehensive 100+ point inspection process</li>
                      <li>Replacement of all wear-prone components</li>
                      <li>Latest firmware and security updates installed</li>
                      <li>Stress testing under various operational conditions</li>
                      <li>Quality certification equivalent to new products</li>
                      <li>Extended warranty options available</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="business-benefits">
                <AccordionTrigger>Business & Corporate Benefits</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-neutral-700">
                    <p>Remanufactured laptops provide strategic advantages for organizations:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Enhanced corporate sustainability reporting</li>
                      <li>Reduced IT procurement budgets with maintained quality</li>
                      <li>Fast deployment with immediate availability</li>
                      <li>Simplified asset management and lifecycle planning</li>
                      <li>Support for ESG (Environmental, Social, Governance) goals</li>
                      <li>Professional services and bulk deployment support</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        {/* Tips and Hints Carousel */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Tips & Best Practices</CardTitle>
            <CardDescription>
              Essential tips for getting the most out of your remanufactured laptop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden rounded-lg">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentTip * 100}%)` }}
                >
                  {tips.map((tip, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                      <div className="bg-gradient-to-br from-[#08ABAB]/5 to-[#08ABAB]/10 p-6 rounded-lg border border-[#08ABAB]/20">
                        <div className="flex items-start space-x-4">
                          <div className="h-12 w-12 rounded-full bg-[#08ABAB] flex items-center justify-center text-white flex-shrink-0">
                            <i className={`${tip.icon} text-xl`}></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-lg text-neutral-900">{tip.title}</h4>
                              <span className="text-xs font-medium px-2 py-1 bg-[#08ABAB]/20 text-[#08ABAB] rounded-full">
                                {tip.category}
                              </span>
                            </div>
                            <p className="text-neutral-700 leading-relaxed">{tip.content}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation Controls */}
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevTip}
                  className="flex items-center space-x-2 bg-white border-neutral-300 text-neutral-900 hover:bg-[#08ABAB] hover:text-white hover:border-[#08ABAB] transition-colors"
                >
                  <i className="ri-arrow-left-line"></i>
                  <span>Previous</span>
                </Button>
                
                {/* Dots Indicator */}
                <div className="flex space-x-2">
                  {tips.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTip(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentTip 
                          ? 'bg-[#08ABAB]' 
                          : 'bg-neutral-300 hover:bg-neutral-400'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextTip}
                  className="flex items-center space-x-2 bg-white border-neutral-300 text-neutral-900 hover:bg-[#08ABAB] hover:text-white hover:border-[#08ABAB] transition-colors"
                >
                  <span>Next</span>
                  <i className="ri-arrow-right-line"></i>
                </Button>
              </div>
              
              {/* Tip Counter */}
              <div className="text-center mt-3">
                <span className="text-sm text-neutral-500">
                  Tip {currentTip + 1} of {tips.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-[#08ABAB]/10 flex items-center justify-center text-[#08ABAB] mb-4">
                <i className="ri-earth-line text-xl"></i>
              </div>
              <h3 className="font-medium mb-2">Our Sustainable IT</h3>
              <p className="text-neutral-600 mb-4 max-w-md">
                Join thousands of customers who have chosen remanufactured laptops for their environmental and economic benefits
              </p>
              <div className="space-y-2 w-full max-w-sm">
                <Button 
                  variant="outline"
                  className="w-full bg-white border-neutral-300 text-neutral-900 hover:bg-[#08ABAB] hover:text-white hover:border-[#08ABAB] transition-colors"
                  asChild
                >
                  <a href="https://circularcomputing.com/remanufactured-laptops/" target="_blank" rel="noopener noreferrer">
                    <i className="ri-shopping-cart-line mr-2"></i>
                    Browse Remanufactured Laptops
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full bg-white border-neutral-300 text-neutral-900 hover:bg-[#08ABAB] hover:text-white hover:border-[#08ABAB] transition-colors"
                  onClick={() => window.open('https://circularcomputing.com/contact/', '_blank')}
                >
                  <i className="ri-question-line mr-2"></i>
                  Ask About Our Process
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}