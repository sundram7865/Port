// TS 5.6+ raises TS2882 for side-effect imports of non-code files. Next's own
// ambient types cover CSS Modules but not a bare global stylesheet import, so
// the one we use in the root layout is declared here.
declare module "*.css";
