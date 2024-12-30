import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Desktop from '@/components/Desktop';
import { GoogleAnalytics } from '@next/third-parties/google';

export default function Home() {
  return (
    <>
      <GoogleAnalytics gaId="G-EB1C06ZDH2" />
      <Header />
      <Desktop />
      <Footer />
    </>
  );
}
