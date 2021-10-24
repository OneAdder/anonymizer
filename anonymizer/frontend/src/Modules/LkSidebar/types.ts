

export type iSidebarItem = {
    url: string | string[];
    icon: JSX.Element;
    active: boolean;
    desc: string;
}

export type iSidebar = {
    items: iSidebarItem[];
}
