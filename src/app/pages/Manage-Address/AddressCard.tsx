"use client";

import type React from "react";
import { MapPin, Home, Building2, Edit, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Address {
  addressId: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  wardCode: string;
  districtId: number;
  provinceId: number;
  note: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddressCardProps {
  address: Address;
  mode?: "profile" | "checkout";
  onEdit: (address: Address) => void;
  onDelete?: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  mode = "profile",
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  const Icon = address.label === "Office" ? Building2 : Home;

  return (
    <div
      className={cn(
            "p-6 transition-all rounded-xl border-2",
            address.isDefault
              ? "border-ocean-400 bg-ocean-50/40"
              : "border-ocean-100/50 bg-white hover:border-ocean-200 hover:shadow-md",
        mode === "checkout" && "cursor-pointer"
      )}
    >
      <div className="flex justify-between items-start gap-4">
        {/* Address Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-2 bg-ocean-100 dark:bg-ocean-900/30 rounded-lg">
              <Icon className="w-5 h-5 text-ocean-600 dark:text-ocean-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ocean-700">
                {address.fullName}
              </h3>
              <p className="text-sm text-muted-foreground">{address.phone}</p>
            </div>
            {address.isDefault && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-ocean-100 dark:bg-ocean-900/30 text-ocean-700 dark:text-ocean-300 text-xs font-semibold rounded-full border border-ocean-300 dark:border-ocean-700">
                <Star className="w-3 h-3 fill-current" />
                Default
              </span>
            )}
            {address.label === "Office" && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                Office
              </span>
            )}
          </div>

          <div className="flex items-start gap-2 text-sm text-ocean-600">
            <MapPin className="w-4 h-4 mt-0.5 text-ocean-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-ocean-700">{address.line1}</p>
              {address.note && (
                <p className="text-muted-foreground italic mt-1">
                  Note: {address.note}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {mode === "profile" && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(address)}
              className="gap-1"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            {!address.isDefault && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSetDefault?.(address.addressId)}
                  className="gap-1"
                >
                  <Star className="w-4 h-4" />
                  Set Default
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete?.(address.addressId)}
                  className="gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressCard;
