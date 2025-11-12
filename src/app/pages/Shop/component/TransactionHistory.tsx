import AllOrder from "../transaction/AllOrder";

export default function TransactionHistory() {
  return (
    <div>
      <div className="border border-dashed border-ocean-200/30 rounded-xl p-8 bg-gradient-to-br from-white/95 via-ocean-50/20 to-energy-50/20 text-dark-400 text-center shadow-sm">
              <AllOrder/>
            </div>
    </div>
  )
}
