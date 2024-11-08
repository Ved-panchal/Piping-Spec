import { CircleCheck } from 'lucide-react';
import { PricingCardProps } from '../../../utils/interface';

const PricingCard = ({ name, Price, benefits, index, showButton, openModal }: PricingCardProps) => {
  return (
    <div className={`border py-10 md:px-6 px-4 rounded-lg shadow-3xl flex flex-col justify-between h-full transition-all duration-400 ease-in-out ${showButton? "hover:scale-105":""}`}>
      {/* Card Content */}
      <div>
        <h3 className="text-3xl font-bold text-center text-[#010851]">{name}</h3>
        <p className="mt-5 text-center text-black text-4xl font-bold">${Price}</p>

        {/* Benefits List */}
        <ul className="mt-4 space-y-2">
          {benefits.map((benefit: string, index) => (
            <li key={index} className="flex text-sm justify-start">
              <div className="h-5 w-5 mr-1">
                <CircleCheck size={20} strokeWidth={1} />
              </div>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Button: Conditionally render based on showButton prop */}
      {showButton && (
        <div className="w-full mx-auto flex items-center justify-center mt-5">
          <button
            className="mt-6 px-10 text-black py-2 border border-black hover:bg-black hover:text-white font-semibold rounded-lg"
            onClick={() => openModal?.(index)} 
          >
            Get Started
          </button>
        </div>
      )}
    </div>
  );
};

export default PricingCard;
