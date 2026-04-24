import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import { User, UserRole, businessTypeConfigs } from '../../data/appData';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { EllipsisVertical, Plus, Pencil, Trash2, KeyRound, Lock } from 'lucide-react';
import { toast } from 'sonner';

export function AdminUsers() {
  const { users, addUser, updateUser, deleteUser, currentUser, settings } = useApp();
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    role: 'cashier' as UserRole,
    password: '',
  });
  
  const [newPassword, setNewPassword] = useState('');

  // Get business configuration
  const businessConfig = businessTypeConfigs[settings.businessType];
  
  // Sync form data when editing user changes
  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        username: editingUser.username,
        phone: editingUser.phone,
        role: editingUser.role,
        password: '',
      });
    }
  }, [editingUser]);
  
  // Check if role is active for current business type
  const isRoleActive = (role: UserRole) => {
    return businessConfig.activeRoles.includes(role);
  };

  // Get role status badge
  const getRoleStatusBadge = (role: UserRole) => {
    if (isRoleActive(role)) {
      return <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-300">Active</Badge>;
    }
    return <Badge variant="outline" className="ml-2 text-xs bg-gray-100 text-gray-500 border-gray-300">Not Active</Badge>;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      phone: '',
      role: 'cashier',
      password: '',
    });
  };

  const handleAddUser = async () => {
    if (!formData.name || !formData.username || !formData.phone || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }

    // Check if username already exists
    if (users.some(u => u.username === formData.username)) {
      toast.error('Username already exists');
      return;
    }

    setIsLoading(true);

    const newUser: User = {
      id: `u${Date.now()}`,
      name: formData.name,
      username: formData.username,
      phone: formData.phone,
      role: formData.role,
      password: formData.password,
    };

    addUser(newUser);
    toast.success('User added successfully');
    setIsAddDialogOpen(false);
    resetForm();
    setIsLoading(false);
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    if (!formData.name || !formData.username || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    // Check if username already exists (excluding current user)
    if (users.some(u => u.username === formData.username && u.id !== editingUser.id)) {
      toast.error('Username already exists');
      return;
    }

    setIsLoading(true);

    updateUser(editingUser.id, {
      name: formData.name,
      username: formData.username,
      phone: formData.phone,
      role: formData.role,
    });

    toast.success('User updated successfully');
    setIsEditDialogOpen(false);
    setEditingUser(null);
    resetForm();
    setIsLoading(false);
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser) return;

    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    updateUser(resetPasswordUser.id, {
      password: newPassword,
    });

    toast.success('Password reset successfully');
    setIsResetPasswordDialogOpen(false);
    setResetPasswordUser(null);
    setNewPassword('');
    setIsLoading(false);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const openResetPasswordDialog = (user: User) => {
    setResetPasswordUser(user);
    setNewPassword('');
    setIsResetPasswordDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    deleteUser(user.id);
    toast.success(`User "${user.name}" deleted successfully`);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      admin: 'bg-purple-600',
      cashier: 'bg-blue-600',
      waiter: 'bg-green-600',
      kitchen: 'bg-orange-600',
    };
    return colors[role];
  };

  const canDeleteUser = (user: User) => {
    // Cannot delete admin users
    if (user.role === 'admin') return false;
    // Cannot delete currently logged-in user
    if (user.id === currentUser?.id) return false;
    return true;
  };

  const getDeleteTooltip = (user: User) => {
    if (user.role === 'admin') return 'Cannot delete admin users';
    if (user.id === currentUser?.id) return 'You cannot delete your own account';
    return '';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl mb-2">User Management</h2>
            <p className="text-gray-600">Manage staff users and assign roles</p>
          </div>
          {currentUser?.role === 'admin' && (
            <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          )}
        </div>

        {/* Users List */}
        <Card className="overflow-hidden shadow-sm">
          {users.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl mb-2">No Users Found</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first user</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium">Name</th>
                    <th className="text-left p-4 text-sm font-medium">Username</th>
                    <th className="text-left p-4 text-sm font-medium">Phone</th>
                    <th className="text-left p-4 text-sm font-medium">Role</th>
                    {currentUser?.role === 'admin' && <th className="text-left p-4 text-sm font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4 font-medium">
                        {user.name}
                        {user.id === currentUser?.id && (
                          <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                        )}
                      </td>
                      <td className="p-4 font-mono text-sm">{user.username}</td>
                      <td className="p-4 text-sm">{user.phone}</td>
                      <td className="p-4">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role.toUpperCase()}
                        </Badge>
                        {getRoleStatusBadge(user.role)}
                      </td>
                      {currentUser?.role === 'admin' && (
                        <td className="p-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <EllipsisVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openResetPasswordDialog(user)}>
                                        <KeyRound className="w-4 h-4 mr-2" />
                                        Reset Password
                                      </DropdownMenuItem>
                                      {canDeleteUser(user) ? (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                              <Trash2 className="w-4 h-4 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Are you sure you want to delete {user.name}? This action cannot be undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction 
                                                onClick={() => handleDeleteUser(user)}
                                                className="bg-red-600 hover:bg-red-700"
                                              >
                                                Delete
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      ) : (
                                        <DropdownMenuItem disabled className="text-gray-400">
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TooltipTrigger>
                              {!canDeleteUser(user) && (
                                <TooltipContent>
                                  <p>{getDeleteTooltip(user)}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new staff account for your business
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Full Name *</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-username">Username *</Label>
              <Input
                id="add-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-phone">Phone Number *</Label>
              <Input
                id="add-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-password">Password *</Label>
              <Input
                id="add-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-role">Role *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['admin', 'cashier', 'waiter', 'kitchen'] as UserRole[]).map(role => {
                    const roleActive = isRoleActive(role);
                    return (
                      <SelectItem 
                        key={role} 
                        value={role} 
                        disabled={!roleActive}
                        className={!roleActive ? 'opacity-50' : ''}
                      >
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{role}</span>
                          {!roleActive && <Lock className="w-3 h-3 text-gray-400" />}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {!isRoleActive(formData.role) && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  ⚠️ This role is not active for your business type
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-username">Username *</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Role *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['admin', 'cashier', 'waiter', 'kitchen'] as UserRole[]).map(role => {
                    const roleActive = isRoleActive(role);
                    return (
                      <SelectItem 
                        key={role} 
                        value={role} 
                        disabled={!roleActive}
                        className={!roleActive ? 'opacity-50' : ''}
                      >
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{role}</span>
                          {!roleActive && <Lock className="w-3 h-3 text-gray-400" />}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditingUser(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {resetPasswordUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password *</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsResetPasswordDialogOpen(false);
              setResetPasswordUser(null);
              setNewPassword('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}