import { motion } from 'framer-motion';
import { fadeIn } from '../../Shared/variants';
import PricingCard from './PricingCard/PricingCard';
import { packages } from './PricingPackages';
import { Plan } from '../../utils/interface';

const Pricing = ({ openModal, setPlanValue }: { openModal: () => void, setPlanValue: (value: number) => void }) => {
  

  const handleOpenModal = (index: number) => {
    setPlanValue(index);
    openModal();
  };
  return (
    <div className="py-10 md:px-14 p-4 max-w-screen-2xl mx-auto mt-10 " id="pricing">
      <div className="text-center">
        <h2 className="md:text-5xl text-2xl font-extrabold text-gray-900  mb-2">Here are all our plans</h2>
        <p className="text-tertiary md:w-1/3 mx-auto">
          We have a plan and prices that fit your business perfectly for PMS Creation tool.
        </p>
      </div>
      <motion.div
        variants={fadeIn('up', 0.3)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.2 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 grid-cols-1 gap-12 mt-20  w-full mx-auto md:px-0 m-24"
      >
        {packages.map((pkg: Plan, index: number) => (
          <PricingCard
          key={index}
          name={pkg.name}
          Price={pkg.Price}
          benefits={pkg.benefits}
          index={index}
          showButton={true}          
          openModal={handleOpenModal}     
        />
        
        ))}
      </motion.div>
    </div>
  );
};

export default Pricing;
