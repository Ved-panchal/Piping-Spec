import { useState } from 'react';
import Pricing from '../Pricing/Pricing';
import RegisterModal from '../Register/RegisterModal';
import Hero from '../Hero/Hero';
import Feature from '../Feature/Feature';
import AboutUs from '../About/About';
import Contact from '../Contact/Contact';


const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plan, setPlan] = useState(0);

  const setPlanValue = (value: number) => setPlan(value);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      
      <Hero />
      <Feature/>
      {/* Render Modal at the top level so it appears above the Pricing section */}
      <RegisterModal isOpen={isModalOpen} closeModal={closeModal} selectedPlanIndex={plan} />

      <section id="pricing-section" className="Pricing">
        <Pricing openModal={openModal} setPlanValue={setPlanValue} />
      </section>
      <AboutUs />
      <Contact />
    </>
  );
};

export default Home;
