import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageFrameProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageFrame({
  breadcrumbs,
  title,
  description,
  actions,
  children,
  className,
}: PageFrameProps) {
  return (
    <div className="flex flex-col flex-1 h-full w-full max-w-[1780px] 2xl:max-w-none mx-auto p-4 sm:p-6 lg:p-8 2xl:p-10 space-y-6 2xl:space-y-8 transition-all duration-200">
      
      {/* Header Section: Breadcrumbs + Title + Actions */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-1 text-sm lg:text-base text-muted-foreground">
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={item.label}>
                  {item.href ? (
                    <Link to={item.href} className="hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">{item.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground/50 mx-1" />
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Title and Description */}
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <div className="text-sm lg:text-base text-slate-500 mt-1 font-medium">{description}</div>
            )}
          </div>
        </div>

        {/* Actions (Buttons, Filters) */}
        {actions && (
          <div className="flex items-center space-x-3 self-start">
            {actions}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className={cn("flex-1", className)}>
        {children}
      </div>
    </div>
  )
}
