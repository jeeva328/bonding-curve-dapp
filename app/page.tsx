import Navbar from "./components/Navbar";
import TradeTabs from "./components/TradeForm";
import PriceInfo from "./components/PriceInfo";

export default function Home() {
  return (
    <>
      <Navbar />
      <TradeTabs />
      <PriceInfo />
    </>
  );
}
