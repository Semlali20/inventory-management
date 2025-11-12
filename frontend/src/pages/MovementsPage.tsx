import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Loading } from '@/components/ui/Loading';
import { movementService } from '@/services/movement.service';
import { Movement, PaginatedResponse } from '@/types';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from '@/utils/format';

export const MovementsPage = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const fetchMovements = async (page: number = 0) => {
    setIsLoading(true);
    try {
      const response: PaginatedResponse<Movement> = await movementService.getMovements({
        page,
        size: pagination.size,
      });
      setMovements(response.content);
      setPagination({
        page: response.number,
        size: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      });
    } catch (error) {
      toast.error('Failed to fetch movements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movements</h1>
          <p className="mt-1 text-sm text-gray-600">Track stock movements and transfers</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Movement
        </Button>
      </div>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Movement Number</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>From</TableHeader>
              <TableHeader>To</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Requested Date</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No movements found
                </TableCell>
              </TableRow>
            ) : (
              movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">{movement.movementNumber}</TableCell>
                  <TableCell>{movement.type}</TableCell>
                  <TableCell>{movement.fromLocation?.name || '-'}</TableCell>
                  <TableCell>{movement.toLocation?.name || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        movement.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : movement.status === 'IN_PROGRESS'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {movement.status}
                    </span>
                  </TableCell>
                  <TableCell>{format.date(movement.requestedDate, 'PP')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

