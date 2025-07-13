import { CircleCheck, CircleX } from 'lucide-react';
import { PricingCardProps } from '../../../utils/interface';

const PricingCard = ({ name, Price, benefits, index, showButton, openModal }: PricingCardProps) => {
  return (
    <div className={`border bg-blue-50 py-8 px-4 rounded-lg shadow-md flex flex-col h-full hover:border-blue-800 hover:border-1 ${showButton ? "hover:shadow-lg" : ""}`}>
      {/* Card Content */}
      <div className="flex flex-col flex-grow">
        <div>
          <h3 className="text-2xl font-bold text-blue-800">{name}</h3>
          <p className="text-sm text-gray-600 mt-1">Perfect for growing piping companies</p>
          
          <p className="mt-5 text-gray-900 text-4xl font-bold">AED {Price}</p>
          <p className="text-sm text-gray-600 font-medium">/month</p>
          <p className="text-xs text-yellow-500 mt-1">Billed annually</p>

          {/* Benefits List */}
          <ul className="mt-6 space-y-3">
            {benefits.map((benefit: string, index) => (
              <li key={index} className="flex text-sm items-start">
                <div className="h-5 w-5 mr-2 mt-0.5">
                  {benefit.startsWith('✗') ? (
                    <CircleX size={18} strokeWidth={1.5} className="text-gray-400" />
                  ) : (
                    <CircleCheck size={18} strokeWidth={1.5} className="text-green-500" />
                  )}
                </div>
                <span className={benefit.startsWith('✗') ? "text-gray-400" : "text-gray-700"}>
                  {benefit.replace(/^[✓✗]\s*/, '')}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider - now consistently positioned at the bottom of the content */}
        <div className="border-t border-gray-200 mt-auto pt-6"></div>
      </div>

      {/* Button: Conditionally render based on showButton prop */}
      {showButton && (
        <div className="w-full mx-auto flex items-center justify-center mt-2">
          <button
            className="w-full py-3 bg-white text-gray-900 border border-blue-800 hover:bg-blue-300  font-medium rounded-md transition-colors"
            onClick={() => openModal?.(index)} 
          >
            Start Free Trial
          </button>
        </div>
      )}
    </div>
  );
};

export default PricingCard;