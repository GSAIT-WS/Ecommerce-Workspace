import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === "POP") return;

    /* `instant`, not `smooth`, despite html{scroll-behavior:smooth} — the new
       page fades in over 180ms from the top, so an animated scroll would drift
       and fight that entrance. Long same-page jumps still ease via CSS. */
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, navType]);

  return null;
};

export default ScrollToTop;
