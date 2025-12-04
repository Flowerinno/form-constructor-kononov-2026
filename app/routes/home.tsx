import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

/**
 * Description placeholder
 *
 * @export
 * @param {Route.MetaArgs} param0 
 * @returns {{}} 
 */
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Form constructor" },
  ];
}

/**
 * Description placeholder
 *
 * @export
 * @returns {*} 
 */
export default function Home() {
  return <p>redirect</p>;
}
