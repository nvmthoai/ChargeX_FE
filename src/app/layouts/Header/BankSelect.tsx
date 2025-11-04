"use client"

import { Select, Avatar, Spin } from "antd"
import { useMemo } from "react"

interface Bank {
  id: number
  name: string
  code: string
  bin: string
  shortName: string
  logo: string
  transferSupported: number
  lookupSupported: number
}

interface BankSelectProps {
  banks: Bank[]
  loading: boolean
  value?: string
  onChange?: (value: string) => void
}

export default function BankSelect({ banks, loading, value, onChange }: BankSelectProps) {
  const options = useMemo(
    () =>
      banks.map((bank) => ({
        label: (
          <div className="flex items-center gap-3">
            <Avatar src={bank.logo} size={24} alt={bank.name} />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{bank.name}</span>
              <span className="text-xs text-gray-500">{bank.code}</span>
            </div>
          </div>
        ),
        value: bank.code,
      })),
    [banks],
  )

  return (
    <Select
      placeholder="Select your bank"
      value={value}
      onChange={onChange}
      options={options}
      loading={loading}
      disabled={loading || banks.length === 0}
      notFoundContent={loading ? <Spin /> : "No banks found"}
      className="w-full"
    />
  )
}
