import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import HowItWorks from '../components/home/HowItWorks';
import AwarenessBanner from '../components/home/AwarenessBanner';
import Footer from '../components/layout/Footer';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <AwarenessBanner />
      <Footer />
    </div>
  );
};

export default Home;