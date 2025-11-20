import { useEffect, useState } from 'react';
import { fetchData, getQueryString, patchData } from '../../../../mocks/CallingAPI';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import SmallSpinner from '../../../components/SmallSpinner/SmallSpinner';
import AdminDataTable, { type Column, type FilterOption } from '../../../layouts/components/AdminDataTable';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Plus, CheckCircle2 } from 'lucide-react';

const DefaultAvatar = '/lightning_thunder.png';

const UserManagement = () => {
    const [USERs, setUSERs] = useState<Record<string, any>>({});
    const [page, setPage] = useState(1);
    const [selectedEmailVerified, setSelectedEmailVerified] = useState('');
    const [selectedIsActive, setSelectedIsActive] = useState('');
    const [selectedIsDelete, setSelectedIsDelete] = useState('');
    const [selectedSortBy, setSelectedSortBy] = useState('');
    const [selectedOrder, setSelectedOrder] = useState('');
    const [searchText, setSearchText] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [changeEmailVerifiedLoading, setChangeEmailVerifiedLoading] = useState(-1);
    const [changeIsActiveLoading, setChangeIsActiveLoading] = useState(-1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [popupProps, setPopupProps] = useState<Record<string, any>>({});

    useEffect(() => {
        const token = localStorage.getItem('token') || '';
        const fetchDataAPI = async () => {
            try {
                const queryParams = {
                    page: page,
                    limit: 10,
                    emailVerified: selectedEmailVerified || undefined,
                    isActive: selectedIsActive || undefined,
                    isDelete: selectedIsDelete || undefined,
                    sortBy: selectedSortBy || undefined,
                    order: selectedOrder || undefined,
                };
                const PageUsersResponse = await fetchData(`/users${getQueryString(queryParams)}`, token);
                console.log("PageUsersResponse.data", PageUsersResponse.data.data);
                setUSERs(PageUsersResponse.data);
            } catch (error) {
                setError('Error');
            } finally {
                setLoading(false);
            }
        };

        fetchDataAPI();
    }, [refresh, page, selectedEmailVerified, selectedIsActive, selectedIsDelete, selectedSortBy, selectedOrder]);

    // Filter data by search text
    const filteredData = USERs?.data?.filter((customer: any) => {
        if (!searchText) return true;
        const search = searchText.toLowerCase();
        return (
            customer.fullName?.toLowerCase().includes(search) ||
            customer.email?.toLowerCase().includes(search) ||
            customer.phone?.includes(search)
        );
    }) || [];

    const changeEmailVerified = async ({ index, id, value }: any) => {
        setChangeEmailVerifiedLoading(index);
        const token = localStorage.getItem('token') || '';
        const EmailVerifieData = {
            emailVerified: value == 'true' ? true : false
        }
        try {
            await patchData(`/users/${id}/admin-update`, EmailVerifieData, token);
        } catch (error) {
            console.error(error);
            setError('Error');
        } finally {
            setChangeEmailVerifiedLoading(-1);
            setRefresh(p => p + 1);
        }
    }

    const changeIsActive = async ({ index, id, value }: any) => {
        setChangeIsActiveLoading(index);
        const token = localStorage.getItem('token') || '';
        const IsActiveData = {
            isActive: value == 'true' ? true : false
        }
        try {
            await patchData(`/users/${id}/admin-update`, IsActiveData, token);
        } catch (error) {
            console.error(error);
            setError('Error');
        } finally {
            setChangeIsActiveLoading(-1);
            setRefresh(p => p + 1);
        }
    }

    const changeIsDelete = () => {
        // TODO: Implement delete API
        return;
    }

    const filters: FilterOption[] = [
        {
            key: 'emailVerified',
            label: 'Email Verified',
            options: [
                { value: 'true', label: 'Verified' },
                { value: 'false', label: 'Unverified' },
            ],
        },
        {
            key: 'isActive',
            label: 'Status',
            options: [
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
            ],
        },
        {
            key: 'isDelete',
            label: 'Deleted',
            options: [
                { value: 'true', label: 'Deleted' },
                { value: 'false', label: 'Not Deleted' },
            ],
        },
        {
            key: 'sortBy',
            label: 'Sort By',
            options: [
                { value: 'createdAt', label: 'Created' },
                { value: 'updatedAt', label: 'Updated' },
            ],
        },
        {
            key: 'order',
            label: 'Order',
            options: [
                { value: 'ASC', label: 'ASC' },
                { value: 'DESC', label: 'DESC' },
            ],
        },
    ];

    const filterValues = {
        emailVerified: selectedEmailVerified,
        isActive: selectedIsActive,
        isDelete: selectedIsDelete,
        sortBy: selectedSortBy,
        order: selectedOrder,
    };

    const handleFilterChange = (key: string, value: string) => {
        switch (key) {
            case 'emailVerified':
                setSelectedEmailVerified(value);
                break;
            case 'isActive':
                setSelectedIsActive(value);
                break;
            case 'isDelete':
                setSelectedIsDelete(value);
                break;
            case 'sortBy':
                setSelectedSortBy(value);
                break;
            case 'order':
                setSelectedOrder(value);
                break;
        }
        setPage(1);
    };

    const columns: Column<any>[] = [
        {
            key: 'index',
            title: '#',
            width: '60px',
            render: (_, index) => index + 1 + (page - 1) * 10,
        },
        {
            key: 'customer',
            title: 'CUSTOMER',
            render: (customer) => (
                <div className="flex items-center gap-3">
                    <img
                        src={customer.avatar || DefaultAvatar}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <div className="font-medium text-white dark:text-dark-200">{customer.fullName}</div>
                        <div className="text-xs text-muted-foreground">{customer.role}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'email',
            title: 'EMAIL',
            render: (customer, index) => (
                <div className="flex items-center gap-2">
                    <span>{customer.email}</span>
                    {customer.emailVerified && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    {changeEmailVerifiedLoading === index ? (
                        <SmallSpinner />
                    ) : (
                        <Select
                            value={customer.emailVerified ? 'true' : 'false'}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => changeEmailVerified({ index, id: customer.userId, value: e.target.value })}
                            className="h-8 text-xs"
                        >
                            <option value="true">Verified</option>
                            <option value="false">Unverified</option>
                        </Select>
                    )}
                </div>
            ),
        },
        {
            key: 'phone',
            title: 'PHONE NUMBER',
            render: (customer) => customer.phone || '-',
        },
        {
            key: 'createdAt',
            title: 'ASIGN',
            render: (customer) => new Date(customer.createdAt).toLocaleDateString(),
        },
        {
            key: 'status',
            title: 'STATUS',
            render: (customer, index) => (
                changeIsActiveLoading === index ? (
                    <SmallSpinner />
                ) : (
                    <Select
                        value={customer.isActive ? 'true' : 'false'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => changeIsActive({ index, id: customer.userId, value: e.target.value })}
                        className="h-8 text-xs"
                    >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </Select>
                )
            ),
        },
        {
            key: 'actions',
            title: 'ACTIONS',
            render: (customer, index) => (
                <div className="flex items-center gap-2">
                    {customer.isDelete ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPopupProps({ index, id: customer.id, value: false })}
                        >
                            Restore
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setPopupProps({ index, id: customer.id, value: true })}
                        >
                            Delete
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    console.log("Rerender");

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6">
            <AdminDataTable
                title="User Management"
                data={filteredData}
                columns={columns}
                loading={loading}
                searchPlaceholder="Find by name or email..."
                searchValue={searchText}
                onSearchChange={setSearchText}
                filters={filters}
                filterValues={filterValues}
                onFilterChange={handleFilterChange}
                onRefresh={() => setRefresh(p => p + 1)}
                pagination={{
                    page,
                    limit: 10,
                    total: USERs?.total || filteredData.length,
                    onPageChange: setPage,
                }}
                headerActions={
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add more account
                    </Button>
                }
            />

            {popupProps && Object.keys(popupProps).length > 0 && (
                <ConfirmDialog
                    title="DELETE CONFIRMATION"
                    message="Are you sure you want to delete this customer?"
                    confirm="DELETE"
                    cancel="CANCEL"
                    color="#dc354580"
                    onConfirm={() => {
                        changeIsDelete();
                        setPopupProps({});
                    }}
                    onCancel={() => setPopupProps({})}
                />
            )}
        </div>
    );
};

export default UserManagement;
