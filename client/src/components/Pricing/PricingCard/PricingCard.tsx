import { FcInfo } from 'react-icons/fc';
import { PricingCardProps } from '../PricingInterface';

const PricingCard = ({ name, Price, description, index }: PricingCardProps) => {
  return (
    <div
      key={index}
      className="border py-10 md:px-6 px-4 rounded-lg shadow-3xl transform transition-transform duration-300 hover:scale-105"
    >
      <h3 className="text-3xl font-bold text-center text-[#010851]">{name}</h3>
      <p className="text-tertiary text-center my-6">{description}</p>
      <p className="mt-5 text-center text-black text-4xl font-bold">${Price}</p>
      
      <ul className="mt-4 space-y-2 px-4">
        <li className="flex items-center">
          <FcInfo className="mr-2 text-xl" />
          Videos of Lessons
        </li>
      </ul>

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
