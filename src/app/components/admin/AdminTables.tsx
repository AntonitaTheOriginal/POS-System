import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import { Table, TableStatus } from '../../data/appData';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { EllipsisVertical, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

export function AdminTables() {
  const { tables, addTable, updateTable, deleteTable, currentUser } = useApp();
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    number: '',
    capacity: '',
  });

  const resetForm = () => {
    setFormData({
      number: '',
      capacity: '',
    });
  };

  const handleAddTable = async () => {
    if (!formData.number || !formData.capacity) {
      toast.error('Please fill all required fields');
      return;
    }

    const number = parseInt(formData.number);
    const capacity = parseInt(formData.capacity);

    if (isNaN(number) || number <= 0) {
      toast.error('Please enter a valid table number');
      return;
    }

    // Check if table number already exists
    if (tables.some(t => t.number === number)) {
      toast.error('Table number already exists');
      return;
    }

    setIsLoading(true);

    const newTable: Table = {
      id: `t${Date.now()}`,
      number: number,
      capacity: capacity,
      status: 'available',
    };

    addTable(newTable);
    toast.success('Table added successfully');
    setIsAddDialogOpen(false);
    resetForm();
    setIsLoading(false);
  };

  const handleEditTable = async () => {
    if (!editingTable) return;

    if (!formData.number || !formData.capacity) {
      toast.error('Please fill all required fields');
      return;
    }

    const number = parseInt(formData.number);
    const capacity = parseInt(formData.capacity);

    // Check if table number already exists (excluding current table)
    if (tables.some(t => t.number === number && t.id !== editingTable.id)) {
      toast.error('Table number already exists');
      return;
    }

    setIsLoading(true);

    updateTable(editingTable.id, {
      number: number,
      capacity: capacity,
    });

    toast.success('Table updated successfully');
    setIsEditDialogOpen(false);
    setEditingTable(null);
    resetForm();
    setIsLoading(false);
  };

  const openEditDialog = (table: Table) => {
    setEditingTable(table);
    setFormData({
      number: table.number.toString(),
      capacity: table.capacity.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteTable = (table: Table) => {
    if (table.status !== 'available') {
      toast.error('Cannot delete an occupied or reserved table');
      return;
    }
    deleteTable(table.id);
    toast.success(`Table #${table.number} deleted successfully`);
  };

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200';
      case 'occupied': return 'bg-red-100 text-red-700 border-red-200';
      case 'reserved': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl mb-2">Table Management</h2>
            <p className="text-gray-600">Manage restaurant tables and seating capacity</p>
          </div>
          {currentUser?.role === 'admin' && (
            <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Table
            </Button>
          )}
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.length === 0 ? (
            <Card className="col-span-full p-12 text-center">
              <div className="text-5xl mb-4">🪑</div>
              <h3 className="text-xl mb-2">No Tables Found</h3>
              <p className="text-gray-500 mb-4">Start by adding your first table</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Add Table
              </Button>
            </Card>
          ) : (
            tables.sort((a, b) => a.number - b.number).map((table) => (
              <Card key={table.id} className="p-4 relative hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-xl">
                    {table.number}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(table)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            onSelect={(e) => e.preventDefault()} 
                            className="text-red-600 focus:text-red-600"
                            disabled={table.status !== 'available'}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Table</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete Table #{table.number}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteTable(table)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Capacity: {table.capacity} Persons</span>
                  </div>
                  <Badge variant="outline" className={`w-full justify-center py-1 ${getStatusColor(table.status)}`}>
                    {table.status.toUpperCase()}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Table Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
            <DialogDescription>
              Create a new table for your restaurant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-number">Table Number *</Label>
              <Input
                id="add-number"
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="e.g., 1"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-capacity">Seating Capacity *</Label>
              <Input
                id="add-capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="e.g., 4"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddTable} disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Table'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>
              Update table information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-number">Table Number *</Label>
              <Input
                id="edit-number"
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="e.g., 1"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Seating Capacity *</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="e.g., 4"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditingTable(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditTable} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
