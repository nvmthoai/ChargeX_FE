import { useState, useEffect } from "react";
import useProduct from "../../hooks/useProduct";
import { useNavigate } from "react-router-dom";
import { Sparkles, Zap, Battery, TrendingUp } from "lucide-react";

export default function EVMarketplace() {
  const navigate = useNavigate();
  const [sohRange, setSohRange] = useState([0, 100]);
  const [cycleRange, setCycleRange] = useState([0, 10000]);
  const [voltageRange, setVoltageRange] = useState([0, 500]);
  const [isAuction, setIsAuction] = useState<boolean | null>(null);
  const [priceType, setPriceType] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { products } = useProduct();
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    let filtered = products.filter((product) => {
      const soh = product.soh_percent || 0;
      const cycle = product.cycle_count || 0;
      const voltage = product.nominal_voltage_v || 0;
      const hasPriceStart =
        product.price_start !== null && product.price_start !== undefined;
      const hasPriceBuyNow =
        product.price_buy_now !== null && product.price_buy_now !== undefined;
      const hasPriceNow =
        product.price_now !== null && product.price_now !== undefined;

      return (
        soh >= sohRange[0] &&
        soh <= sohRange[1] &&
        cycle >= cycleRange[0] &&
        cycle <= cycleRange[1] &&
        voltage >= voltageRange[0] &&
        voltage <= voltageRange[1] &&
        (isAuction === null || product.is_auction === isAuction) &&
        (priceType.length === 0 ||
          (priceType.includes("start") && hasPriceStart) ||
          (priceType.includes("buy_now") && hasPriceBuyNow) ||
          (priceType.includes("now") && hasPriceNow))
      );
    });
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, sohRange, cycleRange, voltageRange, isAuction, priceType]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResetFilters = () => {
    setSohRange([0, 100]);
    setCycleRange([0, 10000]);
    setVoltageRange([0, 500]);
    setIsAuction(null);
    setPriceType([]);
  };

  const getDisplayPrice = (product: (typeof products)[0]) => {
    if (product.price_now) return `$${product.price_now.toLocaleString()}`;
    if (product.price_buy_now)
      return `$${product.price_buy_now.toLocaleString()}`;
    return `$${product.price_start.toLocaleString()}`;
  };

  const getCondition = (product: (typeof products)[0]) => {
    if (product.condition_grade) return `Grade ${product.condition_grade}`;
    return product.status === "active" ? "Active" : "Draft";
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-energy-50/30 to-dark-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-ocean-500 via-energy-500 to-ocean-600 text-white">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 animate-fadeIn">
              EV Battery Marketplace
            </h1>
            <p 
              className="text-xl sm:text-2xl mb-8 animate-slideUp text-black"
           
            >
              Discover Premium Electric Vehicle Batteries
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div 
                className="flex items-center gap-2 backdrop-blur-sm rounded-full px-4 py-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: '500',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Zap className="w-5 h-5" />
                <span>High Quality</span>
              </div>
              <div 
                className="flex items-center gap-2 backdrop-blur-sm rounded-full px-4 py-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: '500',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Battery className="w-5 h-5" />
                <span>Certified</span>
              </div>
              <div 
                className="flex items-center gap-2 backdrop-blur-sm rounded-full px-4 py-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: '500',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Best Prices</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div 
            className="w-full lg:w-80 rounded-2xl p-6 h-fit shadow-xl sticky top-20"
            style={{
              background: 'linear-gradient(to bottom right, #bae7ff, #d9f7be, #bae7ff)',
              border: '2px solid rgba(24, 144, 255, 0.3)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-ocean-500 to-energy-500 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-dark-900">Filters</h3>
            </div>

            <div className="space-y-6">
              {/* SOH Filter */}
              <div>
                <h4 className="font-bold mb-3 text-dark-900 flex items-center gap-2">
                  <Battery className="w-4 h-4 text-ocean-600" />
                  SOH Percent
                </h4>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sohRange[1]}
                  onChange={(e) =>
                    setSohRange([0, Number.parseInt(e.target.value)])
                  }
                  className="w-full h-2 bg-gradient-to-r from-ocean-200 to-energy-200 rounded-lg appearance-none cursor-pointer accent-ocean-500"
                />
                <div className="flex justify-between text-sm text-dark-800 mt-2">
                  <span>0%</span>
                  <span className="font-semibold text-ocean-600">{sohRange[1]}%</span>
                </div>
              </div>

              {/* Cycle Count Filter */}
              <div>
                <h4 className="font-bold mb-3 text-dark-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-energy-600" />
                  Cycle Count
                </h4>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={cycleRange[1]}
                  onChange={(e) =>
                    setCycleRange([0, Number.parseInt(e.target.value)])
                  }
                  className="w-full h-2 bg-gradient-to-r from-ocean-200 to-energy-200 rounded-lg appearance-none cursor-pointer accent-energy-500"
                />
                <div className="flex justify-between text-sm text-dark-600 mt-2">
                  <span>0</span>
                  <span className="font-semibold text-energy-600">{cycleRange[1]}</span>
                </div>
              </div>

              {/* Voltage Filter */}
              <div>
                <h4 className="font-bold mb-3 text-dark-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-ocean-600" />
                  Nominal Voltage (V)
                </h4>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={voltageRange[1]}
                  onChange={(e) =>
                    setVoltageRange([0, Number.parseInt(e.target.value)])
                  }
                  className="w-full h-2 bg-gradient-to-r from-ocean-200 to-energy-200 rounded-lg appearance-none cursor-pointer accent-ocean-500"
                />
                <div className="flex justify-between text-sm text-dark-600 mt-2">
                  <span>0V</span>
                  <span className="font-semibold text-ocean-600">{voltageRange[1]}V</span>
                </div>
              </div>

              {/* Auction Type */}
              <div>
                <h4 className="font-bold mb-3 text-dark-900">Auction Type</h4>
                <div className="space-y-2">
                  {[
                    { value: null, label: "All" },
                    { value: true, label: "Auction" },
                    { value: false, label: "Buy Now" },
                  ].map((option) => (
                    <label key={String(option.value)} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="auction"
                        checked={isAuction === option.value}
                        onChange={() => setIsAuction(option.value)}
                        className="w-4 h-4 text-ocean-600 border-ocean-300 focus:ring-ocean-500 focus:ring-2"
                      />
                      <span className="ml-3 text-sm text-dark-900 font-medium group-hover:text-ocean-600 transition-colors">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleResetFilters}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-ocean-200 to-energy-200 hover:from-ocean-300 hover:to-energy-300 text-dark-900 rounded-xl font-semibold transition-all hover:scale-105 shadow-md border-2 border-ocean-400/60 focus:outline-none focus:ring-4 focus:ring-ocean-400/40"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-dark-900 mb-2">
                Explore Products
              </h2>
              <p className="text-dark-800 font-medium">
                Found {filteredProducts.length} products
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-ocean-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-ocean-100 to-energy-100">
                    {product.imageUrls && product.imageUrls[0] ? (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Battery className="w-16 h-16 text-ocean-300" />
                      </div>
                    )}
                    {product.is_auction && (
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-energy-500 to-energy-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Auction
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-dark-900 mb-2 line-clamp-2 min-h-[56px] group-hover:text-ocean-600 transition-colors">
                      {product.title}
                    </h3>

                    <div className="text-2xl font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent mb-3">
                      {getDisplayPrice(product)}
                    </div>

                    <p className="text-sm text-dark-800 line-clamp-2 mb-4 min-h-[40px]">
                      {product.description || "No description provided."}
                    </p>

                    {/* Technical Info */}
                    {product.soh_percent && (
                      <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gradient-to-r from-ocean-50 to-energy-50 rounded-lg">
                        <div className="text-xs">
                          <span className="text-dark-700 font-medium">SOH:</span>
                          <span className="font-semibold text-ocean-600 ml-1">{product.soh_percent}%</span>
                        </div>
                        {product.cycle_count && (
                          <div className="text-xs">
                            <span className="text-dark-500">Cycles:</span>
                            <span className="font-semibold text-energy-600 ml-1">{product.cycle_count}</span>
                          </div>
                        )}
                        {product.nominal_voltage_v && (
                          <div className="text-xs">
                            <span className="text-dark-500">Voltage:</span>
                            <span className="font-semibold text-ocean-600 ml-1">{product.nominal_voltage_v}V</span>
                          </div>
                        )}
                        {product.weight_kg && (
                          <div className="text-xs">
                            <span className="text-dark-500">Weight:</span>
                            <span className="font-semibold text-energy-600 ml-1">{product.weight_kg}kg</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status & Seller */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          getCondition(product) === "Active"
                            ? "bg-gradient-to-r from-energy-100 to-energy-200 text-energy-800"
                            : "bg-dark-100 text-dark-700"
                        }`}
                      >
                        {getCondition(product)}
                      </span>
                      <div className="text-xs text-dark-700 truncate max-w-[120px] font-medium">
                        by {product.seller.fullName}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => navigate(`/productdetail/${product.id}`)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-4 focus:ring-ocean-500/50"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gradient-to-br from-white/95 via-ocean-50/20 to-energy-50/20 rounded-xl border-2 border-ocean-300 text-dark-800 hover:bg-ocean-100 hover:border-ocean-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-md focus:outline-none focus:ring-4 focus:ring-ocean-400/40 font-semibold"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all hover:scale-110 focus:outline-none focus:ring-4 ${
                        page === currentPage
                          ? "bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-lg focus:ring-ocean-500/50"
                          : "bg-gradient-to-br from-white/95 via-ocean-50/20 to-energy-50/20 border-2 border-ocean-300 text-dark-800 hover:bg-ocean-100 hover:border-ocean-400 shadow-md focus:ring-ocean-400/40"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gradient-to-br from-white/95 via-ocean-50/20 to-energy-50/20 rounded-xl border-2 border-ocean-300 text-dark-800 hover:bg-ocean-100 hover:border-ocean-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-md focus:outline-none focus:ring-4 focus:ring-ocean-400/40 font-semibold"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
