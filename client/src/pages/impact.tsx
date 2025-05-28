import { useImpact } from "@/hooks/use-impact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { formatEnvironmentalImpact } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Link } from "wouter";

// Mock data for charts - would be replaced by actual data in a real implementation
const monthlyData = [
  { name: "Jan", carbon: 120, water: 1200, minerals: 300 },
  { name: "Feb", carbon: 180, water: 1800, minerals: 380 },
  { name: "Mar", carbon: 220, water: 2100, minerals: 420 },
  { name: "Apr", carbon: 260, water: 2400, minerals: 490 },
  { name: "May", carbon: 290, water: 2700, minerals: 540 },
  { name: "Jun", carbon: 310, water: 2900, minerals: 580 },
];

const materialBreakdown = [
  { name: "Aluminum", value: 35 },
  { name: "Copper", value: 20 },
  { name: "Plastics", value: 25 },
  { name: "Rare Earth", value: 10 },
  { name: "Other", value: 10 },
];

const COLORS = ["#4caf50", "#03a9f4", "#ffa726", "#f44336", "#9c27b0"];

export default function Impact() {
  const { impact, isLoadingImpact } = useImpact();

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-neutral-900">
            Environmental Impact
          </h1>
          <p className="text-neutral-600">
            Track the positive impact of your remanufactured laptop purchases
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
          <Button 
            variant="outline" 
            className="hover:bg-secondary hover:text-white hover:border-secondary transition-all duration-200"
          >
            <i className="ri-download-line mr-2"></i>
            <span>Download Report</span>
          </Button>
          <Button 
            className="hover:bg-secondary/90 transition-all duration-200" 
            asChild
          >
            <Link href="/water-projects">View Water Projects</Link>
          </Button>
        </div>
      </div>

      {/* Impact Summary Cards */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoadingImpact ? (
          <>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </>
        ) : impact ? (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">
                      Total Carbon Saved
                    </h3>
                    <p className="text-3xl font-bold mt-1">
                      {formatEnvironmentalImpact(impact.carbonSaved, "g")}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                    <i className="ri-plant-line text-2xl"></i>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Progress to 1 tonne</span>
                    <span>
                      {Math.round((impact.carbonSaved / 1000000) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(impact.carbonSaved / 1000000) * 100}
                    className="h-2"
                  />
                </div>
                <div className="mt-4 text-sm flex items-center text-success">
                  <i className="ri-arrow-up-line mr-1"></i>
                  <span>
                    Equivalent to planting {impact.treesEquivalent} trees
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">
                      Clean Water Provided
                    </h3>
                    <p className="text-3xl font-bold mt-1">
                      {formatEnvironmentalImpact(impact.waterProvided, "litres")}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <i className="ri-water-flash-line text-2xl"></i>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Impact level</span>
                    <span>High</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="mt-4 text-sm flex items-center text-secondary">
                  <i className="ri-group-line mr-1"></i>
                  <span>Helping {impact.familiesHelped} families</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">
                      Core Minerals Saved
                    </h3>
                    <p className="text-3xl font-bold mt-1">
                      {formatEnvironmentalImpact(impact.mineralsSaved, "g")}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <i className="ri-recycle-line text-2xl"></i>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Impact level</span>
                    <span>Medium</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="mt-4 text-sm flex items-center text-accent">
                  <i className="ri-earth-line mr-1"></i>
                  <span>Reduced mining impact by 68%</span>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="md:col-span-3 p-8 text-center bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-neutral-700">
              No impact data available yet
            </h3>
            <p className="text-neutral-500 mt-2">
              Your environmental impact will appear once you make your first
              order.
            </p>
          </div>
        )}
      </section>

      {/* Impact Trends Chart */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Environmental Impact Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="carbon"
                    stroke="#4caf50"
                    strokeWidth={2}
                    name="Carbon Saved (kg)"
                  />
                  <Line
                    type="monotone"
                    dataKey="water"
                    stroke="#03a9f4"
                    strokeWidth={2}
                    name="Water Provided (L)"
                  />
                  <Line
                    type="monotone"
                    dataKey="minerals"
                    stroke="#ffa726"
                    strokeWidth={2}
                    name="Minerals Saved (g)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Impact Breakdown */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Minerals Saved Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={materialBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {materialBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Water Impact by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Ethiopia", water: 950 },
                    { name: "Rwanda", water: 750 },
                    { name: "Uganda", water: 500 },
                    { name: "Kenya", water: 300 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="water"
                    fill="#0288D1"
                    name="Water Provided (L)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Sustainability Story */}
      <section className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3 md:pr-6">
                <h3 className="text-xl font-semibold mb-4">
                  The Importance of Laptop Remanufacturing
                </h3>
                <p className="text-neutral-700 mb-4">
                  When you choose a remanufactured laptop from Circular
                  Computing, you're making a significant positive impact on the
                  environment. Each remanufactured laptop saves:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2 text-neutral-700">
                  <li>
                    <span className="font-medium">Carbon emissions:</span> Up to
                    316 kg of CO₂ compared to manufacturing a new device
                  </li>
                  <li>
                    <span className="font-medium">Raw materials:</span> Conserves
                    precious metals and minerals including gold, silver, copper,
                    and rare earth elements
                  </li>
                  <li>
                    <span className="font-medium">Water:</span> Approximately
                    190,000 litres of water used in new laptop production
                  </li>
                  <li>
                    <span className="font-medium">E-waste:</span> Prevents
                    electronic waste from ending up in landfills
                  </li>
                </ul>
                <p className="text-neutral-700">
                  Through our partnership with charity: water, each laptop also
                  helps provide clean water to communities in need, multiplying
                  your positive impact.
                </p>
              </div>
              <div className="md:w-1/3 mt-4 md:mt-0 flex items-center justify-center">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="relative w-48 h-48"
                >
                  <svg
                    viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    <path
                      d="M100,10 A90,90 0 1,1 100,190 A90,90 0 1,1 100,10"
                      fill="none"
                      stroke="#e0e0e0"
                      strokeWidth="5"
                    />
                    <path
                      d="M100,10 A90,90 0 1,1 100,190 A90,90 0 1,1 100,10"
                      fill="none"
                      stroke="#4caf50"
                      strokeWidth="10"
                      strokeDasharray="565.2"
                      strokeDashoffset="141.3"
                    />
                    <g transform="translate(100, 100)">
                      <circle r="70" fill="#f5f5f5" />
                      <g transform="translate(-35, -35)">
                        <svg
                          width="70"
                          height="70"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 3C7.58172 3 4 6.58172 4 11V15.0858L3.29289 15.7929C3.10536 15.9804 3 16.2348 3 16.5V18.5C3 19.0523 3.44772 19.5 4 19.5H5.5C6.05228 19.5 6.5 19.0523 6.5 18.5V17H17.5V18.5C17.5 19.0523 17.9477 19.5 18.5 19.5H20C20.5523 19.5 21 19.0523 21 18.5V16.5C21 16.2348 20.8946 15.9804 20.7071 15.7929L20 15.0858V11C20 6.58172 16.4183 3 12 3Z"
                            fill="#4caf50"
                          />
                          <path
                            d="M10.5 20.5C10.5 21.6046 11.3954 22.5 12.5 22.5C13.6046 22.5 14.5 21.6046 14.5 20.5H10.5Z"
                            fill="#4caf50"
                          />
                          <path
                            d="M8 10.5C8.82843 10.5 9.5 9.82843 9.5 9C9.5 8.17157 8.82843 7.5 8 7.5C7.17157 7.5 6.5 8.17157 6.5 9C6.5 9.82843 7.17157 10.5 8 10.5Z"
                            fill="#2e7d32"
                          />
                          <path
                            d="M16 10.5C16.8284 10.5 17.5 9.82843 17.5 9C17.5 8.17157 16.8284 7.5 16 7.5C15.1716 7.5 14.5 8.17157 14.5 9C14.5 9.82843 15.1716 10.5 16 10.5Z"
                            fill="#2e7d32"
                          />
                        </svg>
                      </g>
                    </g>
                  </svg>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section>
        <div className="bg-primary/5 rounded-xl shadow-sm overflow-hidden border border-primary/20 p-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-primary mb-2">
                Share Your Sustainability Journey
              </h3>
              <p className="text-neutral-700 mb-4">
                Your organization's commitment to sustainable IT is making a real
                difference. Become part of our case study program to inspire
                other organizations and showcase your environmental leadership.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/case-studies">Join Case Study Program</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/water-projects">Explore Water Projects</Link>
                </Button>
              </div>
            </div>
            <div className="mt-6 md:mt-0 md:ml-6 flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1616077169586-7e36212c6e83?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
                alt="Eco-friendly technology"
                className="rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
