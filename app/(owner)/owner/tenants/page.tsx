"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Loader2,
  UserPlus,
  UserMinus,
  Phone,
  Mail,
  BadgeCheck,
  Filter,
  Grid3X3,
  List,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { GetAllUsersAction, FollowUserAction, UnfollowUserAction } from "@/actions/user/UserAction";
import { UserResponse } from "@/types/property";

type ViewMode = "grid" | "list";

export default function TenantsPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [loadingFollow, setLoadingFollow] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<"ALL" | "RENTER" | "HOUSEOWNER">("RENTER");

  const fetchUsers = useCallback(async () => {
    if (!session?.user?.token) return;

    setIsLoading(true);
    try {
      // Pass role filter to API (undefined for ALL)
      const apiRole = roleFilter === "ALL" ? undefined : roleFilter;
      const result = await GetAllUsersAction(session.user.token, apiRole);

      if (result.success) {
        setUsers(result.data || []);
      } else {
        toast.error("Failed to load users", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to fetch users",
      });
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFollow = async (userId: string, currentlyFollowing: boolean) => {
    if (!session?.user?.token) return;

    setLoadingFollow(userId);
    try {
      const result = currentlyFollowing
        ? await UnfollowUserAction(userId, session.user.token)
        : await FollowUserAction(userId, session.user.token);

      if (result.success) {
        toast.success(currentlyFollowing ? "Unfollowed successfully" : "Following user");
        // Refresh user list to get updated isFollowing status
        fetchUsers();
      } else {
        toast.error("Action failed", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update follow status",
      });
    } finally {
      setLoadingFollow(null);
    }
  };

  // Filter users by search (role is filtered via API)
  const filteredUsers = users.filter((user) => {
    return (
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber.includes(searchQuery)
    );
  });

  // Stats (shown from current filtered results)
  const totalUsers = users.length;
  const followingCount = users.filter((u) => u.isFollowing).length;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "RENTER":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "HOUSEOWNER":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "ADMIN":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarGradient = (userId: string) => {
    const gradients = [
      "from-pink-500 to-rose-500",
      "from-violet-500 to-purple-500",
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-teal-500",
      "from-orange-500 to-amber-500",
      "from-indigo-500 to-blue-500",
    ];
    const index = userId.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              Tenants
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and connect with renters
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-xs text-muted-foreground">
                  {roleFilter === "RENTER" ? "Renters" : roleFilter === "HOUSEOWNER" ? "Owners" : "Total Users"}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredUsers.length}</p>
                <p className="text-xs text-muted-foreground">Search Results</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-card rounded-xl border border-border col-span-2 sm:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{followingCount}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setRoleFilter("RENTER")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                roleFilter === "RENTER"
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              }`}
            >
              Renters
            </button>
            <button
              onClick={() => setRoleFilter("HOUSEOWNER")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                roleFilter === "HOUSEOWNER"
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              }`}
            >
              Owners
            </button>
            <button
              onClick={() => setRoleFilter("ALL")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                roleFilter === "ALL"
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              }`}
            >
              All
            </button>
          </div>
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Users Grid/List */}
      {filteredUsers.length > 0 ? (
        viewMode === "grid" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative p-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center text-center">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.fullName}
                          className="w-20 h-20 rounded-full object-cover ring-4 ring-background shadow-lg"
                        />
                      ) : (
                        <div
                          className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarGradient(
                            user.userId
                          )} flex items-center justify-center ring-4 ring-background shadow-lg`}
                        >
                          <span className="text-2xl font-bold text-white">
                            {getInitials(user.fullName)}
                          </span>
                        </div>
                      )}

                      {/* Name & Role */}
                      <h3 className="mt-4 font-semibold text-lg">{user.fullName}</h3>
                      <span
                        className={`mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>

                      {/* Contact Info */}
                      <div className="mt-4 space-y-2 w-full">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 shrink-0" />
                          <span>{user.phoneNumber}</span>
                        </div>
                      </div>

                      {/* Follow Button */}
                      <Button
                        className="mt-4 w-full gap-2"
                        variant={user.isFollowing ? "outline" : "default"}
                        onClick={() => handleFollow(user.userId, user.isFollowing)}
                        disabled={loadingFollow === user.userId}
                      >
                        {loadingFollow === user.userId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : user.isFollowing ? (
                          <>
                            <UserMinus className="w-4 h-4" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Follow
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          // List View
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">User</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Contact</th>
                    <th className="text-center px-6 py-4 font-medium text-muted-foreground">Role</th>
                    <th className="text-center px-6 py-4 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence>
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(
                                  user.userId
                                )} flex items-center justify-center`}
                              >
                                <span className="text-sm font-medium text-white">
                                  {getInitials(user.fullName)}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              <p className="text-xs text-muted-foreground">
                                ID: {user.userId.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{user.phoneNumber}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <Button
                              size="sm"
                              variant={user.isFollowing ? "outline" : "default"}
                              onClick={() => handleFollow(user.userId, user.isFollowing)}
                              disabled={loadingFollow === user.userId}
                              className="gap-1"
                            >
                              {loadingFollow === user.userId ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : user.isFollowing ? (
                                <>
                                  <UserMinus className="w-3 h-3" />
                                  Unfollow
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3 h-3" />
                                  Follow
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No users found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {searchQuery
              ? "Try adjusting your search or filter criteria"
              : "Users will appear here once they register"}
          </p>
        </motion.div>
      )}
    </div>
  );
}

