import { useEffect, useState } from 'react';
import { fetchData, getQueryString, patchData } from '../../../../mocks/CallingAPI';
import SmallSpinner from '../../../components/SmallSpinner/SmallSpinner';
import AdminDataTable, { type Column, type FilterOption } from '../../../layouts/components/AdminDataTable';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DefaultAvatar = '/lightning_thunder.png';

const KycManagement = () => {
    const [KYCs, setKYCs] = useState<Record<string, any>>({});
    const [selectedDocument, setSelectedDocuments] = useState<Record<string, any>>({});
    const [page, setPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedSortBy, setSelectedSortBy] = useState('');
    const [selectedSortOrder, setSelectedSortOrder] = useState('');
    const [searchText, setSearchText] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [changeStatusLoading, setChangeStatusLoading] = useState(-1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token') || '';
        const fetchDataAPI = async () => {
            try {
                const queryParams = {
                    page: page,
                    limit: 10,
                    status: selectedStatus || undefined,
                    level: selectedLevel || undefined,
                    sortBy: selectedSortBy || undefined,
                    sortOrder: selectedSortOrder || undefined,
                };
                const PageKycsResponse = await fetchData(`/kyc-profiles${getQueryString(queryParams)}`, token);
                setKYCs(PageKycsResponse.data);
            } catch (error) {
                console.error(error);
                setError('Error');
            } finally {
                setLoading(false);
            }
        };

        fetchDataAPI();
    }, [refresh, page, selectedStatus, selectedLevel, selectedSortBy, selectedSortOrder]);

    // Filter by search
    const filteredData = KYCs?.data?.filter((kyc: any) => {
        if (!searchText) return true;
        const search = searchText.toLowerCase();
        return (
            kyc.user?.fullName?.toLowerCase().includes(search) ||
            kyc.user?.email?.toLowerCase().includes(search)
        );
    }) || [];

    const changeStatus = async ({ index, id, value }: any) => {
        setChangeStatusLoading(index);
        const token = localStorage.getItem('token') || '';
        const KycData = {
            status: value,
            note: 'You are ' + value
        }
        try {
            await patchData(`/kyc-profiles/${id}/status`, KycData, token);
        } catch (error) {
            console.error(error);
            setError('Error');
        } finally {
            setChangeStatusLoading(-1);
            setRefresh(p => p + 1);
        }
    }

    const filters: FilterOption[] = [
        {
            key: 'status',
            label: 'Status',
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
            ],
        },
        {
            key: 'level',
            label: 'Level',
            options: [
                { value: 'basic', label: 'Basic' },
                { value: 'advanced', label: 'Advanced' },
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
            key: 'sortOrder',
            label: 'Sort Order',
            options: [
                { value: 'ASC', label: 'ASC' },
                { value: 'DESC', label: 'DESC' },
            ],
        },
    ];

    const filterValues = {
        status: selectedStatus,
        level: selectedLevel,
        sortBy: selectedSortBy,
        sortOrder: selectedSortOrder,
    };

    const handleFilterChange = (key: string, value: string) => {
        switch (key) {
            case 'status':
                setSelectedStatus(value);
                break;
            case 'level':
                setSelectedLevel(value);
                break;
            case 'sortBy':
                setSelectedSortBy(value);
                break;
            case 'sortOrder':
                setSelectedSortOrder(value);
                break;
        }
        setPage(1);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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
            render: (kyc) => (
                <div className="flex items-center gap-3">
                    <img
                        src={kyc.user?.avatar || DefaultAvatar}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <div className="font-medium text-dark-800 dark:text-dark-200">{kyc.user?.fullName}</div>
                        <div className="text-xs text-muted-foreground">{kyc.user?.role}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'email',
            title: 'EMAIL',
            render: (kyc) => (
                <div className="flex items-center gap-2">
                    <span>{kyc.user?.email}</span>
                    {kyc.user?.emailVerified && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                </div>
            ),
        },
        {
            key: 'createdAt',
            title: 'CREATED',
            render: (kyc) => new Date(kyc.createdAt).toLocaleDateString(),
        },
        {
            key: 'status',
            title: 'STATUS',
            render: (kyc, index) => (
                changeStatusLoading === index ? (
                    <SmallSpinner />
                ) : kyc.status === 'pending' ? (
                    <Select
                        value={kyc.status}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => changeStatus({ index, id: kyc.kycProfileId, value: e.target.value })}
                        className="h-8 text-xs"
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </Select>
                ) : (
                    <span className={cn("px-2 py-1 rounded-md text-xs font-medium", getStatusColor(kyc.status))}>
                        {kyc.status}
                    </span>
                )
            ),
        },
        {
            key: 'actions',
            title: 'ACTIONS',
            render: (kyc) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDocuments(kyc.documents?.find((doc: any) => doc.type === 'front_id'))}
                    >
                        Front ID
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDocuments(kyc.documents?.find((doc: any) => doc.type === 'back_id'))}
                    >
                        Back ID
                    </Button>
                </div>
            ),
        },
    ];

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6">
            <AdminDataTable
                title="KYC Management"
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
                    total: KYCs?.total || filteredData.length,
                    onPageChange: setPage,
                }}
            />

            {/* Document Viewer Modal */}
            {selectedDocument && Object.keys(selectedDocument).length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-dark-800 rounded-xl p-6 max-w-4xl max-h-[90vh] overflow-auto border border-ocean-800/30">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4"
                            onClick={() => setSelectedDocuments({})}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                        <div className="mt-4">
                            <img
                                src={selectedDocument.fileUrl || DefaultAvatar}
                                alt="document"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KycManagement;
