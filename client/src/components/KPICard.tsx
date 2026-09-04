interface KPICardProps {
  label: string;
  value: number | string;
  description?: string;
  icon: string;
}

export default function KPICard({
  label,
  value,
  description,
  icon,
}: KPICardProps) {
  return (
    <div className="kpi-card">

      <div className="kpi-top">

        <div className="kpi-icon">
          {icon}
        </div>

      </div>

      <div className="kpi-value">
        {value}
      </div>

      <div className="kpi-label">
        {label}
      </div>

      {description && (
        <div className="kpi-description">
          {description}
        </div>
      )}

    </div>
  );
}