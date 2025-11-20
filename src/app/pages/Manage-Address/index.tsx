"use client";

import type React from "react";
import { useState } from "react";
import { message } from "antd";
import userAddress from "../../hooks/useAddress";
import AddressFormModal from "./AddressFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import AddressList from "./AddressList";

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
      message.success("Address deleted successfully");
    } catch (error) {
      message.error("Failed to delete address");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await fetch(`/api/addresses/${addressId}/set-default`, {
        method: "PATCH",
      });
      message.success("Default address updated");
    } catch (error) {
      console.error("Error setting default address:", error);
      message.error("Failed to set default address");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-[800px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
          <button
            onClick={handleAddAddress}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Address
          </button>
        </div>

        {/* Address List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Addresses</h2>
          </div>

          <AddressList
            addresses={addresses}
            isLoading={isLoading}
            onEdit={handleEditAddress}
            onDelete={handleDeleteClick}
            onSetDefault={handleSetDefault}
          />
        </div>
      </div>

      {/* Address Form Modal */}
      <AddressFormModal
        open={showModal}
        address={editingAddress || undefined}
        onClose={() => {
          setShowModal(false);
          setEditingAddress(null);
        }}
        onSuccess={() => {
          message.success(
            editingAddress
              ? "Address updated successfully"
              : "New address added successfully"
          );
          setShowModal(false);
          setEditingAddress(null);
        }}
        handleCreateAddress={handleCreateAddress}
        handleUpdateAddress={handleUpdateAddress}
      />

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
