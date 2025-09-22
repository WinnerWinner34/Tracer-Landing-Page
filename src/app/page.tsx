import Hero from "@/components/Hero";
// import FAQ from "@/components/FAQ";
import Benefits from "@/components/Benefits/Benefits";
import Container from "@/components/Container";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Tagline from "@/components/Tagline";

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <CTA />
      <Tagline />
      <Benefits />
      <Container>
        {/* <FAQ /> */}
      </Container>
      
      <CTA id="bottom-cta" />
      <Footer />
    </>
  );
};

export default HomePage;
