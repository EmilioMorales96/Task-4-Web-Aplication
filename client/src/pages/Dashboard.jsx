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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

      // Validación defensiva
      if (!res.data || !Array.isArray(res.data.users)) {
        throw new Error("Invalid user data from server");
      }

      setUsers(res.data.users);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to fetch users.");
        console.error("Fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectAll = (e) => {
    setSelectedUsers(e.target.checked ? users.map((u) => u.id) : []);
  };

  const handleSelect = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const performAction = async (action) => {
    try {
      setError("");
      const token = localStorage.getItem("token");

      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/${action}`,
        { ids: selectedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchUsers();
      setSelectedUsers([]);
    } catch (err) {
      setError(`Failed to ${action} users.`);
      console.error(`Error in ${action}:`, err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = u.name || "";
    const email = u.email || "";
    return (
      name.toLowerCase().includes(filter.toLowerCase()) ||
      email.toLowerCase().includes(filter.toLowerCase())
    );
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="admin-panel" style={{ padding: 24 }}>
      <div
        className="dashboard-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2>Admin Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && (
        <p className="login-status error" aria-live="polite">
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div>
              <Button
                variant="contained"
                color="primary"
                style={{ marginRight: 8 }}
                onClick={() => performAction("block")}
                disabled={!selectedUsers.length}
              >
                🔒 Block
              </Button>
              <Button
                variant="contained"
                color="info"
                style={{ marginRight: 8 }}
                onClick={() => performAction("unblock")}
                disabled={!selectedUsers.length}
              >
                🔓 Unblock
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => performAction("delete")}
                disabled={!selectedUsers.length}
              >
                🗑 Delete
              </Button>
            </div>
            <TextField
              label="Filter"
              variant="outlined"
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <div className="dashboard-table-responsive">
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={
                          selectedUsers.length === users.length &&
                          users.length > 0
                        }
                        indeterminate={
                          selectedUsers.length > 0 &&
                          selectedUsers.length < users.length
                        }
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Last seen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      hover
                      selected={selectedUsers.includes(user.id)}
                      sx={{
                        backgroundColor: selectedUsers.includes(user.id)
                          ? "#e3f2fd"
                          : user.blocked
                          ? "#f5f5f5"
                          : "inherit",
                        textDecoration: user.blocked ? "line-through" : "none",
                        color: user.blocked ? "#bbb" : "inherit",
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelect(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <span
                          style={{
                            textDecoration: user.blocked ? "line-through" : "none",
                            color: user.blocked ? "#888" : "inherit",
                            fontWeight: 600,
                          }}
                        >
                          {user.name || "N/A"}
                        </span>
                        <div
                          style={{
                            fontSize: 13,
                            color: user.blocked ? "#bbb" : "#666",
                            textDecoration: user.blocked ? "line-through" : "none",
                          }}
                        >
                          {user.role || user.company || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>{user.email || "N/A"}</TableCell>
                      <TableCell>
                        <Tooltip
                          title={
                            user.last_seen
                              ? format(new Date(user.last_seen), "yyyy-MM-dd HH:mm:ss")
                              : "N/A"
                          }
                        >
                          <span>
                            {user.last_seen
                              ? formatDistanceToNow(new Date(user.last_seen), {
                                  addSuffix: true,
                                })
                              : "N/A"}
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminPanel;

