import SiteChrome from "@/components/SiteChrome";
import FloatingSeals from "@/components/FloatingSeals";
import Hero from "@/components/sections/Hero";
import LeadForm from "@/components/sections/LeadForm";
import CoinStory from "@/components/sections/CoinStory";
import About from "@/components/sections/About";
import PinnedReveal from "@/components/sections/PinnedReveal";
import Sequence from "@/components/sections/Sequence";
import Statement from "@/components/sections/Statement";
import Feature from "@/components/sections/Feature";
import LifestyleStack from "@/components/sections/LifestyleStack";
import Connect from "@/components/sections/Connect";
import Gallery from "@/components/sections/Gallery";
import Press from "@/components/sections/Press";
import Legacy from "@/components/sections/Legacy";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <SiteChrome />

      <Hero />
      <LeadForm />
      <CoinStory />
      <About />

      <PinnedReveal
        id="s3-trigger"
        image="/images/image-14.jpg"
        alt="Mediterranean night sky"
        tag="About"
        headline={["For Centuries, This Headland", "Guided Sailors Home."]}
        objectPosition="center 30%"
      />

      <Sequence />

      <PinnedReveal
        id="s5-trigger"
        image="/images/image-18.jpg"
        alt="Mediterranean marina sunset"
        headline={["Where the Land, Sea,", "and Sky Align."]}
        fadeOut
        wideTracking
      />

      <Statement />
      <Feature />
      <LifestyleStack />
      <Connect />
      <Gallery />
      <Press />
      <Legacy />
      <Footer />

      <FloatingSeals />
    </main>
  );
}
