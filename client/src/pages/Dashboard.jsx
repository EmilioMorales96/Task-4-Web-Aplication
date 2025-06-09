import { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
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

  // Obtener usuario actual desde la API
    useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      cconst response = await axios.get(
          `${import.meta.env.VITE_API_URL || "https://task-4-web-aplication-1.onrender.com"}/api/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrentUser(response.data);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
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
      const usersData = Array.isArray(res.data) ? res.data : (res.data.users || []);
      setUsers(usersData);
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

  const handleSelectAll = (e) => {
    setSelectedUsers(e.target.checked ? users.map(u => u.id) : []);
  };

  const handleSelect = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
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
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/${action}`,
        { ids: selectedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showSnackbar(response.data.message || `${action} successful!`);
      
      // Auto-logout if user blocked themselves
      if (confirmDialog.isSelfAction && action === "block") {
        showSnackbar("You have been blocked. Contact an administrator.", "warning");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        fetchUsers();
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
    u => u.name?.toLowerCase().includes(filter.toLowerCase()) ||
         u.email?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="admin-panel" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
      }}>
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

      {error && <Alert severity="error" style={{ marginBottom: 16 }}>{error}</Alert>}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}>
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
                disabled={!selectedUsers.length || selectedUsers.includes(currentUser?.id)}
              >
                🗑 Delete
              </Button>
            </div>
            <TextField
              label="Filter users"
              variant="outlined"
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: "250px" }}
            />
          </div>

          <div className="dashboard-table-responsive">
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.length === users.length && users.length > 0}
                        indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last seen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const isBlocked = user.status === "blocked";
                    const lastSeen = user.last_login;
                    const isCurrentUser = user.id === currentUser?.id;
                    
                    return (
                      <TableRow
                        key={user.id}
                        hover
                        selected={selectedUsers.includes(user.id)}
                        style={{
                          backgroundColor: selectedUsers.includes(user.id) 
                            ? "#e3f2fd" 
                            : isBlocked 
                              ? "#fff9f9" 
                              : "inherit",
                          opacity: isBlocked ? 0.8 : 1
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelect(user.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div style={{ 
                            fontWeight: 600,
                            color: isBlocked ? "#888" : "inherit",
                            textDecoration: isBlocked ? "line-through" : "none"
                          }}>
                            {user.name}
                            {isCurrentUser && (
                              <span style={{ 
                                marginLeft: "8px",
                                fontSize: "0.8em",
                                color: "#3f51b5",
                                fontWeight: "normal"
                              }}>
                                (You)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor: user.role === "admin" ? "#e3f2fd" : "#f1f1f1",
                            color: user.role === "admin" ? "#1976d2" : "#555",
                            fontSize: "0.8em",
                            fontWeight: 500
                          }}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor: isBlocked ? "#ffebee" : "#e8f5e9",
                            color: isBlocked ? "#c62828" : "#2e7d32",
                            fontSize: "0.8em",
                            fontWeight: 500
                          }}>
                            {user.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={lastSeen ? format(new Date(lastSeen), "yyyy-MM-dd HH:mm:ss") : "Never"}
                          >
                            <span style={{ fontSize: "0.9em" }}>
                              {lastSeen
                                ? formatDistanceToNow(new Date(lastSeen), { addSuffix: true })
                                : "Never"}
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <p>{confirmDialog.message}</p>
          {confirmDialog.isSelfAction && (
            <Alert severity="warning" style={{ marginTop: "16px" }}>
              You will lose access immediately after this action!
            </Alert>
          )}
          {confirmDialog.action === "delete" && (
            <Alert severity="error" style={{ marginTop: "16px" }}>
              This action cannot be undone!
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color={
              confirmDialog.action === "delete" ? "error" : 
              confirmDialog.isSelfAction ? "warning" : "primary"
            }
            variant="contained"
          >
            {confirmDialog.isSelfAction ? "I Understand" : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AdminPanel;
