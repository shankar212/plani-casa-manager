import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface AnimatedRoutesProps {
  children: ReactNode;
}

export const AnimatedRoutes = ({ children }: AnimatedRoutesProps) => {
  const location = useLocation();
  
  return (
    <div 
      key={location.pathname}
      className="animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      {children}
    </div>
  );
};
