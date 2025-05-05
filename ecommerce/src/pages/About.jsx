import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">About Handix</h1>
            
            <div className="mb-12">
              <img 
                src="/images/about-banner.jpg" 
                alt="Handix artisans at work" 
                className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg mb-6"
              />
              
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-gray-700 mb-4">
                Handix was born from a passion to preserve and promote the rich heritage of Sri Lankan craftsmanship. 
                Founded in 2018, our journey began with a simple mission: to connect skilled artisans from rural 
                Sri Lanka with consumers who appreciate authentic, handcrafted items.
              </p>
              <p className="text-gray-700 mb-4">
                What started as a small community project has now grown into a thriving marketplace that supports 
                over 200 artisan families across the island. We believe in the power of traditional craftsmanship 
                and sustainable practices to create products that are not only beautiful but also tell a story.
              </p>
            </div>
            
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bold text-primary mb-2">Support Artisans</h3>
                  <p className="text-gray-600">
                    We provide a sustainable income for skilled craftspeople and help preserve traditional techniques.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bold text-primary mb-2">Promote Culture</h3>
                  <p className="text-gray-600">
                    Each product carries the rich cultural heritage and story of Sri Lanka's diverse traditions.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bold text-primary mb-2">Protect Environment</h3>
                  <p className="text-gray-600">
                    We prioritize eco-friendly materials and sustainable production methods in all our products.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Our Crafts</h2>
              <p className="text-gray-700 mb-6">
                At Handix, we showcase a diverse range of traditional Sri Lankan crafts, each with its own unique 
                history and significance. Our products include:
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Traditional Masks</h3>
                  <p className="text-gray-600 mb-4">
                    Hand-carved wooden masks representing characters from folklore and traditional dance.
                  </p>
                  
                  <h3 className="font-semibold text-lg mb-2">Batik & Handloom Textiles</h3>
                  <p className="text-gray-600 mb-4">
                    Colorful fabrics created using ancient dyeing and weaving techniques passed down through generations.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Brass & Copper Crafts</h3>
                  <p className="text-gray-600 mb-4">
                    Intricately designed metalwork pieces including ornaments, decorative items, and utensils.
                  </p>
                  
                  <h3 className="font-semibold text-lg mb-2">Pottery & Ceramics</h3>
                  <p className="text-gray-600 mb-4">
                    Earth-toned ceramics and clay products made using traditional firing techniques.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Meet Our Team</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
                  <h3 className="font-bold">Amara Perera</h3>
                  <p className="text-gray-600">Founder & CEO</p>
                </div>
                <div className="text-center">
                  <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
                  <h3 className="font-bold">Nimal Gunawardena</h3>
                  <p className="text-gray-600">Head of Artisan Relations</p>
                </div>
                <div className="text-center">
                  <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
                  <h3 className="font-bold">Chamari Silva</h3>
                  <p className="text-gray-600">Creative Director</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4">Join Our Journey</h2>
              <p className="text-gray-700 mb-4">
                When you purchase from Handix, you're not just buying a product – you're supporting a sustainable 
                ecosystem of traditional craftsmanship and helping preserve cultural heritage for generations to come.
              </p>
              <div className="flex justify-center">
                <a href="/products" className="bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-hover transition-colors">
                  Explore Our Collection
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutPage;
