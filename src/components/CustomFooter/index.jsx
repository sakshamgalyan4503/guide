import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function CustomFooter() {
  return (
    <footer className="bg-[#1b0d3f] text-white py-8 bg-[url('/img/fotter.png')] bg-cover bg-center">
      <div className="mx-[15px] md:mx-[30px] lg:mx-[70px] px-4">

        {/* Footer Wrapper */}
        <div className="flex justify-between items-center md:items-start flex-col md:flex-row flex-wrap gap-8 text-center md:text-left">

          {/* Column 1 - Logo */}
          <div className="flex-1 flex justify-center md:justify-start items-start mb-6 md:mb-0">
            <img
              src={useBaseUrl('img/footerLogo.svg')}
              alt="Paysecure Logo"
              className="max-h-[30px] md:max-h-[40px]"
            />
          </div>

          {/* Column 2 - Quick Links */}
          <div className="flex-1 text-center md:text-right mb-6 md:mb-0">
            <h4 className="mt-2.5 font-bold mb-6 text-[1rem] md:text-[1.125rem]">Quick Links</h4>
            <ul className="list-none p-0 m-0">
              <li className="my-1.5"><Link className="text-[0.9rem] md:text-[1rem] text-white no-underline transition-all duration-300 hover:text-[#8666CF] hover:scale-105 inline-block" to="/">Merchant Docs</Link></li>
              <li className="my-1.5"><Link className="text-[0.9rem] md:text-[1rem] text-white no-underline transition-all duration-300 hover:text-[#8666CF] hover:scale-105 inline-block" to="/docs/overview">Alternative Payment Methods (APM)</Link></li>
              <li className="my-1.5"><Link className="text-[0.9rem] md:text-[1rem] text-white no-underline transition-all duration-300 hover:text-[#8666CF] hover:scale-105 inline-block" to="/">Set-up & optimize APMs</Link></li>
            </ul>
          </div>

          {/* Column 3 - Contact */}
          <div className="flex-1 text-center md:text-right">
            <h4 className="mt-2.5 font-bold mb-5 text-[#d1bdff] text-[1rem] md:text-[1.125rem]">Contact Us</h4>
            <p><a className="text-[0.9rem] md:text-[1rem] text-white no-underline hover:text-[#8666CF]" href="mailto:info@paysecure.net">info@paysecure.net</a></p>
            <p><a className="text-[0.9rem] md:text-[1rem] text-white no-underline hover:text-[#8666CF]" href="mailto:sales@paysecure.net">sales@paysecure.net</a></p>
          </div>
        </div>

      </div>

      <div className="text-center text-[0.85rem] mt-6 opacity-80 text-[#8F8E8A]">
        Copyright © {new Date().getFullYear()} Paysecure, Inc.
      </div>
    </footer>
  );
}
