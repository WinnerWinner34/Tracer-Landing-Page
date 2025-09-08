import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Benefits from "@/components/Benefits/Benefits";
import Container from "@/components/Container";
import Section from "@/components/Section";
import CTA from "@/components/CTA";

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <CTA />
      <Container>
        <Benefits />


        <Section
          id="testimonials"
          title="What Our Clients Say"
          description="Hear from those who have partnered with us."
        >
          <Testimonials />
        </Section>

        <FAQ />
        
        <CTA />
      </Container>
    </>
  );
};

export default HomePage;
