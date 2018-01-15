import * as angular from 'angular';
import {Layer} from '../model/Layout';
angular
    .module('reality-gallery')
    .filter('layout', function () {
        return Layer.ProperName;
    });