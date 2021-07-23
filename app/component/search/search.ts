import * as angular from 'angular';
import { FORMERR } from 'dns';
import { Layout } from '../../model/Layout';
import { UrlUtils } from '../../utils/UrlUtils';
import { Menu } from './menu';
import { DefaultMenu, LayerMenu, ModeMenu, SizeMenu } from './menus';




export type SearchEvent = SearchModel;
export class SearchModel {
    Name: string;
    Size: number[] = [];
    Mode: string[] = [];
    Layer: number[] = [];
}

class Chip {
    Key: string;
    Value: string;
    Title: string;
}


class SearchComponent implements ng.IComponentController {
    public static $inject = ["$rootScope", "$state"];

    public IsSearchFocused: boolean = false;
    public IsSugestionsFocused: boolean = false;
    public get ShowSugestions(): boolean {
        var shouldShow = this.IsSearchFocused || this.IsSugestionsFocused;
        if (!shouldShow) {
            this.OptionsMenu = DefaultMenu;
        }
        return shouldShow;
    }

    public OptionsMenu: Menu = DefaultMenu;
    public Chips: Chip[] = [];
    private SearchModelData: SearchModel = new SearchModel();

    //
    public onSearch: (search: { event: SearchEvent }) => void;

    public constructor($rootScope, private $state) {
        this.InitFromUrl($state.params);
        // There's 2 instances of SearchComponent and while its not suposed for users
        // to change the aspect ratio we keep the instances in sync anyways.
        $rootScope.$on('$locationChangeSuccess', () => this.InitFromUrl(this.$state.params));
    }


    public OnQueryChange() {
        this.onSearch({ event: this.SearchModelData });
    }

    public OnClear(idx: number, chip: Chip) {
        this.Chips.splice(idx, 1);
        this.SearchModelData[chip.Key] = this.SearchModelData[chip.Key].filter(x => x != chip.Value);
        this.onSearch({ event: this.SearchModelData });
    }

    public OnMenuClick(menu: Menu) {
        if (menu.SubMenu) {
            this.OptionsMenu = menu;
        }
        else if (!this.IsSelected(menu)) {
            var searchModelKey = this.OptionsMenu.Value;
            this.Chips.push({
                Key: searchModelKey,
                Value: menu.Value,
                Title: menu.Title
            });
            this.SearchModelData[searchModelKey].push(menu.Value);
            this.OptionsMenu = DefaultMenu;

            this.onSearch({ event: this.SearchModelData });
        }
    }

    private IsSelected(menu: Menu): boolean {
        for (var chip of this.Chips) {
            if (chip.Key == this.OptionsMenu.Value && chip.Value == menu.Value) {
                return true;
            }
        }

        return false;
    }

    private InitFromUrl(params: any) {
        this.Chips = [];
        this.SearchModelData.Name = params.name;
        this.SearchModelData.Size = UrlUtils.ArrayFromUrl(params.size);
        this.SearchModelData.Mode = UrlUtils.ArrayFromUrl(params.mode);
        this.SearchModelData.Layer = UrlUtils.ArrayFromUrl(params.layer);

        for (var size of this.SearchModelData.Size) {
            for(var possibleSize of SizeMenu.SubMenu)
            {
                if(parseInt(possibleSize.Value) == size){
                    this.Chips.push({
                        Key: SizeMenu.Value,
                        Value: possibleSize.Value,
                        Title: possibleSize.Title
                    });
                }
            }
        }

        for (var mode of this.SearchModelData.Mode) {
            for(var possibleMode of ModeMenu.SubMenu)
            {
                if(possibleMode.Value == mode){
                    this.Chips.push({
                        Key: ModeMenu.Value,
                        Value: possibleMode.Value,
                        Title: possibleMode.Title
                    });
                }   
            }
        }

        for (var layer of this.SearchModelData.Layer) {
            for(var possibleSLayer of LayerMenu.SubMenu)
            {
                if(parseInt(possibleSLayer.Value) == layer){
                    this.Chips.push({
                        Key: ModeMenu.Value,
                        Value: possibleSLayer.Value,
                        Title: possibleSLayer.Title
                    });
                }
            }
        }
    }
}



angular
    .module('reality-gallery')
    .component('search', {
        templateUrl: './component/search/search.html',
        controller: SearchComponent,
        bindings: {
            onSearch: "&",
        }
    });
