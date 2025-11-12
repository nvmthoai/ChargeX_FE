"use client";

import type React from "react";
import { useState } from "react";
import { Plus, MapPin } from "lucide-react";
import userAddress from "../../hooks/useAddress";
import AddressFormModal from "./AddressFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import AddressList from "./AddressList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const AddressManagement: React.FC = () => {
  const {
    addresses,
    handleCreateAddress,
    handleDeleteAddress,
    handleUpdateAddress,
    isLoading,
  } = userAddress();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleDeleteClick = (addressId: string) => {
    setDeletingAddressId(addressId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAddressId) return;
    setDeleteLoading(true);
    try {
      await handleDeleteAddress(deletingAddressId);
      setShowDeleteModal(false);
      setDeletingAddressId(null);
    } catch (error) {
      console.error("Failed to delete address", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await fetch(`/api/addresses/${addressId}/set-default`, {
        method: "PATCH",
      });
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ocean-500 to-energy-500 bg-clip-text text-transparent">
            My Addresses
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your delivery addresses
          </p>
        </div>
        <Button onClick={handleAddAddress} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Address
        </Button>
      </div>

      {/* Address List Card */}
      <Card className="border-ocean-200/30 shadow-sm bg-white">
        <CardHeader className="border-b border-ocean-200/30 bg-white">
          <CardTitle className="flex items-center gap-2 text-ocean-700">
            <MapPin className="w-5 h-5 text-ocean-600" />
            Saved Addresses ({addresses.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AddressList
            addresses={addresses}
            isLoading={isLoading}
            onEdit={handleEditAddress}
            onDelete={handleDeleteClick}
            onSetDefault={handleSetDefault}
          />
        </CardContent>
      </Card>

      {/* Address Form Modal */}
      {showModal && (
        <AddressFormModal
          address={editingAddress}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
          }}
          handleCreateAddress={handleCreateAddress}
          handleUpdateAddress={handleUpdateAddress}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          loading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeletingAddressId(null);
          }}
        />
      )}
    </div>
  );
};

export default AddressManagement;
