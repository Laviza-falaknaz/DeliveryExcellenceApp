import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface SupportResourceProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  href: string;
}

function SupportResource({
  icon,
  iconColor,
  iconBgColor,
  title,
  description,
  buttonText,
  buttonColor,
  href,
}: SupportResourceProps) {
  return (
    <Card className="bg-white overflow-hidden border border-neutral-200">
      <CardContent className="p-5">
        <div className="flex items-center mb-4">
          <div
            className={`h-10 w-10 rounded-full ${iconBgColor} flex items-center justify-center ${iconColor} mr-3`}
          >
            <i className={`${icon} text-xl`}></i>
          </div>
          <h3 className="font-semibold text-neutral-900">{title}</h3>
        </div>
        <p className="text-neutral-600 text-sm mb-4">{description}</p>
        <Button
          variant="outline"
          className={`w-full ${buttonColor}`}
          asChild
        >
          {buttonText === "Contact Support" || buttonText === "Contact Sales Team" ? (
            <a href="https://circularcomputing.com/contact/" target="_blank" rel="noreferrer">{buttonText}</a>
          ) : buttonText === "Create RMA" ? (
            <Link href="/warranty-claim">{buttonText}</Link>
          ) : (
            <Link href={href}>{buttonText}</Link>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SupportResources() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SupportResource
        icon="ri-customer-service-2-line"
        iconColor="text-primary"
        iconBgColor="bg-primary/10"
        title="Customer Support"
        description="Need help with setup or having technical issues?"
        buttonText="Contact Support"
        buttonColor="bg-[#08ABAB] text-white border-[#08ABAB] hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors"
        href="/support/new"
      />
      <SupportResource
        icon="ri-refresh-line"
        iconColor="text-accent"
        iconBgColor="bg-accent/10"
        title="Returns & RMA"
        description="Need to return or replace a product?"
        buttonText="Create RMA"
        buttonColor="bg-[#08ABAB] text-white border-[#08ABAB] hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors"
        href="/rma/new"
      />
      <SupportResource
        icon="ri-store-2-line"
        iconColor="text-secondary"
        iconBgColor="bg-secondary/10"
        title="New Order"
        description="Ready to expand your sustainable IT equipment?"
        buttonText="Contact Sales Team"
        buttonColor="bg-[#08ABAB] text-white border-[#08ABAB] hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors"
        href="/orders/new"
      />
    </div>
  );
}
