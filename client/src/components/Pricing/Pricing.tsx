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
      benefits:["Limited Access for 3 days","Setup by self","Add up to 2 Component","Spec can’t be stored for future use","No training or material is included"]
    },
    {
      name: "Weekly",
      Price: 19,
      description:
        "A common form of Lorem ipsum reads: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        benefits:["Full Access for 7 days","Catalog setup for PMS Creation included","Add up to 5 Spec for one project","Specs can be stored for future use and modification","Training material will be provided on how to use the tool"]
    },
    {
      name: "Monthly",
      Price: 39,
      description:
        "A common form of Lorem ipsum reads: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      benefits:["Full Access for 30 days","Catalog setup for PMS Creation included","Unlimited spec for two project","Specs can be stored for future use and modification","Training material will be provided on how to use the tool"]
    },
    {
      name: "Yearly",
      Price: 59,
      description:
        "A common form of Lorem ipsum reads: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      benefits:["Full Access for 1 year","Catalog setup for PMS Creation included","Creation of unlimited project and spec","Specs can be stored for future use and modification","Live training will be provided to nominated users"]
    },
  ];

  return (
    <div className="py-10 md:px-14 p-4 max-w-screen-2xl mx-auto mt-10" id="pricing">
      <div className="text-center">
        <h2 className="md:text-5xl text-2xl font-extrabold text-gray-900 mb-2">
          Here are all our plans
        </h2>
        <p className="text-tertiary md:w-1/3 mx-auto">
        We have a plan and prices that fit your business perfectly for PMS Creation tool
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
