import React from "react";
import "../App.css";

// UserTable component to display user data in a table format
const UserTable = ({ users, selectedIds, onSelect, onBlock }) => {
  return (
    <div className="login-left" style={{ maxWidth: "1000px", padding: "2rem" }}>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === users.length && users.length > 0}
                  onChange={() => onSelect("all")}
                  style={{ cursor: "pointer" }}
                />
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Email</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Last Login</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "12px" }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => onSelect(user.id)}
                    style={{ cursor: "pointer" }}
                  />
                </td>
                <td style={{ padding: "12px" }}>{user.name}</td>
                <td style={{ padding: "12px", textAlign: "center" }}>{user.email}</td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {user.lastLogin || "Never"}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {user.status === "active" ? "✅" : "❌"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      // Button to block selected users
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => onBlock(selectedIds)}
          disabled={selectedIds.length === 0}
          className="login-btn"
          style={{ width: "150px" }}
        >
          Block Users
        </button>
      </div>
    </div>
  );
};

export default UserTable;