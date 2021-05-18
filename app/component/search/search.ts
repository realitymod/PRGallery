import * as angular from 'angular';
import { Layout } from '../../model/Layout';

class Menu {
    Title: string;
    SubMenu?: Menu[];
    Value?: string;
}

export type SearchEvent = SearchModel;
export class SearchModel  {
    Name: string;
    Size: number;
    Mode: string;
    Layer: number;
}

class SearchViewModel  {
    Name: string;
    Size: string;
    Mode: string;
    Layer: string;
}


class SearchComponent implements ng.IComponentController {
    public static $inject = ["$timeout", "$state"];

    public IsSearchFocused: boolean = false;
    public IsSugestionsFocused: boolean = false;
    public get ShowSugestions(): boolean { 
        var shouldShow = this.IsSearchFocused || this.IsSugestionsFocused;
        if(!shouldShow){
            this.OptionsMenu = DefaultMenu;
        }
        return shouldShow;
    }

    public OptionsMenu: Menu = DefaultMenu;
    public SearchModel: SearchViewModel = new SearchViewModel();
    private SearchModelData: SearchModel = new SearchModel();

    //
    public onSearch: (search: {event: SearchEvent}) => void;

    public constructor(private $timeout: ng.ITimeoutService, $state) {
        this.InitFromUrl($state.params);
    }

  
    public OnQueryChange() {
        this.onSearch({event: this.SearchModelData});
    }

    public OnClear(key:string) {
      this.SearchModel[key] = undefined;
      this.SearchModelData[key] = undefined;
      this.onSearch({event: this.SearchModelData});
    }
    
    public OnMenuClick(menu: Menu) {
        if (menu.SubMenu)
        {
            this.OptionsMenu = menu;
        }
        else
        {
            var searchModelKey = this.OptionsMenu.Value;
            this.SearchModel[searchModelKey] = menu.Title;
            this.SearchModelData[searchModelKey] = menu.Value;
            this.OptionsMenu = DefaultMenu;
        }

        this.onSearch({event: this.SearchModelData});
    }

    private InitFromUrl(params: any) {
        this.SearchModelData.Name = params.name;
        this.SearchModelData.Size = params.size;
        this.SearchModelData.Mode = params.mode;
        this.SearchModelData.Layer = params.layer;


        if(params.size)
        {
            this.SearchModel.Size = DefaultMenu.SubMenu.filter(val => val.Value == "Size")[0].SubMenu.filter(x => x.Value == params.size)[0].Title;
        }

        if(params.mode)
        {
            this.SearchModel.Mode = DefaultMenu.SubMenu.filter(val => val.Value == "Mode")[0].SubMenu.filter(x => x.Value == params.mode)[0].Title;
        }

        if(params.layer)
        {
            this.SearchModel.Layer = DefaultMenu.SubMenu.filter(val => val.Value == "Layer")[0].SubMenu.filter(x => x.Value == params.layer)[0].Title;
        }
    }

    /**
     * A listener for any key pressed in the window.
     * This will then see if the seach input is already focused or not
     * if it is we ignore the event else we force the input to be focused.    
      private OnGlobalSearchInput(keyboardEvent: KeyboardEvent){
        if(this.SearchFocus){
            return;
        }

        this.SearchFocus= true;

        if(keyboardEvent.ctrlKey|| keyboardEvent.altKey || keyboardEvent.metaKey ){
            return;
        }

        var key = keyboardEvent.key;
        if(!this.validKeys.test(key)){
            return;
        }

        if(!this.Query){
            this.Query = keyboardEvent.key;
        }else{
            this.Query += keyboardEvent.key;
        }
        this.OnQueryChange();
    }
    */
}

const DefaultMenu: Menu = {
    Title: "Search Options",
    SubMenu: [
        {
            Title: "Mode Options",
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
        },
        {
            Title: "Size Options",
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
        },
        {
            Title: "Layer Options",
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
        }
    ]
};

angular
    .module('reality-gallery')
    .component('search', {
        templateUrl: './component/search/search.html',
        controller: SearchComponent,
        bindings: {
            onSearch: "&",
        }
    });
