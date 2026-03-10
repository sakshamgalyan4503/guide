import { useEffect, useState, type ReactNode } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type { ComponentProps } from 'react';
import OriginalLink from '@docusaurus/Link';
import OriginalHeading from '@theme/Heading';
import OriginalLayout from '@theme/Layout';
import ChatbotModal from '../components/ChatbotModal';

const Layout = OriginalLayout as (props: ComponentProps<'div'> & {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) => JSX.Element;


const Heading = OriginalHeading as (props: ComponentProps<'h1'> & { as: keyof JSX.IntrinsicElements }) => JSX.Element;
const Link = OriginalLink as (props: ComponentProps<'a'> & { to: string }) => JSX.Element;


function HomepageHeader() {
  // const SearchBar = (require('@theme/SearchBar') as any).default || require('@theme/SearchBar');
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className="hero hero--primary relative overflow-hidden h-[40vh] py-8 px-8 lg:py-16 lg:px-0 text-center">
      {/* Background image */}
      <img
        src="/img/bghome.png"
        alt=""
        className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none"
      />
      <div className="container relative z-10 mx-auto mt-2.5">
        <Heading as="h1" className="text-white font-sans font-bold text-[48px] dark:text-white">
          Paysecure Merchant Guide
        </Heading>
        <p className="text-white font-sans font-medium text-[20px]">Your guide to Paysecure onboarding and configuration</p>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const match = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(match.matches);
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    match.addEventListener("change", listener);
    return () => match.removeEventListener("change", listener);
  }, []);

  const handleClick = () => {
    setOpen(true);
  };

  return (
    <Layout
      title={siteConfig.title}
      description="Comprehensive guide for merchant onboarding and configuration on Paysecure."
    >
      <HomepageHeader />
      <main style={{ backgroundColor: 'white' }}>
        <section className="my-[50px]">
          {/* Quickfind Docs */}
          <div className="mx-[5%]">
            <div className="font-sans font-bold text-[20px] md:text-[24px] mb-4 text-[#3A3C40] text-center md:text-left">Quickfind Docs</div>
            <div className="flex flex-wrap gap-5">
              <Link to='https://docs.paysecure.net/merchantguide/' className="flex-1 w-full md:min-w-[250px] h-[200px] border border-solid border-[#C2C3C4] rounded-xl bg-white no-underline hover:no-underline text-inherit flex flex-col justify-between transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-[url('/img/cardpic.png')] group">
                <div className="flex justify-between items-center p-4">
                  <img src="/img/nohoverprofile.svg" alt="" className="w-[30px] h-[30px] group-hover:[content:url('/img/profile.svg')] transition-all duration-300" />
                  <img src="/img/nohoverarrow.svg" alt="" className="w-[24px] h-[24px] group-hover:[content:url('/img/arrow.svg')] transition-all duration-300" />
                </div>
                <div className="flex flex-col gap-1.5 px-4 pb-4">
                  <span className="font-semibold text-[16px] text-[#3A3C40] group-hover:text-white">Merchant Docs</span>
                  <span className="text-[14px] text-[#7B7C7F] group-hover:text-white">Integrate and manage payments.</span>
                </div>
              </Link>

              <Link to='/docs/overview' className="flex-1 w-full md:min-w-[250px] h-[200px] border border-solid border-[#C2C3C4] rounded-xl bg-white no-underline hover:no-underline text-inherit flex flex-col justify-between transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-[url('/img/cardpic.png')] group">
                <div className="flex justify-between items-center p-4">
                  <img src="/img/wallet.svg" alt="" className="w-[30px] h-[30px] group-hover:[content:url('/img/nohoverwallet.svg')] transition-all duration-300" />
                  <img src="/img/nohoverarrow.svg" alt="" className="w-[24px] h-[24px] group-hover:[content:url('/img/arrow.svg')] transition-all duration-300" />
                </div>
                <div className="flex flex-col gap-1.5 px-4 pb-4">
                  <span className="font-semibold text-[16px] text-[#3A3C40] group-hover:text-white">Alternative Payment Methods (APM)</span>
                  <span className="text-[14px] text-[#7B7C7F] group-hover:text-white">Set up and optimize APMs.</span>
                </div>
              </Link>

              <Link to='/' className="flex-1 w-full md:min-w-[250px] h-[200px] border border-solid border-[#C2C3C4] rounded-xl bg-white no-underline hover:no-underline text-inherit flex flex-col justify-between transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-[url('/img/cardpic.png')] group">
                <div className="flex justify-between items-center p-4">
                  <img src="/img/api.svg" alt="" className="w-[30px] h-[30px] group-hover:[content:url('/img/nohoverapi.svg')] transition-all duration-300" />
                  <img src="/img/nohoverarrow.svg" alt="" className="w-[24px] h-[24px] group-hover:[content:url('/img/arrow.svg')] transition-all duration-300" />
                </div>
                <div className="flex flex-col gap-1.5 px-4 pb-4">
                  <span className="font-semibold text-[16px] text-[#3A3C40] group-hover:text-white">Set-up & optimize APMs</span>
                  <span className="text-[14px] text-[#7B7C7F] group-hover:text-white">Set up and optimize APMs.</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Developer Tools */}
          <div className="mx-[5%] mt-[60px]">
            <div className="font-sans font-bold text-[24px] mb-5 text-[#3A3C40]">Developer Tools</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
                <Link to='/docs/api/cryptobridge' className="min-w-[200px] h-[80px] rounded-[10px] border border-solid border-[#C2C3C4] p-5 flex justify-between items-center bg-white cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] no-underline hover:no-underline hover:bg-[url('/img/bgcard1.svg')] group" >
                  <span className="font-medium text-[16px] text-[#6C2BD9] font-semibold group-hover:text-[#5a23b6]">Payin APIs</span>
                  <img src="/img/nohoverarrow.svg" alt="arrow" className="w-[24px] h-[24px] group-hover:[content:url('/img/arrow.svg')] transition-all duration-300" />
                </Link>

                <Link to='/docs/api/cryptobridge' className="min-w-[200px] h-[80px] rounded-[10px] border border-solid border-[#C2C3C4] p-5 flex justify-between items-center bg-white cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] no-underline hover:no-underline hover:bg-[url('/img/bgcard1.svg')] group">
                  <span className="font-medium text-[16px] text-[#6C2BD9] font-semibold group-hover:text-[#5a23b6]">Payout APIs</span>
                  <img src="/img/nohoverarrow.svg" alt="arrow" className="w-[24px] h-[24px] group-hover:[content:url('/img/arrow.svg')] transition-all duration-300" />
                </Link>

                <Link to='/docs/api/cryptobridge' className="min-w-[200px] h-[80px] rounded-[10px] border border-solid border-[#C2C3C4] p-5 flex justify-between items-center bg-white cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] no-underline hover:no-underline hover:bg-[url('/img/bgcard1.svg')] group">
                  <span className="font-medium text-[16px] text-[#6C2BD9] font-semibold group-hover:text-[#5a23b6]">Authentication</span>
                  <img src="/img/nohoverarrow.svg" alt="arrow" className="w-[24px] h-[24px] group-hover:[content:url('/img/arrow.svg')] transition-all duration-300" />
                </Link>

                <Link to='/docs/api/cryptobridge' className="min-w-[200px] h-[80px] rounded-[10px] border border-solid border-[#C2C3C4] p-5 flex justify-between items-center bg-white cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] no-underline hover:no-underline hover:bg-[url('/img/bgcard1.svg')] group">
                  <span className="font-medium text-[16px] text-[#6C2BD9] font-semibold group-hover:text-[#5a23b6]">Refund</span>
                  <img src="/img/nohoverarrow.svg" alt="arrow" className="w-[24px] h-[24px] group-hover:[content:url('/img/arrow.svg')] transition-all duration-300" />
                </Link>

                <Link to='/docs/api/cryptobridge' className="min-w-[200px] h-[80px] rounded-[10px] border border-solid border-[#C2C3C4] p-5 flex justify-between items-center bg-white cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] no-underline hover:no-underline hover:bg-[url('/img/bgcard1.svg')] group">
                  <span className="font-medium text-[16px] text-[#6C2BD9] font-semibold group-hover:text-[#5a23b6]">Cashier</span>
                  <img src="/img/nohoverarrow.svg" alt="arrow" className="w-[24px] h-[24px] group-hover:[content:url('/img/arrow.svg')] transition-all duration-300" />
                </Link>

                <Link to='/docs/api/cryptobridge' className="min-w-[200px] h-[80px] rounded-[10px] border border-solid border-[#C2C3C4] p-5 flex justify-between items-center bg-white cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] no-underline hover:no-underline hover:bg-[url('/img/bgcard1.svg')] group">
                  <span className="font-medium text-[16px] text-[#6C2BD9] font-semibold group-hover:text-[#5a23b6]">Verify Status</span>
                  <img src="/img/nohoverarrow.svg" alt="arrow" className="w-[24px] h-[24px] group-hover:[content:url('/img/arrow.svg')] transition-all duration-300" />
                </Link>
              </div>

              <div className="border border-solid border-[#C2C3C4] rounded-xl p-6 bg-white flex flex-col gap-[14px] h-[270px]">
                <div className="text-[24px] text-[#C5F53C]">✨</div>
                <div className="flex flex-col gap-0">
                  <h4 className="text-[18px] font-bold m-0 text-[#3A3C40]">Need help? Just ask.</h4>
                  <p className="text-[14px] text-[#555] m-0 leading-normal">Get instant answers on payments, integrations, and more — powered by AI.</p>
                </div>
                <button className="bg-[#6C2BD9] text-white border-none rounded-lg p-3 text-[14px] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[#5a23b6] hover:scale-[1.01]" onClick={handleClick}>
                  Ask AI Agent
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <ChatbotModal open={open} onClose={() => setOpen(false)} isDark={isDark} />
    </Layout>
  );
}
