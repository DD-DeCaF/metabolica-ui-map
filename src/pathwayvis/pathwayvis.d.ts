
declare module "*.html" {
  const template: string;
  export default template;
}

declare module "*.json" {
  const json: string;
  export default json;
}

declare module "*.svg" {
  const content: any;
  export default content;
}
