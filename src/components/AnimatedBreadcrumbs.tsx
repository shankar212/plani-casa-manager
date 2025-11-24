import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

export const AnimatedBreadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="contents">
            <BreadcrumbItem
              style={{
                animationDelay: `${index * 0.05}s`,
              }}
            >
              {crumb.current ? (
                <BreadcrumbPage className="font-medium">
                  {crumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.href || "#"}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator
                style={{
                  animationDelay: `${index * 0.05 + 0.025}s`,
                }}
              />
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
