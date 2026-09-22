/**
 * Sets `data-theme` before first paint.
 *
 * This has to be a blocking inline script in <head>. Doing it in an effect
 * means React has already painted the default theme, which is a visible flash
 * for anyone whose preference differs from the default, and a real layout
 * shift if the two themes size anything differently.
 */
const script = `(function(){try{var s=localStorage.getItem("theme");var m=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.setAttribute("data-theme",s==="light"||s==="dark"?s:(m?"dark":"light"));}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
