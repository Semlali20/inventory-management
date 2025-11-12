import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Loading } from '@/components/ui/Loading';
import { inventoryService } from '@/services/inventory.service';
import { Inventory, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';
import { format } from '@/utils/format';

export const InventoryPage = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const fetchInventory = async (page: number = 0) => {
    setIsLoading(true);
    try {
      const response: PaginatedResponse<Inventory> = await inventoryService.getInventory({
        page,
        size: pagination.size,
      });
      setInventory(response.content);
      setPagination({
        page: response.number,
        size: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      });
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="mt-1 text-sm text-gray-600">View and manage inventory levels</p>
      </div>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Item</TableHeader>
              <TableHeader>Location</TableHeader>
              <TableHeader>Quantity</TableHeader>
              <TableHeader>Available</TableHeader>
              <TableHeader>Reserved</TableHeader>
              <TableHeader>Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No inventory found
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.item?.name || '-'}</TableCell>
                  <TableCell>{item.location?.name || '-'}</TableCell>
                  <TableCell>{format.number(item.quantity)}</TableCell>
                  <TableCell>{format.number(item.availableQuantity)}</TableCell>
                  <TableCell>{format.number(item.reservedQuantity)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'AVAILABLE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

