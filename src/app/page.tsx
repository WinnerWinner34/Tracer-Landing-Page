import Hero from "@/components/Hero";
// import FAQ from "@/components/FAQ";
import Benefits from "@/components/Benefits/Benefits";
import Container from "@/components/Container";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <CTA />
      <Benefits />
      <Container>
        {/* <FAQ /> */}
      </Container>
      
      <CTA />
      <Footer />
    </>
  );
};

export default HomePage;
