import { useState } from "react";
import { Search, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import useWallet from "../../../hooks/useWallet";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import WalletDisplay from "../../../layouts/Header/WalletDisplay";

export interface Transaction {
  id: string;
  createdAt: string;
  description: string;
  type: "Deposit" | "Withdraw";
  amount: number;
}

export default function ProfileWallet() {
  const [searchText, setSearchText] = useState("");
  const { transactions, myWallet } = useWallet();

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description
      .toLowerCase()
      .includes(searchText.toLowerCase());
    return matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-ocean-500 to-energy-500 bg-clip-text text-transparent">
          Wallet
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View your wallet balance and transaction history
        </p>
      </div>

      {/* Wallet Balance Card */}
      {myWallet && (
        <Card className="border-ocean-100/50 shadow-md bg-gradient-to-br from-ocean-50/60 to-energy-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-ocean-700">
              <Wallet className="w-5 h-5 text-ocean-600" />
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WalletDisplay wallet={myWallet} />
          </CardContent>
        </Card>
      )}

      {/* Transaction History Card */}
      <Card className="border-ocean-200/30 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-ocean-700">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search transactions..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          {filteredTransactions.length > 0 ? (
            <div className="rounded-xl border border-ocean-200/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-ocean-100/60 to-energy-100/40">
                    <TableHead className="font-semibold text-ocean-700">Date</TableHead>
                    <TableHead className="font-semibold text-ocean-700">Description</TableHead>
                    <TableHead className="font-semibold text-ocean-700">Type</TableHead>
                    <TableHead className="font-semibold text-ocean-700 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => {
                    const isDeposit = transaction.type === "Deposit";
                    return (
                      <TableRow
                        key={transaction.id}
                        className="hover:bg-ocean-50/50 transition-colors"
                      >
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-ocean-700">
                            {transaction.description}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
                              isDeposit
                                ? "bg-green-100 text-green-800 border border-green-300"
                                : "bg-red-100 text-red-800 border border-red-300"
                            )}
                          >
                            {isDeposit ? (
                              <TrendingDown className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingUp className="w-3.5 h-3.5" />
                            )}
                            {transaction.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              "font-semibold",
                              isDeposit
                                ? "text-green-600"
                                : "text-red-600"
                            )}
                          >
                            {isDeposit ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex flex-col items-center gap-3 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-ocean-100 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-ocean-500" />
                </div>
                <p className="text-base font-medium">No transactions found</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
