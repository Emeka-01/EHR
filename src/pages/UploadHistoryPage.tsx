import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Download, Eye, Search, Filter } from 'lucide-react';
export function UploadHistoryPage() {
  const { getUploads } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const uploads = getUploads();
  const filteredUploads = uploads.filter((file) => {
    const matchesSearch = file.fileName.
    toLowerCase().
    includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || file.fileType === filterType;
    return matchesSearch && matchesFilter;
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document History</h1>
          <p className="text-gray-500">View and manage your medical records</p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full md:w-64" />

          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">

            <option value="All">All Types</option>
            <option value="PDF">PDF</option>
            <option value="JPEG">JPEG</option>
            <option value="PNG">PNG</option>
          </select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Date Uploaded</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUploads.length > 0 ?
              filteredUploads.map((file) =>
              <tr
                key={file.id}
                className="hover:bg-gray-50 transition-colors">

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded text-blue-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {file.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                    className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${file.fileType === 'PDF' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}
                      `}>

                        {file.fileType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {file.fileSize}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {file.uploadDate}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View">

                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download">

                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
              ) :

              <tr>
                  <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500">

                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No documents found matching your criteria.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </Card>
    </div>);

}