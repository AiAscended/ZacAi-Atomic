import { createElement, appendChildren, addListener } from "@utils/dom";

export interface NavLink {
  text: string;
  href: string;
  active?: boolean;
}

export const createNavigation = (
  brandName: string,
  links: NavLink[],
  onNavigate: (href: string) => void,
): HTMLElement => {
  const nav = createElement("nav", "nav-menu");

  const brand = createElement("a", "nav-brand");
  brand.href = "#";
  brand.textContent = brandName;
  addListener(brand, "click", (e) => {
    e.preventDefault();
    onNavigate("/");
  });

  const linksList = createElement("ul", "nav-links");

  links.forEach((link) => {
    const li = createElement("li");
    const a = createElement("a", `nav-link ${link.active ? "active" : ""}`);
    a.href = link.href;
    a.textContent = link.text;

    addListener(a, "click", (e) => {
      e.preventDefault();
      onNavigate(link.href);
    });

    li.appendChild(a);
    linksList.appendChild(li);
  });

  appendChildren(nav, brand, linksList);
  return nav;
};

export const updateActiveLink = (
  nav: HTMLElement,
  activeHref: string,
): void => {
  const links = nav.querySelectorAll(".nav-link");
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === activeHref) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
};
