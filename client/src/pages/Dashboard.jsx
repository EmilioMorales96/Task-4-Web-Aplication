import { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow, format } from "date-fns";
import {
  Tooltip,
  Checkbox,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    action: null,
    isSelfAction: false
  });
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const navigate = useNavigate();

  // Obtener usuario actual y usuarios
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrentUser(response.data);
      } catch (err) {
        console.error("Error fetching current user:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(res.data);
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchUsers();

    const pollingInterval = setInterval(() => {
      fetchCurrentUser();
      fetchUsers();
    }, 30000);

    return () => clearInterval(pollingInterval);
  }, [navigate, lastUpdate]);

  const handleApiError = (err) => {
    if (err.response) {
      if (err.response.status === 401) {
        navigate("/login");
      } else if (err.response.status === 403) {
        navigate("/login", { state: { logoutReason: "You have been blocked by an administrator." } });
      } else {
        setError("Failed to fetch users.");
        showSnackbar("Failed to fetch users", "error");
        console.error("API Error:", err);
      }
    } else {
      setError("Network error occurred.");
      showSnackbar("Network error occurred", "error");
      console.error("Network Error:", err);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const checkUserStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "blocked") {
        localStorage.removeItem("token");
        navigate("/login", { state: { logoutReason: "Your account has been blocked" } });
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleSelect = async (id) => {
    const isActive = await checkUserStatus();
    if (!isActive) return;

    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = async (e) => {
    const isActive = await checkUserStatus();
    if (!isActive) return;

    setSelectedUsers(e.target.checked ? users.map((u) => u.id) : []);
  };

  const showConfirmationDialog = (action) => {
    const isSelfAction = selectedUsers.includes(currentUser?.id);

    const actions = {
      block: {
        title: isSelfAction ? "⚠️ Confirm Self-Block" : "Confirm Block",
        message: isSelfAction
          ? "You are about to BLOCK YOURSELF. This will immediately log you out. Continue?"
          : `Block ${selectedUsers.length} user(s)?`
      },
      unblock: {
        title: "Confirm Unblock",
        message: `Unblock ${selectedUsers.length} user(s)?`
      },
      delete: {
        title: "Confirm Deletion",
        message: `Permanently delete ${selectedUsers.length} user(s)?`
      }
    };

    setConfirmDialog({
      open: true,
      action,
      isSelfAction,
      ...actions[action]
    });
  };

  const performAction = async (action) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/${action}`,
        { ids: selectedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showSnackbar(response.data.message || `${action} successful!`);
      setLastUpdate(Date.now());

      if (confirmDialog.isSelfAction && action === "block") {
        setTimeout(() => {
          localStorage.removeItem("token");
          navigate("/login");
        }, 1500);
      } else {
        // Actualizar lista usuarios
        setTimeout(() => fetchUsers(), 1000);
      }

      setSelectedUsers([]);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleConfirmAction = async () => {
    setConfirmDialog({ ...confirmDialog, open: false });
    await performAction(confirmDialog.action);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(filter.toLowerCase()) ||
      u.email?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="admin-panel" style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24
        }}
      >
        <h2>Admin Dashboard</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {currentUser && (
            <span style={{ fontWeight: 500 }}>
              Logged in as: {currentUser.name} ({currentUser.role})
            </span>
          )}
          <Button variant="contained" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {error && (
        <Alert severity="error" style={{ marginBottom: 16 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                variant="contained"
                color="error"
                onClick={() => showConfirmationDialog("block")}
                disabled={!selectedUsers.length}
              >
                🔒 Block
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => showConfirmationDialog("unblock")}
                disabled={!selectedUsers.length}
              >
                🔓 Unblock
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => showConfirmationDialog("delete")}
                disabled={
                  !selectedUsers.length || selectedUsers.includes(currentUser?.id)
                }
              >
                🗑 Delete
              </Button>
            </div>
            <TextField
              variant="outlined"
              placeholder="Search users by name or email"
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      onChange={handleSelectAll}
                      checked={selectedUsers.length === users.length && users.length > 0}
                      indeterminate={
                        selectedUsers.length > 0 && selectedUsers.length < users.length
                      }
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelect(user.id)}
                        />
                      </TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        {user.status === "active" ? (
                          <span style={{ color: "green" }}>Active</span>
                        ) : (
                          <span style={{ color: "red" }}>Blocked</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.lastLogin
                          ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
                          : "Never"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>{confirmDialog.message}</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={
              confirmDialog.action === "delete" ? "error" : "primary"
            }
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AdminPanel;
