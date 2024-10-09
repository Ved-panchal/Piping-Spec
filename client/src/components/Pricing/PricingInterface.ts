export interface Plan {
    name: string;
    Price: number;
    description: string;
    benefits: Array<string>;
  }

export  interface PricingCardProps {
    name: string;
    Price: number;
    description: string;
    benefits:Array<string>;
    index: number;
  }