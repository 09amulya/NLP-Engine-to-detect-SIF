interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const navigation = [
  {
    section: "Overview",
    items: [
      {
        id: "overview",
        label: "Overview",
        icon: "⌂",
      },
    ],
  },
  {
    section: "Analysis",
    items: [
      {
        id: "reports",
        label: "Safety Reports",
        icon: "▤",
      },
      {
        id: "sif",
        label: "SIF Analysis",
        icon: "⚠",
      },
      {
        id: "precursors",
        label: "Precursor Intelligence",
        icon: "⌕",
      },
    ],
  },
  {
    section: "HSE",
    items: [
      {
        id: "priorities",
        label: "HSE Priorities",
        icon: "◆",
      },
      {
        id: "monitoring",
        label: "Intervention Monitoring",
        icon: "↗",
      },
    ],
  },
];

export default function Sidebar({
  activePage,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="sidebar">

      <div className="brand">

        <div className="brand-icon">
          🛡
        </div>

        <div>
          <div className="brand-title">
            PreCuria
          </div>

          <div className="brand-subtitle">
            AI-Intelligence Platform
          </div>
        </div>

      </div>


      <nav className="sidebar-nav">

        {navigation.map((group) => (
          <div
            className="nav-group"
            key={group.section}
          >

            <div className="nav-section-title">
              {group.section}
            </div>

            {group.items.map((item) => {

              const active =
                activePage === item.id;

              return (
                <button
                  key={item.id}
                  className={`nav-item ${
                    active ? "active" : ""
                  }`}
                  onClick={() =>
                    onNavigate(item.id)
                  }
                >

                  <span className="nav-icon">
                    {item.icon}
                  </span>

                  <span>
                    {item.label}
                  </span>

                </button>
              );
            })}

          </div>
        ))}

      </nav>


      <div className="sidebar-footer">

        <div className="system-status">

          <span className="status-dot" />

          <div>
            <div className="status-title">
              AI Pipeline
            </div>

            <div className="status-text">
              Ready
            </div>
          </div>

        </div>

      </div>

    </aside>
  );
}