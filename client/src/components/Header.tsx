interface HeaderProps {
  title: string;
  description: string;
}

export default function Header({
  title,
  description,
}: HeaderProps) {
  return (
    <header className="top-header">

      <div>

        <h1 className="page-title">
          {title}
        </h1>

        <p className="page-description">
          {description}
        </p>

      </div>


      <div className="header-right">

        <div className="ai-status">
          <span className="status-dot" />

          <span>
            AI-assisted
          </span>
        </div>

        <div className="user-avatar">
          HSE
        </div>

      </div>

    </header>
  );
}