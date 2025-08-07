import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { User, UserPlus, Edit, Trash2, Mail, Calendar, Shield, MapPin, Home, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AdminUser = {
  id: number;
  username: string;
  email?: string;
  role: "admin" | "user";
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
};

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  // Fetch users
  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: "Bearer admin-token" }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });

  // Fetch addresses for selected user
  const { data: userAddresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["/api/admin/users", selectedUser?.id, "addresses"],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      const response = await fetch(`/api/admin/users/${selectedUser.id}/addresses`, {
        headers: { Authorization: "Bearer admin-token" }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user addresses');
      }
      return response.json();
    },
    enabled: !!selectedUser?.id,
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { username: string; email: string; password: string; role: string }) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer admin-token"
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowCreateDialog(false);
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: number; updates: Partial<AdminUser> }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer admin-token"
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowEditDialog(false);
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer admin-token" }
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as string,
    };
    createUserMutation.mutate(userData);
  };

  const handleEditUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const formData = new FormData(e.currentTarget);
    const updates = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as "admin" | "user",
      isActive: formData.get("isActive") === "true",
    };
    updateUserMutation.mutate({ userId: selectedUser.id, updates });
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleColor = (role: string) => {
    return role === "admin" ? "bg-purple-500" : "bg-blue-500";
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500" : "bg-red-500";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#8B4B6B] mb-2">User Management</h1>
          <p className="text-gray-600">Manage system users and administrators</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#8B4B6B] hover:bg-[#7A4A5A]">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="user">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">All Users ({users?.length || 0})</h2>
          
          {users?.map((user) => (
            <Card 
              key={user.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedUser?.id === user.id ? 'ring-2 ring-[#8B4B6B]' : ''
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user.username}
                    </h3>
                    {user.email && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={`${getRoleColor(user.role)} text-white`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                    <Badge className={`${getStatusColor(user.isActive)} text-white`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}

          {(!users || users.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          )}
        </div>

        {/* User Details */}
        <div>
          {selectedUser ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{selectedUser.username}</span>
                  <div className="flex gap-2">
                    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditUser} className="space-y-4">
                          <div>
                            <Label htmlFor="edit-username">Username</Label>
                            <Input 
                              id="edit-username" 
                              name="username" 
                              defaultValue={selectedUser.username}
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-email">Email</Label>
                            <Input 
                              id="edit-email" 
                              name="email" 
                              type="email"
                              defaultValue={selectedUser.email || ''}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-role">Role</Label>
                            <Select name="role" defaultValue={selectedUser.role}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="edit-status">Status</Label>
                            <Select name="isActive" defaultValue={selectedUser.isActive.toString()}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="submit" disabled={updateUserMutation.isPending}>
                            {updateUserMutation.isPending ? "Updating..." : "Update User"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      disabled={deleteUserMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Information */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    User Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Username:</span>
                      <span>{selectedUser.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedUser.email || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <Badge className={`${getRoleColor(selectedUser.role)} text-white`}>
                        {selectedUser.role}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={`${getStatusColor(selectedUser.isActive)} text-white`}>
                        {selectedUser.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Account Details */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Account Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
                    </div>
                    {selectedUser.lastLogin && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Login:</span>
                        <span>{new Date(selectedUser.lastLogin).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Shipping Addresses */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Shipping Addresses
                  </h4>
                  {addressesLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading addresses...</div>
                  ) : userAddresses && userAddresses.length > 0 ? (
                    <div className="space-y-3">
                      {userAddresses.map((address: any) => (
                        <div key={address.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{address.name}</span>
                              {address.isDefault && (
                                <Badge className="bg-green-500 text-white text-xs">Default</Badge>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div><strong>Recipient:</strong> {address.recipientName}</div>
                            <div><strong>Phone:</strong> {address.phone}</div>
                            <div><strong>Address:</strong> {address.addressLine1}</div>
                            {address.addressLine2 && (
                              <div className="ml-16">{address.addressLine2}</div>
                            )}
                            <div><strong>City:</strong> {address.city}, {address.state} {address.zipCode}</div>
                            <div><strong>Country:</strong> {address.country}</div>
                            {address.deliveryInstructions && (
                              <div><strong>Instructions:</strong> {address.deliveryInstructions}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No shipping addresses saved</p>
                      <p className="text-xs">Customer will add addresses during checkout or registration</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Select a user to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}