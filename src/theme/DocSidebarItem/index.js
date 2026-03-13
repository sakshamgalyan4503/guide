import React, {useState, useEffect} from "react";
import clsx from "clsx";
import {useLocation} from "@docusaurus/router";
import iconMap from "./iconMap";
import {ChevronDown, ChevronRight} from "lucide-react";
import Link from "@docusaurus/Link";

// Count all leaf (doc/link) items inside a category, recursively
function countLeafItems(items) {
  if (!items) return 0;
  return items.reduce((total, child) => {
    if (child.type === "category") {
      return total + countLeafItems(child.items);
    }
    return total + 1;
  }, 0);
}

export default function DocSidebarItemLink({item, depth = 0}) {
  const {href, label, className, type, items} = item;
  const location = useLocation();

  const active =
    href && (location.pathname === href || location.pathname.startsWith(href + "/"));

  const key = label?.toLowerCase().replace(/\s+/g, "-");
  const icon = iconMap[key];
  const iconSrc = active ? icon?.active : icon?.default;

  // Check if any child item is active
  const hasActiveChild = (items) => {
    return items?.some(child => {
      if (child.type === "category") {
        return hasActiveChild(child.items);
      }
      const childHref = child.href;
      return location.pathname === childHref || location.pathname.startsWith(childHref + "/");
    });
  };

  // Initialize collapsed state based on whether any child is active
  const [collapsed, setCollapsed] = useState(!hasActiveChild(items));
  
  // Update collapsed state when location changes
  useEffect(() => {
    if (hasActiveChild(items)) {
      setCollapsed(false);
    }
  }, [location.pathname]);

  // 📂 Category
  if (type === "category") {
    const count = countLeafItems(items);

    // ── depth 0 = STATIC: always expanded, no collapse ──
    if (depth === 0) {
      return (
        <li className="menu__list-item sidebar-group">
          <div className="sidebar-section-header sidebar-section-header--static">
            {iconSrc && <img src={iconSrc} alt="" className="sidebar-icon" />}
            <span className="sidebar-section-label">{label}</span>
            <span className="sidebar-section-count">({count})</span>
          </div>

          <ul className="menu__list sidebar-group-items">
            {items?.map((child, i) => (
              <DocSidebarItemLink key={i} item={child} depth={depth + 1} />
            ))}
          </ul>
        </li>
      );
    }

    // ── depth 1+ = COLLAPSIBLE ──
    const toggle = () => setCollapsed((prev) => !prev);

    return (
      <li className="menu__list-item sidebar-group">
        <div className="sidebar-section-header" onClick={toggle}>
          {iconSrc && <img src={iconSrc} alt="" className="sidebar-icon" />}
          <span className="sidebar-section-label">{label}</span>
          <span className="sidebar-section-count">({count})</span>
          {collapsed ? (
            <ChevronRight size={16} className="sidebar-chevron" />
          ) : (
            <ChevronDown size={16} className="sidebar-chevron" />
          )}
        </div>

        {!collapsed && (
          <ul className="menu__list sidebar-group-items">
            {items?.map((child, i) => (
              <DocSidebarItemLink key={i} item={child} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  // 📄 Normal doc/link
  return (
    <li className="menu__list-item">
      <Link
        className={clsx(
          "menu__link sidebar-link-with-icon",
          className,
          active && "menu__link--active"
        )}
        to={href}
      >
        {iconSrc && <img src={iconSrc} alt="" className="sidebar-icon" />}
        <span className="sidebar-text">{label}</span>
      </Link>
    </li>
  );
}