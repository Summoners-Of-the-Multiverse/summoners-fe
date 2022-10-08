import { matchRoutes, useLocation } from "react-router-dom";

export const useCurrentPath = (routes: {path: string}[]) => {
  const location = useLocation();
  const matches = matchRoutes(routes, location);

  if(!matches) return '';
  const [{ route }] = matches;
  return route.path ?? '';
}