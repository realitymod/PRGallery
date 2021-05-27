import { Menu } from "./menu";

export const ModeMenu: Menu = {
    Title: "Modes",
    Value: "Mode",
    SubMenu: [
        {
            Title: "AAS",
            Value: "gpm_cq",
        },
        {
            Title: "Insurgency",
            Value: "gpm_insurgency",
        },
        {
            Title: "Skirmish",
            Value: "gpm_skirmish",
        },
        {
            Title: "CNC",
            Value: "gpm_cnc",
        },
        {
            Title: "Vehicle Warfare",
            Value: "gpm_vehicles",
        },
        {
            Title: "CO-OP",
            Value: "gpm_coop",
        },
        {
            Title: "Objective",
            Value: "gpm_objective",
        }
    ],
};
export const SizeMenu: Menu = {
    Title: "Sizes",
    Value: "Size",
    SubMenu: [
        {
            Title: "1 Km",
            Value: "1",
        },
        {
            Title: "2 Km",
            Value: "2",
        },
        {
            Title: "4 Km",
            Value: "4",
        },
        {
            Title: "8 Km",
            Value: "8",
        }
    ],
};

export const LayerMenu: Menu = {
    Title: "Layers",
    Value: "Layer",
    SubMenu: [
        {
            Title: "Infantry",
            Value: "16",
        },
        {
            Title: "Alternative",
            Value: "32",
        }, {
            Title: "Standard",
            Value: "64",
        }
        , {
            Title: "Large",
            Value: "128",
        }
    ],
};

export const DefaultMenu: Menu = {
    Title: "Search",
    SubMenu: [
        ModeMenu,
        SizeMenu,
        LayerMenu
    ]
};
