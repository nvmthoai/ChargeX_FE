import { useState, useEffect } from "react";
import useProduct from "../../hooks/useProduct";
import { useNavigate } from "react-router-dom";

export default function EVMarketplace() {
  const navigate = useNavigate();
  const [sohRange, setSohRange] = useState([0, 100]);
  const [cycleRange, setCycleRange] = useState([0, 10000]);
  const [voltageRange, setVoltageRange] = useState([0, 500]);
  const [isAuction, setIsAuction] = useState<boolean | null>(null); // null: all, true: auction, false: not auction
  const [priceType, setPriceType] = useState<string[]>([]); // ['start', 'buy_now', 'now']
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
    setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
  }, [products, sohRange, cycleRange, voltageRange, isAuction, priceType]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // const handlePriceTypeChange = (type: string, checked: boolean) => {
  //   if (checked) {
  //     setPriceType([...priceType, type]);
  //   } else {
  //     setPriceType(priceType.filter((t) => t !== type));
  //   }
  // };

  const handleResetFilters = () => {
    setSohRange([0, 100]);
    setCycleRange([0, 10000]);
    setVoltageRange([0, 500]);
    setIsAuction(null);
    setPriceType([]);
  };

const getDisplayPrice = (product: (typeof products)[0]) => {
  if (product.price_buy_now !== null && product.price_buy_now !== undefined) {
    return `${Number(product.price_buy_now).toLocaleString()} VND`;
  }
  return "N/A";
};


  const getCondition = (product: (typeof products)[0]) => {
    if (product.condition_grade) return `Grade ${product.condition_grade}`;
    return product.status === "active" ? "Active" : "Draft";
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          <div className="w-80 bg-white rounded-lg p-6 h-fit">
            <div className="flex items-center space-x-2 mb-6">
              <svg
                className="h-5 w-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <h3 className="font-semibold text-lg">Filters</h3>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3">SOH Percent</h4>
              <input
                type="range"
                min="0"
                max="100"
                value={sohRange[1]}
                onChange={(e) =>
                  setSohRange([0, Number.parseInt(e.target.value)])
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>0%</span>
                <span>{sohRange[1]}%</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3">Cycle Count</h4>
              <input
                type="range"
                min="0"
                max="10000"
                value={cycleRange[1]}
                onChange={(e) =>
                  setCycleRange([0, Number.parseInt(e.target.value)])
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>0</span>
                <span>{cycleRange[1]}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3">Nominal Voltage (V)</h4>
              <input
                type="range"
                min="0"
                max="500"
                value={voltageRange[1]}
                onChange={(e) =>
                  setVoltageRange([0, Number.parseInt(e.target.value)])
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>0V</span>
                <span>{voltageRange[1]}V</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3">Auction Type</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="auction"
                    checked={isAuction === null}
                    onChange={() => setIsAuction(null)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">All</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="auction"
                    checked={isAuction === true}
                    onChange={() => setIsAuction(true)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auction</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="auction"
                    checked={isAuction === false}
                    onChange={() => setIsAuction(false)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Buy Now</span>
                </label>
              </div>
            </div>

            {/* <div className="mb-6">
              <h4 className="font-medium mb-3">Price Types</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={priceType.includes("start")}
                    onChange={(e) =>
                      handlePriceTypeChange("start", e.target.checked)
                    }
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Start Price
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={priceType.includes("buy_now")}
                    onChange={(e) =>
                      handlePriceTypeChange("buy_now", e.target.checked)
                    }
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Buy Now Price
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={priceType.includes("now")}
                    onChange={(e) =>
                      handlePriceTypeChange("now", e.target.checked)
                    }
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Current Price
                  </span>
                </label>
              </div>
            </div> */}

            <div className="space-y-3">
              <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500">
                Apply Filters
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">Explore EVs & Batteries</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-stretch">
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  {/* Ảnh sản phẩm */}
                  {product.imageUrls && (
                    <img
                      src={product?.imageUrls[0] || ""}
                      alt={product?.title}
                      className="h-48 w-full object-cover"
                    />
                  )}

                  {/* Nội dung */}
                  <div className="flex flex-col flex-1 p-4">
                    {/* Tiêu đề & nhãn */}
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2 flex-1 min-h-[48px]">
                        {product.title}
                      </h3>
                      {product.is_auction && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded whitespace-nowrap">
                          Auction
                        </span>
                      )}
                    </div>

                    {/* Giá */}
                    <div className="text-2xl font-bold text-indigo-600 mb-2">
                      {getDisplayPrice(product)}
                    </div>

                    {/* Mô tả */}
                    <p className="text-gray-600 text-sm line-clamp-3 min-h-[60px] mb-3">
                      {product.description || "No description provided."}
                    </p>

                    {/* Thông tin kỹ thuật */}
                    {product.soh_percent && (
                      <div className="text-xs text-gray-600 space-y-1 mb-3 min-h-[60px]">
                        <div>SOH: {product.soh_percent}%</div>
                        {product.cycle_count && (
                          <div>Cycles: {product.cycle_count}</div>
                        )}
                        {product.nominal_voltage_v && (
                          <div>Voltage: {product.nominal_voltage_v}V</div>
                        )}
                        {product.weight_kg && (
                          <div>Weight: {product.weight_kg}kg</div>
                        )}
                      </div>
                    )}

                    {/* Trạng thái + Người bán */}
                    <div className="flex items-center justify-between mt-auto mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getCondition(product) === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getCondition(product)}
                      </span>
                      <div className="text-xs text-gray-500 truncate max-w-[120px] text-right">
                        by {product.seller.fullName}
                      </div>
                    </div>

                    {/* Nút */}
                    <button
                      onClick={() => navigate(`/productdetail/${product.id}`)}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 mt-auto"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-md ${
                        page === currentPage
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Company
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Resources
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Legal
              </a>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
