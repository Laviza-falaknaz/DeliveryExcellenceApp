import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import disassemblyImage from "@assets/1PS_5162_Disassembly Other_1759312369804.jpg";
import inspectionImage from "@assets/1PS_4937_Staged Quality Control_1759312556402.jpg";
import restorationImage from "@assets/1PS_4970_Circular Computing - Conveyor Belt_1759312597292.jpg";
import testingImage from "@assets/1PS_5065_Circular Computing - Laptop Testing Row - 1p_1759312638169.jpg";

type RemanufacturedTip = {
  id: number;
  title: string;
  content: string;
  icon: string;
  category: string;
  categoryColor: string;
  displayOrder: number;
  isActive: boolean;
};

export default function Remanufactured() {
  const [currentTip, setCurrentTip] = useState(0);
  const [currentVideo, setCurrentVideo] = useState(0);
  
  const { data: tips = [], isLoading: tipsLoading } = useQuery<RemanufacturedTip[]>({
    queryKey: ["/api/remanufactured-tips"],
  });

  const nextTip = () => {
    if (tips.length > 0) {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }
  };

  const prevTip = () => {
    if (tips.length > 0) {
      setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);
    }
  };

  // YouTube videos data from provided links
  const videos = [
    {
      id: "u7IOWNV2zFU",
      title: "The Remanufacturing Process",
      description: "See how we transform used laptops into like-new devices",
      embedUrl: "https://www.youtube.com/embed/u7IOWNV2zFU"
    },
    {
      id: "6pOqhKEHiNE",
      title: "Quality Testing & Certification", 
      description: "Our comprehensive testing process ensures reliability",
      embedUrl: "https://www.youtube.com/embed/6pOqhKEHiNE"
    },
    {
      id: "Q9Kfc9S6AOQ",
      title: "Environmental Impact",
      description: "How remanufactured laptops help save the planet",
      embedUrl: "https://www.youtube.com/embed/Q9Kfc9S6AOQ"
    },
    {
      id: "P8ouoPRbLiM",
      title: "Sustainability in Action",
      description: "Our commitment to circular economy and environmental responsibility",
      embedUrl: "https://www.youtube.com/embed/P8ouoPRbLiM"
    }
  ];

  const nextVideo = () => {
    setCurrentVideo((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentVideo((prev) => (prev - 1 + videos.length) % videos.length);
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
              <div className="text-center p-4 border rounded-lg relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${disassemblyImage})`,
                    opacity: 0.15
                  }}
                />
                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{backgroundColor: '#FF9E1C20', color: '#FF9E1C'}}>
                    <i className="ri-tools-line text-xl"></i>
                  </div>
                  <h4 className="font-medium mb-2">1. Disassembly</h4>
                  <p className="text-sm text-neutral-600">Complete breakdown into individual components for thorough inspection</p>
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${inspectionImage})`,
                    opacity: 0.15
                  }}
                />
                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{backgroundColor: '#30526920', color: '#305269'}}>
                    <i className="ri-search-line text-xl"></i>
                  </div>
                  <h4 className="font-medium mb-2">2. Inspection</h4>
                  <p className="text-sm text-neutral-600">Detailed analysis of every component using advanced diagnostic tools</p>
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${restorationImage})`,
                    opacity: 0.15
                  }}
                />
                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{backgroundColor: '#08ABAB20', color: '#08ABAB'}}>
                    <i className="ri-refresh-line text-xl"></i>
                  </div>
                  <h4 className="font-medium mb-2">3. Restoration</h4>
                  <p className="text-sm text-neutral-600">Replacement of worn parts and upgrade to latest specifications</p>
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${testingImage})`,
                    opacity: 0.15
                  }}
                />
                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{backgroundColor: '#8f4c8b20', color: '#8f4c8b'}}>
                    <i className="ri-shield-check-line text-xl"></i>
                  </div>
                  <h4 className="font-medium mb-2">4. Testing</h4>
                  <p className="text-sm text-neutral-600">Comprehensive quality assurance testing before certification</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Benefits of Choosing Remanufactured</CardTitle>
            <CardDescription>
              Why remanufactured laptops are the smart choice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full space-y-3">
              <AccordionItem value="cost-savings" className="border rounded-lg px-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-md transition-all">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                      <i className="ri-money-dollar-circle-line text-xl"></i>
                    </div>
                    <span className="font-semibold text-lg">Cost Savings & Value</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 text-neutral-700 pl-14 pr-4 pb-2">
                    <p className="text-base font-medium">Remanufactured laptops offer exceptional value while maintaining premium quality:</p>
                    <div className="grid gap-2">
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-green-600 text-lg mt-0.5"></i>
                        <span>40-60% cost savings compared to new equivalent models</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-green-600 text-lg mt-0.5"></i>
                        <span>Same performance specifications as original new devices</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-green-600 text-lg mt-0.5"></i>
                        <span>Lower total cost of ownership over device lifecycle</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-green-600 text-lg mt-0.5"></i>
                        <span>Predictable budgeting with transparent pricing</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-green-600 text-lg mt-0.5"></i>
                        <span>Higher return on investment for business deployments</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="sustainability" className="border rounded-lg px-4 bg-gradient-to-r from-teal-50 to-cyan-50 hover:shadow-md transition-all">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#08ABAB] flex items-center justify-center text-white flex-shrink-0">
                      <i className="ri-leaf-line text-xl"></i>
                    </div>
                    <span className="font-semibold text-lg">Environmental Sustainability</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 text-neutral-700 pl-14 pr-4 pb-2">
                    <p className="text-base font-medium">Every remanufactured laptop creates significant positive environmental impact:</p>
                    <div className="grid gap-2">
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-[#08ABAB] text-lg mt-0.5"></i>
                        <span>Prevents electronic waste from entering landfills</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-[#08ABAB] text-lg mt-0.5"></i>
                        <span>Reduces demand for new raw material extraction</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-[#08ABAB] text-lg mt-0.5"></i>
                        <span>Minimizes manufacturing-related carbon emissions</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-[#08ABAB] text-lg mt-0.5"></i>
                        <span>Supports circular economy principles</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-[#08ABAB] text-lg mt-0.5"></i>
                        <span>Contributes to UN Sustainable Development Goals</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-[#08ABAB] text-lg mt-0.5"></i>
                        <span>Partnership with charity: water provides clean water access</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="reliability" className="border rounded-lg px-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md transition-all">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                      <i className="ri-shield-check-line text-xl"></i>
                    </div>
                    <span className="font-semibold text-lg">Reliability & Performance</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 text-neutral-700 pl-14 pr-4 pb-2">
                    <p className="text-base font-medium">Our remanufacturing process ensures optimal reliability:</p>
                    <div className="grid gap-2">
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-blue-600 text-lg mt-0.5"></i>
                        <span>Comprehensive 100+ point inspection process</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-blue-600 text-lg mt-0.5"></i>
                        <span>Replacement of all wear-prone components</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-blue-600 text-lg mt-0.5"></i>
                        <span>Latest firmware and security updates installed</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-blue-600 text-lg mt-0.5"></i>
                        <span>Stress testing under various operational conditions</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-blue-600 text-lg mt-0.5"></i>
                        <span>Quality certification equivalent to new products</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-blue-600 text-lg mt-0.5"></i>
                        <span>Extended warranty options available</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="business-benefits" className="border rounded-lg px-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:shadow-md transition-all">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#FF9E1C] flex items-center justify-center text-white flex-shrink-0">
                      <i className="ri-briefcase-line text-xl"></i>
                    </div>
                    <span className="font-semibold text-lg">Business & Corporate Benefits</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 text-neutral-700 pl-14 pr-4 pb-2">
                    <p className="text-base font-medium">Remanufactured laptops provide strategic advantages for organizations:</p>
                    <div className="grid gap-2">
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-[#FF9E1C] text-lg mt-0.5"></i>
                        <span>Enhanced corporate sustainability reporting</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-[#FF9E1C] text-lg mt-0.5"></i>
                        <span>Reduced IT procurement budgets with maintained quality</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-[#FF9E1C] text-lg mt-0.5"></i>
                        <span>Fast deployment with immediate availability</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-[#FF9E1C] text-lg mt-0.5"></i>
                        <span>Simplified asset management and lifecycle planning</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-[#FF9E1C] text-lg mt-0.5"></i>
                        <span>Support for ESG (Environmental, Social, Governance) goals</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-check-line text-[#FF9E1C] text-lg mt-0.5"></i>
                        <span>Professional services and bulk deployment support</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        {/* Tips and Hints Carousel */}
        <Card>
          <CardHeader>
            <CardTitle>Tips for Setting Up Remanufactured Laptops</CardTitle>
            <CardDescription>
              Quick tips if you're new to the world of remanufactured laptops
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden rounded-lg">
                {tipsLoading ? (
                  <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-center py-8">
                      <p className="text-gray-500">Loading tips...</p>
                    </div>
                  </div>
                ) : tips.length === 0 ? (
                  <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-center py-8">
                      <p className="text-gray-500">No tips available at the moment.</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentTip * 100}%)` }}
                  >
                    {tips.map((tip, index) => {
                      const color = tip.categoryColor || "#08ABAB";
                      return (
                      <div key={tip.id} className="w-full flex-shrink-0">
                        <div 
                          className="bg-gradient-to-br p-6 rounded-lg border"
                          style={{ 
                            backgroundColor: `${color}0D`,
                            borderColor: `${color}33`
                          }}
                        >
                          <div className="flex items-start space-x-4">
                            <div 
                              className="h-12 w-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
                              style={{ backgroundColor: color }}
                            >
                              <i className={`${tip.icon} text-xl`}></i>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-lg text-neutral-900">{tip.title}</h4>
                                <span 
                                  className="text-xs font-medium px-2 py-1 rounded-full"
                                  style={{ 
                                    backgroundColor: `${color}33`,
                                    color: color
                                  }}
                                >
                                  {tip.category}
                                </span>
                              </div>
                              <p className="text-neutral-700 leading-relaxed">{tip.content}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Navigation Controls */}
              {!tipsLoading && tips.length > 0 && (
              <>
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevTip}
                  className="flex items-center space-x-2 bg-[#08ABAB] border-[#08ABAB] text-white hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors"
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
                  className="flex items-center space-x-2 bg-[#08ABAB] border-[#08ABAB] text-white hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors"
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
              </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* YouTube Videos Carousel */}
        <Card id="podcasts">
          <CardHeader>
            <CardTitle>Sustainable IT in Conversation - The Podcast</CardTitle>
            <CardDescription>
              Hear industry leaders dig into the real problems within IT sustainability and the solutions that actually work.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Video Carousel Container */}
              <div className="overflow-hidden rounded-lg">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentVideo * 100}%)` }}
                >
                  {videos.map((video, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                      <div className="bg-neutral-50 rounded-lg border overflow-hidden">
                        {/* Video Embed */}
                        <div className="aspect-video bg-neutral-200">
                          <iframe
                            src={video.embedUrl}
                            title={video.title}
                            className="w-full h-full rounded-lg"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Video Navigation Controls */}
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevVideo}
                  className="flex items-center space-x-2 bg-[#08ABAB] border-[#08ABAB] text-white hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors"
                >
                  <i className="ri-arrow-left-line"></i>
                  <span>Previous</span>
                </Button>
                
                {/* Video Dots Indicator */}
                <div className="flex space-x-2">
                  {videos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentVideo(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentVideo 
                          ? 'bg-[#08ABAB]' 
                          : 'bg-neutral-300 hover:bg-neutral-400'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextVideo}
                  className="flex items-center space-x-2 bg-[#08ABAB] border-[#08ABAB] text-white hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors"
                >
                  <span>Next</span>
                  <i className="ri-arrow-right-line"></i>
                </Button>
              </div>
              
              {/* Video Counter */}
              <div className="text-center mt-3">
                <span className="text-sm text-neutral-500">
                  Video {currentVideo + 1} of {videos.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}