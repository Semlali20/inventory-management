import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Loading } from '@/components/ui/Loading';
import { qualityService } from '@/services/quality.service';
import { QualityControl, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';
import { format } from '@/utils/format';

export const QualityPage = () => {
  const [qualityControls, setQualityControls] = useState<QualityControl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const fetchQualityControls = async (page: number = 0) => {
    setIsLoading(true);
    try {
      const response: PaginatedResponse<QualityControl> = await qualityService.getQualityControls({
        page,
        size: pagination.size,
      });
      setQualityControls(response.content);
      setPagination({
        page: response.number,
        size: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      });
    } catch (error) {
      toast.error('Failed to fetch quality controls');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityControls();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quality Control</h1>
        <p className="mt-1 text-sm text-gray-600">Manage quality control records and quarantine</p>
      </div>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Control Number</TableHeader>
              <TableHeader>Item</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Passed</TableHeader>
              <TableHeader>Tested Date</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {qualityControls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No quality controls found
                </TableCell>
              </TableRow>
            ) : (
              qualityControls.map((control) => (
                <TableRow key={control.id}>
                  <TableCell className="font-medium">{control.controlNumber}</TableCell>
                  <TableCell>{control.item?.name || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        control.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {control.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        control.passed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {control.passed ? 'Yes' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {control.testedDate ? format.date(control.testedDate, 'PP') : '-'}
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

