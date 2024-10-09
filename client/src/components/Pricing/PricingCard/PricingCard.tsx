// import { FcInfo } from 'react-icons/fc';
import { PricingCardProps } from '../PricingInterface';
import { CircleCheck } from 'lucide-react';

const PricingCard = ({ name, Price, benefits }: PricingCardProps) => {
  return (
    <div
      className="border py-10 md:px-6 px-4 rounded-lg shadow-3xl transform transition-transform duration-300 hover:scale-105 flex flex-col justify-between h-full"
    >
      {/* Card Content */}
      <div>
        <h3 className="text-3xl font-bold text-center text-[#010851]">{name}</h3>
        {/* <p className="text-tertiary text-center my-6">{description}</p> */}
        <p className="mt-5 text-center text-black text-4xl font-bold">${Price}</p>
      
        {/* Benefits List */}
        <ul className="mt-4 space-y-2">
          {benefits.map((benefit: string, index) => (
            <li key={index} className="flex text-sm justify-start">
              {/* <FcInfo className="mr-2" /> Icon Size Uniform */}
              <div className='h-5 w-5 mr-1'>
              <CircleCheck size={20} strokeWidth={1} />
              </div>
              <span className='flex justify-start text-justify'>
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Button */}
      <div className="w-full mx-auto flex items-center justify-center mt-5">
        <button className="mt-6 px-10 text-black py-2 border border-black hover:bg-black hover:text-white font-semibold rounded-lg">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default PricingCard;
