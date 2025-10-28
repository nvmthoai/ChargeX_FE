
import { useState } from "react";
import useProduct from "../../hooks/useProduct";
import { Link, useNavigate } from "react-router-dom";


export default function EVMarketplace() {
  const navigate = useNavigate();
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [batteryCapacity, setBatteryCapacity] = useState([0, 100]);
  const [yearRange, setYearRange] = useState([2010, 2024]);
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>(
    []
  );
  const {products} = useProduct();
  
  const makes = ["Audi", "BMW", "Lucid", "Nissan", "Chevrolet", "Porsche"];
  const conditions = ["New", "Used", "Refurbished"];
  const vehicleTypes = ["EV", "E-bike", "Scooter"];

  const handleMakeChange = (make: string, checked: boolean) => {
    if (checked) {
      setSelectedMakes([...selectedMakes, make]);
    } else {
      setSelectedMakes(selectedMakes.filter((m) => m !== make));
    }
  };

  const handleConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setSelectedConditions([...selectedConditions, condition]);
    } else {
      setSelectedConditions(selectedConditions.filter((c) => c !== condition));
    }
  };

  const handleVehicleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedVehicleTypes([...selectedVehicleTypes, type]);
    } else {
      setSelectedVehicleTypes(selectedVehicleTypes.filter((t) => t !== type));
    }
  };

  const getDisplayPrice = (product: (typeof products)[0]) => {
    if (product.price_now)
      return `$${Number(product.price_now).toLocaleString()}`;
    if (product.price_buy_now)
      return `$${Number(product.price_buy_now).toLocaleString()}`;
    return `$${Number(product.price_start).toLocaleString()}`;
  };

  const getCondition = (product: (typeof products)[0]) => {
    if (product.condition_grade) return `Grade ${product.condition_grade}`;
    return product.status === "active" ? "Active" : "Draft";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-6">
            <div className="text-sm text-gray-500">Marketplace Home</div>
            <div className="flex items-center space-x-2">
              <div className="text-indigo-600 font-bold text-xl">
                ⚡EVTradeHub
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search EVs and Batteries..."
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/">
              <button className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 cursor-pointer">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5-5-5h5v-12h0z"
                  />
                </svg>
                <span className="hidden md:inline">Notifications</span>
              </button>
            </Link>
            <Link to="/profile/wallet">
              <button className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 cursor-pointer">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span className="hidden md:inline">Wallet</span>
              </button>
            </Link>
            <img
              src="/diverse-user-avatars.png"
              alt="User"
              className="h-8 w-8 rounded-full cursor-pointer"
            />
          </div>
        </div>
      </header>

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
              <h4 className="font-medium mb-3">Vehicle Type</h4>
              <div className="space-y-2">
                {vehicleTypes.map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedVehicleTypes.includes(type)}
                      onChange={(e) =>
                        handleVehicleTypeChange(type, e.target.checked)
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3">Make</h4>
              <div className="space-y-2">
                {makes.map((make) => (
                  <label key={make} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedMakes.includes(make)}
                      onChange={(e) => handleMakeChange(make, e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{make}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3">Condition</h4>
              <div className="space-y-2">
                {conditions.map((condition) => (
                  <label key={condition} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedConditions.includes(condition)}
                      onChange={(e) =>
                        handleConditionChange(condition, e.target.checked)
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {condition}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3">Price Range</h4>
              <input
                type="range"
                min="0"
                max="100000"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([0, Number.parseInt(e.target.value)])
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>$0</span>
                <span>${priceRange[1].toLocaleString()}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3">Battery Capacity</h4>
              <input
                type="range"
                min="0"
                max="100"
                value={batteryCapacity[1]}
                onChange={(e) =>
                  setBatteryCapacity([0, Number.parseInt(e.target.value)])
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>0 kWh</span>
                <span>{batteryCapacity[1]} kWh</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3">Year</h4>
              <input
                type="range"
                min="2010"
                max="2024"
                value={yearRange[1]}
                onChange={(e) =>
                  setYearRange([2010, Number.parseInt(e.target.value)])
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>2010</span>
                <span>{yearRange[1]}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3">Location</h4>
              <input
                type="text"
                placeholder="Enter Location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-3">
              <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500">
                Apply Filters
              </button>
              <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">
                Reset Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">Explore EVs & Batteries</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                 {
                  product.imageUrls &&  <img
                    src={product?.imageUrls[0] || ""}
                    alt={product?.title}
                    className="h-48 w-full object-cover"
                  />
                 }
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                        {product.title}
                      </h3>
                      {product.is_auction && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded whitespace-nowrap">
                          Auction
                        </span>
                      )}
                    </div>

                    <div className="text-2xl font-bold text-indigo-600">
                      {getDisplayPrice(product)}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3">
                      {product.description}
                    </p>

                    {product.soh_percent && (
                      <div className="text-xs text-gray-600 space-y-1">
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

                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getCondition(product) === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getCondition(product)}
                      </span>
                      <div className="text-xs text-gray-500">
                        by {product.seller.fullName}
                      </div>
                    </div>

                    <button 
                    onClick={() => navigate(`/productdetail/${product.id}`)}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-2">
              <button className="px-3 py-2 text-gray-500 hover:text-gray-700">
                Previous
              </button>
              <button className="px-3 py-2 bg-indigo-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-2 text-gray-500 hover:text-gray-700">
                2
              </button>
              <button className="px-3 py-2 text-gray-500 hover:text-gray-700">
                Next
              </button>
            </div>
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
