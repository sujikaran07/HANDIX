import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    // Main layout
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">About Handix</h1>
            
            {/* story section */}
            <div className="mb-12">
              <img 
                src="https://lh5.googleusercontent.com/p/AF1QipPf3iJQmgboismhHLYX1KueZUqxZfuiMkrpfxvU=w1440-h810-k-no" 
                alt="Handix artisans at work" 
                className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg mb-6"
              />
              
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-gray-700 mb-4">
                In the vibrant community of skilled artisans across Sri Lanka, Handix was born from a vision to preserve and 
                promote our rich heritage of craftsmanship. Founded in 2018, our journey began with a simple mission: 
                to connect skilled artisans from rural Sri Lanka with consumers who appreciate authentic, handcrafted items.
              </p>
              <p className="text-gray-700 mb-4">
                Before Handix, everything was done the old-fashioned way. Orders were taken in person, inventory was managed through memory, 
                and payments were cumbersome. Our platform changed everything, turning a chaotic process into a smooth, 
                efficient system where artisans could focus on what they do best—creating beautiful handmade goods.
              </p>
              <p className="text-gray-700 mb-4">
                What started as a small community project has now grown into a thriving marketplace that supports 
                over 100 artisan families across the island. We believe in the power of traditional craftsmanship 
                and sustainable practices to create products that are not only beautiful but also tell a story.
              </p>
            </div>
            
            {/* mission section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bold text-primary mb-2">Support Artisans</h3>
                  <p className="text-gray-600">
                    We provide a sustainable income for skilled craftspeople, helping them focus on their art while our platform handles the business side.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bold text-primary mb-2">Connect Traditions</h3>
                  <p className="text-gray-600">
                    Each product carries the rich cultural heritage of Sri Lanka, bringing traditional craftsmanship to modern customers worldwide.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bold text-primary mb-2">Innovate & Sustain</h3>
                  <p className="text-gray-600">
                    We blend traditional crafting methods with modern technology and sustainable practices to create a platform that honors both heritage and innovation.
                  </p>
                </div>
              </div>
            </div>
            
            {/* crafts section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Our Crafts</h2>
              <p className="text-gray-700 mb-6">
                At Handix, we showcase a diverse range of handcrafted treasures, each with its own unique 
                story and craftsmanship. Our product collection includes:
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Apparel & Accessories</h3>
                  <p className="text-gray-600 mb-4">
                    Cozy wool baby clothes, warm socks, stylish hats, and intricate handmade necklaces crafted with care.
                  </p>
                  
                  <h3 className="font-semibold text-lg mb-2">Bags & Carry Goods</h3>
                  <p className="text-gray-600 mb-4">
                    Sturdy tote bags, felt pencil pouches, and other carry goods designed for both style and function.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Home Décor</h3>
                  <p className="text-gray-600 mb-4">
                    Fabric-covered pots, pillow covers, rope bowls, and hot handle holders to add warmth to any home.
                  </p>
                  
                  <h3 className="font-semibold text-lg mb-2">Artistic Creations</h3>
                  <p className="text-gray-600 mb-4">
                    Yarn ball bookmarks, DIY headbands, and custom pieces that showcase the unique creativity of our artisans.
                  </p>
                </div>
              </div>
            </div>
            
            {/* team section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Meet Our Team</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
                  <h3 className="font-bold">Puspasiny Mahenthiran</h3>
                  <p className="text-gray-600">Founder & CEO</p>
                </div>
                <div className="text-center">
                  <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
                  <h3 className="font-bold">Vinoja Piraksh</h3>
                  <p className="text-gray-600">Head of Artisan Relations</p>
                </div>
                <div className="text-center">
                  <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
                  <h3 className="font-bold">Mahenthiran Sujikaran</h3>
                  <p className="text-gray-600">Creative Director</p>
                </div>
              </div>
            </div>
            
            {/* call to action section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Join Our Journey</h2>
              <p className="text-gray-700 mb-4">
                When you purchase from Handix, you're not just buying a product – you're supporting a sustainable 
                ecosystem of traditional craftsmanship. Our platform bridges the rich tradition of handmade crafts 
                with the needs of the modern world, ensuring the art of craftsmanship thrives for generations to come.
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
