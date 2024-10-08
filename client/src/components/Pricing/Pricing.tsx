import {motion} from "framer-motion";
import { fadeIn } from '../../Shared/variants';
import PricingCard from "./PricingCard/PricingCard";
import { Plan } from "./PricingInterface";

const Pricing = () => {

  const packages = [
    {
      name: "Free",
      Price: 0,
      description:
        "A common form of Lorem ipsum reads: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      name: "Weekly",
      Price: 19,
      description:
        "A common form of Lorem ipsum reads: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      name: "Monthly",
      Price: 39,
      description:
        "A common form of Lorem ipsum reads: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      name: "Yearly",
      Price: 59,
      description:
        "A common form of Lorem ipsum reads: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  ];

  return (
    <div className="py-10 md:px-14 p-4 max-w-screen-2xl mx-auto mt-10" id="pricing">
      <div className="text-center">
        <h2 className="md:text-5xl text-2xl font-extrabold text-gray-900 mb-2">
          Here are all our plans
        </h2>
        <p className="text-tertiary md:w-1/3 mx-auto">
          A simple paragraph is comprised of three major components. The which
          is often a declarative sentence.
        </p>
      </div>
      <motion.div
        variants={fadeIn("up", 0.3)}
        initial="hidden"
        whileInView={"show"}
        viewport={{ once: false, amount: 0.2 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 grid-cols-1 gap-10 mt-20 md:w-11/12 mx-auto"
      >
        {packages.map((pkg:Plan, index:number) => (
          <PricingCard key={index} {...pkg} index={index}/>
        ))}
      </motion.div>
    </div>
  );
}

export default Pricing
