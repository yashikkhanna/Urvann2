import { useState } from "react";
import { FaFilter } from "react-icons/fa";
import "./SidebarToggle.css";

export default function SidebarToggle({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Floating Filter Button (show only if sidebar is closed) */}
      {!open && (
        <button onClick={() => setOpen(true)} className="filter-button">
          <FaFilter size={20} />
        </button>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${open ? "open" : ""}`}>
        {/* Close Button */}
        <button className="close-btn" onClick={() => setOpen(false)}>
          ✖
        </button>

        {/* Sidebar Content */}
        <div className="sidebar-content">{children}</div>
      </div>
    </div>
  );
}
