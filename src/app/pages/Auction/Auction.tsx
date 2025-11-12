import Bidding from "./components/Bidding.tsx";
import Product from "./components/Product.tsx";

export default function Auction() {
    return (
        <div className="auction-container container">
            <Product />
            <Bidding />
        </div>
    )
}
