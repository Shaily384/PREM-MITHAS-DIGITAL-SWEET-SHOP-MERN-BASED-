import React from "react";
import { Helmet } from "react-helmet-async";

import Hero from "../components/Hero";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";
import NewsletterBox from "../components/NewsletterBox";
import Testimonials from "../components/Testimonials";
import InstagramFeed from "../components/InstagramFeed";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>
          Sweet Shop
        </title>
        <meta
          name="description"
          content="Authentic handcrafted Indian sweets made with pure desi ghee and traditional recipes. Freshly prepared daily in Nagpur for your celebrations."
        />
       {/* <link rel="canonical" href="https://gifthouse.vercel.app/" />*/}
      </Helmet>

      <div>
        <Hero />
        <LatestCollection />
        <BestSeller />
        <Testimonials />
        {/* <OurPolicy /> */}
        {/* <NewsletterBox /> */}
      </div>
    </>
  );
};
export default Home;
