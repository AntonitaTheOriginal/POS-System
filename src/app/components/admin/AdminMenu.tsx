import { useState } from "react";
import {
  EllipsisVertical,
  Search,
  Plus,
  Pencil,
  Trash2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { MenuItem, businessTypeConfigs } from "../../data/appData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { AdminLayout } from "./AdminLayout";

export function AdminMenu() {
  const {
    menuItems,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    updateMenuItem,
    addMenuItem,
    deleteMenuItem,
    currentUser,
    settings,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("all");

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] =
    useState(false);
  const [editingItem, setEditingItem] =
    useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Category management states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryEditName, setCategoryEditName] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "Starters",
    price: "",
    type: "veg" as "veg" | "nonveg",
    available: true,
  });

  // Check if current user is admin
  const isAdmin = currentUser?.role === "admin";

  // Get business configuration
  const businessConfig = businessTypeConfigs[settings.businessType];
  
  // Check if category is editable for current business type
  const isCategoryEditable = (category: string) => {
    return businessConfig.editableCategories.includes(category);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: categories[0] || "",
      price: "",
      type: "veg",
      available: true,
    });
  };

  const handleAddItem = async () => {
    if (
      !formData.name ||
      !formData.price ||
      !formData.category
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsLoading(true);

    const newItem: MenuItem = {
      id: `m${Date.now()}`,
      name: formData.name,
      category: formData.category,
      price: price,
      type: formData.type,
      available: formData.available,
    };

    addMenuItem(newItem);
    toast.success("Menu item added successfully");
    setIsAddDialogOpen(false);
    resetForm();
    setIsLoading(false);
  };

  const handleEditItem = async () => {
    if (!editingItem) return;

    if (
      !formData.name ||
      !formData.price ||
      !formData.category
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsLoading(true);

    updateMenuItem(editingItem.id, {
      name: formData.name,
      category: formData.category,
      price: price,
      type: formData.type,
      available: formData.available,
    });

    toast.success("Menu item updated successfully");
    setIsEditDialogOpen(false);
    setEditingItem(null);
    resetForm();
    setIsLoading(false);
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      type: item.type,
      available: item.available,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteItem = (item: MenuItem) => {
    deleteMenuItem(item.id);
    toast.success(`"${item.name}" deleted successfully`);
  };

  const toggleAvailability = (item: MenuItem) => {
    updateMenuItem(item.id, { available: !item.available });
    toast.success(
      `"${item.name}" ${!item.available ? "enabled" : "disabled"}`,
    );
  };

  // Filter items based on search and category
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim());
    setNewCategoryName("");
    toast.success(`Category "${newCategoryName}" added`);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !categoryEditName.trim()) return;
    updateCategory(editingCategory, categoryEditName.trim());
    setEditingCategory(null);
    setCategoryEditName("");
    toast.success("Category updated");
  };

  const handleDeleteCategory = (cat: string) => {
    const hasItems = menuItems.some(item => item.category === cat);
    if (hasItems) {
      toast.error("Cannot delete category with items. Move or delete items first.");
      return;
    }
    deleteCategory(cat);
    toast.success("Category deleted");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl mb-2">Menu Management</h2>
            <p className="text-gray-600">
              Manage menu items, prices, and availability
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Manage Categories
              </Button>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>
          )}
        </div>

        {/* Search and Filter Bar */}
        <Card className="p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Categories
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {categories.map((category) => {
          const items = filteredItems.filter(
            (item) => item.category === category,
          );

          if (
            items.length === 0 &&
            selectedCategory !== "all" &&
            selectedCategory !== category
          ) {
            return null;
          }

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-medium">
                  {category}
                </h3>
                {!isCategoryEditable(category) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                          <Lock className="w-3 h-3" />
                          <span>Locked</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This category cannot be edited for your business type</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {items.length === 0 ? (
                <Card className="p-8 text-center shadow-sm">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p className="text-gray-500">
                    No items in this category
                  </p>
                </Card>
              ) : (
                <Card className="overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium">
                            Type
                          </th>
                          <th className="text-left p-4 text-sm font-medium">
                            Item Name
                          </th>
                          <th className="text-left p-4 text-sm font-medium">
                            Price
                          </th>
                          <th className="text-left p-4 text-sm font-medium">
                            Available
                          </th>
                          {isAdmin && (
                            <th className="text-left p-4 text-sm font-medium">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b last:border-0 hover:bg-gray-50"
                          >
                            <td className="p-4">
                              {item.type === "veg" ? (
                                <div className="w-5 h-5 border-2 border-green-600 flex items-center justify-center">
                                  <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                                </div>
                              ) : (
                                <div className="w-5 h-5 border-2 border-red-600 flex items-center justify-center">
                                  <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
                                </div>
                              )}
                            </td>
                            <td className="p-4 font-medium">
                              {item.name}
                            </td>
                            <td className="p-4">
                              <span className="font-medium">
                                ₹{item.price}
                              </span>
                            </td>
                            <td className="p-4">
                              <Switch
                                checked={item.available}
                                onCheckedChange={() =>
                                  toggleAvailability(item)
                                }
                                disabled={!isAdmin}
                              />
                            </td>
                            {isAdmin && (
                              <td className="p-4">
                                <DropdownMenu modal={false}>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                    >
                                      <EllipsisVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        openEditDialog(item)
                                      }
                                    >
                                      <Pencil className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        toggleAvailability(item)
                                      }
                                    >
                                      {item.available
                                        ? "Disable"
                                        : "Enable"}
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                      <AlertDialogTrigger
                                        asChild
                                      >
                                        <DropdownMenuItem
                                          onSelect={(e) =>
                                            e.preventDefault()
                                          }
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Delete Item
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you
                                            want to delete "
                                            {item.name}"? This
                                            action cannot be
                                            undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() =>
                                              handleDeleteItem(
                                                item,
                                              )
                                            }
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Item Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogDescription>
              Add a new item to your restaurant menu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Item Name *</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                placeholder="e.g., Paneer Tikka"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-price">Price (₹) *</Label>
              <Input
                id="add-price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value,
                  })
                }
                placeholder="0"
                min="0"
                step="1"
              />
            </div>

            <div className="space-y-2">
              <Label>Type *</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={formData.type === "veg"}
                    onChange={() =>
                      setFormData({ ...formData, type: "veg" })
                    }
                    className="w-4 h-4"
                  />
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-green-600 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                    </div>
                    Veg
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={formData.type === "nonveg"}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        type: "nonveg",
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-red-600 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
                    </div>
                    Non-Veg
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="add-available">Available</Label>
              <Switch
                id="add-available"
                checked={formData.available}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    available: checked,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddItem}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the details of this menu item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Item Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                placeholder="e.g., Paneer Tikka"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (₹) *</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value,
                  })
                }
                placeholder="0"
                min="0"
                step="1"
              />
            </div>

            <div className="space-y-2">
              <Label>Type *</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="edit-type"
                    checked={formData.type === "veg"}
                    onChange={() =>
                      setFormData({ ...formData, type: "veg" })
                    }
                    className="w-4 h-4"
                  />
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-green-600 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                    </div>
                    Veg
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="edit-type"
                    checked={formData.type === "nonveg"}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        type: "nonveg",
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-red-600 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
                    </div>
                    Non-Veg
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit-available">Available</Label>
              <Switch
                id="edit-available"
                checked={formData.available}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    available: checked,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingItem(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditItem}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Categories Dialog */}
      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Add, edit, or delete menu categories
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="New category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button onClick={handleAddCategory}>Add</Button>
            </div>

            <div className="border rounded-lg divide-y">
              {categories.map((cat) => (
                <div key={cat} className="p-3 flex items-center justify-between">
                  {editingCategory === cat ? (
                    <div className="flex gap-2 flex-1 mr-2">
                      <Input
                        value={categoryEditName}
                        onChange={(e) => setCategoryEditName(e.target.value)}
                        className="h-8"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleUpdateCategory}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingCategory(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{cat}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(cat);
                            setCategoryEditName(cat);
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{cat}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCategory(cat)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}