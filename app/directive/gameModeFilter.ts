import * as angular from 'angular';
import {GameMode} from '../model/Layout';

angular
    .module('reality-gallery')
    .filter('gamemode', function () {
        return GameMode.ProperName;
    });